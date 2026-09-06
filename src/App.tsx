/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardColor,
  GameMode,
  GameSettings,
  GameStatus,
  Player,
} from './types';
import {
  createStandardDeck,
  shuffleDeck,
  isCardPlayable,
  chooseAIBotMove,
  calculateRoundScore,
} from './utils/deck';
import { sounds } from './utils/audio';
import { GameBoard } from './components/GameBoard';
import { PlayerHand } from './components/PlayerHand';
import { ColorPickerModal } from './components/ColorPickerModal';
import { PassDeviceModal } from './components/PassDeviceModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { ExportApkModal } from './components/ExportApkModal';
import { SettingsModal } from './components/SettingsModal';
import {
  BookOpen,
  Bot,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  Smartphone,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  mode: 'pve',
  aiSpeed: 'normal',
  soundEnabled: true,
  enableStacking: true,
  enableJumpIn: false,
  onoPenaltyCards: 2,
  targetScore: 500,
};

export default function App() {
  // Game Setup & Status
  const [status, setStatus] = useState<GameStatus>('menu');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isTableMode, setIsTableMode] = useState(false);

  // In-Game State
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [activeColor, setActiveColor] = useState<CardColor>('red');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = clockwise, -1 = counter
  const [pendingDrawCount, setPendingDrawCount] = useState<number>(0);
  const [lastActionText, setLastActionText] = useState<string>('');
  const [winner, setWinner] = useState<Player | null>(null);
  const [roundScore, setRoundScore] = useState<number>(0);

  // Pending card that needs a color choice (for Wild)
  const pendingWildCardRef = useRef<Card | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound mute setting with sound engine
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  // Initialize a new match
  const startNewGame = useCallback(
    (mode: GameMode, playerCount: 2 | 3 | 4) => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

      sounds.shuffle();

      const newSettings: GameSettings = {
        ...settings,
        mode,
        playerCount,
      };
      setSettings(newSettings);

      // Create Players
      const newPlayers: Player[] = [];
      const avatars = ['🦊', '🐼', '🦁', '🐨'];

      if (mode === 'pve') {
        newPlayers.push({
          id: 'player-1',
          name: 'You',
          isAI: false,
          avatar: '🤠',
          hand: [],
          score: 0,
          hasCalledOno: false,
          canBeCaughtOno: false,
        });

        for (let i = 1; i < playerCount; i++) {
          newPlayers.push({
            id: `bot-${i}`,
            name: `Bot ${i}`,
            isAI: true,
            avatar: avatars[i - 1],
            hand: [],
            score: 0,
            hasCalledOno: false,
            canBeCaughtOno: false,
          });
        }
      } else {
        // Pass & Play Mode
        for (let i = 1; i <= playerCount; i++) {
          newPlayers.push({
            id: `player-${i}`,
            name: `Player ${i}`,
            isAI: false,
            avatar: avatars[i - 1],
            hand: [],
            score: 0,
            hasCalledOno: false,
            canBeCaughtOno: false,
          });
        }
      }

      // Prepare Deck
      const fullDeck = shuffleDeck(createStandardDeck());

      // Deal 7 cards to each player
      for (const p of newPlayers) {
        p.hand = fullDeck.splice(0, 7);
      }

      // Draw initial top discard card (ensure it's not wild for clean start)
      let initialTopCard = fullDeck.pop()!;
      while (initialTopCard.color === 'wild') {
        fullDeck.unshift(initialTopCard);
        initialTopCard = fullDeck.pop()!;
      }

      const initialColor = initialTopCard.color as CardColor;

      setDeck(fullDeck);
      setDiscardPile([initialTopCard]);
      setActiveColor(initialColor);
      setPlayers(newPlayers);
      setCurrentTurnIndex(0);
      setDirection(1);
      setPendingDrawCount(0);
      setWinner(null);
      setRoundScore(0);
      setLastActionText(`Game started! Top card is ${initialColor.toUpperCase()} ${initialTopCard.value}`);
      setStatus('playing');
    },
    [settings]
  );

  // Current active player & top card
  const activePlayer = players[currentTurnIndex] || null;
  const topCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  // Helper to advance turn
  const advanceTurn = useCallback(
    (
      step: number = 1,
      overrideDirection?: 1 | -1,
      customPlayers?: Player[]
    ) => {
      const currentDir = overrideDirection !== undefined ? overrideDirection : direction;
      const count = (customPlayers || players).length;
      const nextIndex = (currentTurnIndex + step * currentDir + count * 10) % count;

      setCurrentTurnIndex(nextIndex);

      const nextP = (customPlayers || players)[nextIndex];

      // If Pass & Play mode and not Table Mode, show device pass screen
      if (settings.mode === 'pass_and_play' && !isTableMode) {
        setIsPassModalOpen(true);
      }
    },
    [currentTurnIndex, direction, players, settings.mode, isTableMode]
  );

  // Draw cards helper (with reshuffling discard pile if deck runs out)
  const drawCardsForPlayer = useCallback(
    (playerIndex: number, count: number): { updatedPlayers: Player[]; updatedDeck: Card[] } => {
      let currentDeck = [...deck];
      let currentDiscard = [...discardPile];

      if (currentDeck.length < count) {
        // Reshuffle discard pile except top card
        const top = currentDiscard.pop()!;
        const recycled = shuffleDeck(currentDiscard);
        currentDeck = [...currentDeck, ...recycled];
        currentDiscard = [top];
        setDiscardPile(currentDiscard);
        sounds.shuffle();
      }

      const drawn = currentDeck.splice(0, count);
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        hand: [...updatedPlayers[playerIndex].hand, ...drawn],
        hasCalledOno: false,
        canBeCaughtOno: false,
      };

      setDeck(currentDeck);
      setPlayers(updatedPlayers);
      sounds.drawCard();

      return { updatedPlayers, updatedDeck: currentDeck };
    },
    [deck, discardPile, players]
  );

  // Player action: Click Draw Pile
  const handleHumanDraw = () => {
    if (!activePlayer || activePlayer.isAI || status !== 'playing') return;

    if (pendingDrawCount > 0) {
      // Must draw all stacked penalty cards!
      const countToDraw = pendingDrawCount;
      setPendingDrawCount(0);
      drawCardsForPlayer(currentTurnIndex, countToDraw);
      setLastActionText(`${activePlayer.name} drew ${countToDraw} penalty cards and skipped turn.`);
      advanceTurn(1);
    } else {
      // Draw single card
      const { updatedPlayers } = drawCardsForPlayer(currentTurnIndex, 1);
      setLastActionText(`${activePlayer.name} drew 1 card.`);
      advanceTurn(1, undefined, updatedPlayers);
    }
  };

  // Card Play Execution
  const executePlayCard = useCallback(
    (
      playerIndex: number,
      card: Card,
      chosenWildColor?: CardColor
    ) => {
      const player = players[playerIndex];
      if (!player) return;

      sounds.playCard();

      // Remove card from hand
      const newHand = player.hand.filter((c) => c.id !== card.id);
      const isWinner = newHand.length === 0;

      // Determine new active color
      let nextColor: CardColor = card.color;
      if (card.color === 'wild') {
        nextColor = chosenWildColor || 'blue';
        sounds.wildSound();
      }

      const updatedPlayer: Player = {
        ...player,
        hand: newHand,
        // If 1 card left, check if ONO was called
        hasCalledOno: newHand.length === 1 ? player.hasCalledOno : false,
        canBeCaughtOno: newHand.length === 1 && !player.hasCalledOno,
      };

      const updatedPlayers = [...players];
      updatedPlayers[playerIndex] = updatedPlayer;

      const updatedDiscard = [...discardPile, card];
      setDiscardPile(updatedDiscard);
      setActiveColor(nextColor);
      setPlayers(updatedPlayers);

      // Check WIN CONDITION
      if (isWinner) {
        sounds.winSound();
        const scoreEarned = calculateRoundScore(updatedPlayers, player.id);
        updatedPlayer.score += scoreEarned;
        setWinner(updatedPlayer);
        setRoundScore(scoreEarned);
        setStatus('game_over');
        setLastActionText(`${player.name} played their last card and WON!`);
        return;
      }

      // Check card effects
      let turnStep = 1;
      let newDirection = direction;

      if (card.value === 'reverse') {
        sounds.actionSound();
        if (players.length === 2) {
          // In 2 players, reverse acts like a Skip!
          turnStep = 2;
          setLastActionText(`${player.name} played Reverse (Skipped opponent!)`);
        } else {
          newDirection = (direction * -1) as 1 | -1;
          setDirection(newDirection);
          setLastActionText(`${player.name} played Reverse! Direction reversed.`);
        }
      } else if (card.value === 'skip') {
        sounds.actionSound();
        turnStep = 2;
        setLastActionText(`${player.name} played Skip! Next player skipped.`);
      } else if (card.value === 'draw2') {
        sounds.actionSound();
        if (settings.enableStacking) {
          setPendingDrawCount((prev) => prev + 2);
          turnStep = 1;
          setLastActionText(`${player.name} played Draw 2! Next player must stack or draw.`);
        } else {
          // Standard: next player immediately draws 2 and loses turn
          const nextIdx = (playerIndex + direction + players.length) % players.length;
          drawCardsForPlayer(nextIdx, 2);
          turnStep = 2;
          setLastActionText(`${player.name} played Draw 2! ${players[nextIdx].name} drew 2 and skipped.`);
        }
      } else if (card.value === 'wild_draw4') {
        sounds.actionSound();
        if (settings.enableStacking) {
          setPendingDrawCount((prev) => prev + 4);
          turnStep = 1;
          setLastActionText(`${player.name} played Wild Draw 4! Active color is ${nextColor.toUpperCase()}`);
        } else {
          const nextIdx = (playerIndex + direction + players.length) % players.length;
          drawCardsForPlayer(nextIdx, 4);
          turnStep = 2;
          setLastActionText(`${player.name} played Wild Draw 4! Color is ${nextColor.toUpperCase()}`);
        }
      } else {
        // Standard number or wild
        setLastActionText(
          `${player.name} played ${card.color === 'wild' ? 'Wild (' + nextColor.toUpperCase() + ')' : card.color.toUpperCase() + ' ' + card.value}`
        );
      }

      // Advance turn to next player
      const nextIndex = (playerIndex + turnStep * newDirection + players.length * 10) % players.length;
      setCurrentTurnIndex(nextIndex);

      if (settings.mode === 'pass_and_play' && !isTableMode) {
        setIsPassModalOpen(true);
      }
    },
    [direction, discardPile, drawCardsForPlayer, isTableMode, players, settings.enableStacking, settings.mode]
  );

  // Human click on a card in their hand
  const handleHumanPlayCard = (card: Card) => {
    if (!activePlayer || activePlayer.isAI || status !== 'playing') return;

    if (!isCardPlayable(card, topCard, activeColor, pendingDrawCount, settings.enableStacking)) {
      sounds.penaltySound();
      return;
    }

    // If wild card, open color selector modal
    if (card.color === 'wild') {
      pendingWildCardRef.current = card;
      setIsColorPickerOpen(true);
      return;
    }

    // Standard card play
    executePlayCard(currentTurnIndex, card);
  };

  // Color chosen by human from modal
  const handleColorSelected = (color: CardColor) => {
    setIsColorPickerOpen(false);
    if (pendingWildCardRef.current) {
      executePlayCard(currentTurnIndex, pendingWildCardRef.current, color);
      pendingWildCardRef.current = null;
    }
  };

  // Shout "ONO!" Button handler
  const handleCallOno = () => {
    if (!activePlayer) return;
    sounds.onoShout();

    const updated = [...players];
    updated[currentTurnIndex] = {
      ...updated[currentTurnIndex],
      hasCalledOno: true,
      canBeCaughtOno: false,
    };
    setPlayers(updated);
    setLastActionText(`${activePlayer.name} shouted "ONO!" with 1 card left! 🔥`);
  };

  // Catch an opponent who forgot to say ONO
  const handleCatchOno = (target: Player) => {
    const targetIdx = players.findIndex((p) => p.id === target.id);
    if (targetIdx === -1) return;

    sounds.penaltySound();
    drawCardsForPlayer(targetIdx, settings.onoPenaltyCards);
    setLastActionText(`CAUGHT! ${target.name} did not call ONO and drew +${settings.onoPenaltyCards} penalty cards!`);
  };

  // AI Turn Handling Effect
  useEffect(() => {
    if (status !== 'playing') return;
    if (!activePlayer || !activePlayer.isAI) return;

    const delayMap = {
      slow: 1400,
      normal: 900,
      fast: 400,
    };
    const delay = delayMap[settings.aiSpeed] || 900;

    aiTimeoutRef.current = setTimeout(() => {
      if (!topCard) return;

      const aiMove = chooseAIBotMove(
        activePlayer,
        topCard,
        activeColor,
        pendingDrawCount,
        settings.enableStacking
      );

      if (aiMove.action === 'play' && aiMove.card) {
        // If bot needs to shout ONO
        if (aiMove.shoutOno) {
          sounds.onoShout();
          const pList = [...players];
          pList[currentTurnIndex].hasCalledOno = true;
          setPlayers(pList);
        }

        executePlayCard(currentTurnIndex, aiMove.card, aiMove.chosenColor);
      } else {
        // AI must draw
        if (pendingDrawCount > 0) {
          const countToDraw = pendingDrawCount;
          setPendingDrawCount(0);
          drawCardsForPlayer(currentTurnIndex, countToDraw);
          setLastActionText(`${activePlayer.name} drew ${countToDraw} penalty cards and skipped turn.`);
          advanceTurn(1);
        } else {
          const { updatedPlayers } = drawCardsForPlayer(currentTurnIndex, 1);
          setLastActionText(`${activePlayer.name} drew a card.`);
          advanceTurn(1, undefined, updatedPlayers);
        }
      }
    }, delay);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [
    activePlayer,
    currentTurnIndex,
    status,
    activeColor,
    topCard,
    pendingDrawCount,
    settings.aiSpeed,
    settings.enableStacking,
    executePlayCard,
    drawCardsForPlayer,
    advanceTurn,
    players,
  ]);

  return (
    <div
      id="ono-game-app"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden font-sans"
    >
      {/* Top Navigation Bar */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setStatus('menu')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-blue-600 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300 text-xs">
                  ONO
                </span>
              </div>
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                ONO Game
                {status === 'playing' && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {settings.mode === 'pve' ? `vs ${settings.playerCount - 1} AI` : 'Pass & Play'}
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Export APK / Codemagic / itch.io Button */}
          <button
            id="btn-open-export"
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-900/30 cursor-pointer transition-all active:scale-95"
            title="Export Android APK via Codemagic and upload to itch.io"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">APK & itch.io Guide</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-toggle"
            onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Toggle Sound"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Rules Modal */}
          <button
            id="nav-rules-btn"
            onClick={() => setIsRulesOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Official Rules"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Settings Modal */}
          <button
            id="nav-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative">
        {status === 'menu' && (
          <div
            id="main-menu-view"
            className="w-full max-w-xl flex flex-col items-center text-center p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl my-auto animate-in fade-in duration-300"
          >
            {/* Logo Badge */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 p-1 mb-4 shadow-2xl shadow-red-950/50 -rotate-3 hover:rotate-0 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center">
                <span className="font-black italic text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400">
                  ONO
                </span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              ONO Card Game
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8">
              Play classic ONO with all official cards (Skip, Reverse, Draw 2, Wild +4), smart AI bots, or local multiplayer with friends.
            </p>

            {/* Mode Selectors */}
            <div className="w-full space-y-3 mb-6">
              {/* Single Player vs Computer */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Player vs Computer (AI)</h3>
                      <p className="text-xs text-slate-400">Challenge smart bots with real strategy</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      id={`btn-start-pve-${count}`}
                      onClick={() => startNewGame('pve', count as 2 | 3 | 4)}
                      className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{count} Players</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pass & Play Multiplayer */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Pass & Play Multiplayer</h3>
                      <p className="text-xs text-slate-400">Play on 1 phone/screen with secret anti-peek handoffs</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      id={`btn-start-pass-${count}`}
                      onClick={() => startNewGame('pass_and_play', count as 2 | 3 | 4)}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{count} Friends</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                onClick={() => setIsRulesOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>How to Play</span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Codemagic APK & itch.io Guide</span>
              </button>
            </div>
          </div>
        )}

        {status === 'playing' && activePlayer && (
          <div id="game-active-arena" className="w-full max-w-5xl flex flex-col justify-between flex-1">
            {/* Top Area: Opponents */}
            <div className="w-full flex items-center justify-around py-2 px-2">
              {players
                .filter((_, idx) => idx !== (settings.mode === 'pve' ? 0 : currentTurnIndex))
                .map((p) => {
                  const pIdx = players.findIndex((pl) => pl.id === p.id);
                  const isOpponentTurn = currentTurnIndex === pIdx;
                  return (
                    <PlayerHand
                      key={p.id}
                      player={p}
                      topCard={topCard}
                      activeColor={activeColor}
                      isCurrentTurn={isOpponentTurn}
                      onPlayCard={() => {}}
                      pendingDrawCount={pendingDrawCount}
                      enableStacking={settings.enableStacking}
                      isHuman={false}
                    />
                  );
                })}
            </div>

            {/* Middle Area: Center Felt Table */}
            <div className="my-auto py-2 flex items-center justify-center">
              <GameBoard
                deckCount={deck.length}
                topCard={topCard}
                discardPile={discardPile}
                activeColor={activeColor}
                direction={direction}
                isHumanTurn={!activePlayer.isAI}
                canDraw={!activePlayer.isAI}
                pendingDrawCount={pendingDrawCount}
                onDrawCard={handleHumanDraw}
                onCallOno={handleCallOno}
                onCatchOno={handleCatchOno}
                humanPlayer={settings.mode === 'pve' ? players[0] : activePlayer}
                players={players}
                lastActionText={lastActionText}
              />
            </div>

            {/* Bottom Area: Active Player Hand (Human or current turn) */}
            <div className="w-full mt-auto">
              <PlayerHand
                player={settings.mode === 'pve' ? players[0] : activePlayer}
                topCard={topCard}
                activeColor={activeColor}
                isCurrentTurn={
                  settings.mode === 'pve'
                    ? currentTurnIndex === 0
                    : !activePlayer.isAI
                }
                onPlayCard={handleHumanPlayCard}
                pendingDrawCount={pendingDrawCount}
                enableStacking={settings.enableStacking}
                isHuman={true}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onSelectColor={handleColorSelected}
      />

      <PassDeviceModal
        isOpen={isPassModalOpen}
        nextPlayer={activePlayer}
        onReady={() => setIsPassModalOpen(false)}
        onToggleTableMode={() => {
          setIsTableMode((prev) => !prev);
          setIsPassModalOpen(false);
        }}
        isTableMode={isTableMode}
      />

      <GameOverModal
        isOpen={status === 'game_over'}
        winner={winner}
        players={players}
        roundScore={roundScore}
        onPlayAgain={() => startNewGame(settings.mode, settings.playerCount)}
        onMainMenu={() => setStatus('menu')}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <ExportApkModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
      />
    </div>
  );
}

import React from 'react';
import { Card, CardColor, Player } from '../types';
import { CardView } from './CardView';
import { ArrowDownRight, ArrowUpRight, Flame, Layers, RotateCw, ShieldAlert } from 'lucide-react';

interface GameBoardProps {
  deckCount: number;
  topCard: Card | null;
  discardPile: Card[];
  activeColor: CardColor;
  direction: 1 | -1;
  isHumanTurn: boolean;
  canDraw: boolean;
  pendingDrawCount: number;
  onDrawCard: () => void;
  onCallOno: () => void;
  onCatchOno: (targetPlayer: Player) => void;
  humanPlayer: Player;
  players: Player[];
  lastActionText: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  deckCount,
  topCard,
  activeColor,
  direction,
  isHumanTurn,
  canDraw,
  pendingDrawCount,
  onDrawCard,
  onCallOno,
  onCatchOno,
  humanPlayer,
  players,
  lastActionText,
}) => {
  // Check if any opponent can be caught for failing to call ONO
  const vulnerableOpponent = players.find(
    (p) => p.id !== humanPlayer.id && p.hand.length === 1 && !p.hasCalledOno && p.canBeCaughtOno
  );

  const humanNeedsOno =
    humanPlayer.hand.length === 1 && !humanPlayer.hasCalledOno;

  const colorBorderMap: Record<CardColor, string> = {
    red: 'border-red-500 shadow-red-500/30',
    blue: 'border-blue-500 shadow-blue-500/30',
    green: 'border-emerald-500 shadow-emerald-500/30',
    yellow: 'border-amber-400 shadow-amber-400/30',
    wild: 'border-purple-500 shadow-purple-500/30',
  };

  const colorBgMap: Record<CardColor, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-400',
    wild: 'bg-gradient-to-r from-red-500 via-amber-400 to-blue-500',
  };

  return (
    <div
      id="game-board-table"
      className="relative flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-2xl mx-auto"
    >
      {/* Table Center Ring with Felt Glow */}
      <div
        className={`relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border-4 ${
          colorBorderMap[activeColor]
        } bg-slate-900/80 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-500`}
      >
        {/* Direction arrows rotating */}
        <div
          className={`absolute inset-2 sm:inset-4 rounded-full border border-dashed border-slate-600/40 pointer-events-none transition-transform duration-1000 ${
            direction === 1 ? 'animate-[spin_20s_linear_infinite]' : 'animate-[spin_20s_linear_infinite_reverse]'
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400 bg-slate-900 px-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
            <RotateCw className="w-3 h-3 text-amber-400" />
            <span>{direction === 1 ? 'Clockwise' : 'Counter'}</span>
          </div>
        </div>

        {/* Center Cards Area: Draw Deck & Discard Stack */}
        <div className="flex items-center gap-4 sm:gap-6 z-10">
          {/* Draw Pile */}
          <div className="flex flex-col items-center">
            <div
              id="draw-pile"
              onClick={isHumanTurn && canDraw ? onDrawCard : undefined}
              className={`relative cursor-pointer transition-transform ${
                isHumanTurn && canDraw
                  ? 'hover:scale-105 active:scale-95 animate-bounce-subtle ring-2 ring-amber-400/80 rounded-xl'
                  : 'opacity-90'
              }`}
            >
              {/* Stack effect background cards */}
              <div className="absolute top-1.5 left-1.5 w-20 h-30 sm:w-24 sm:h-36 bg-slate-900 border border-slate-700 rounded-xl -z-10 shadow" />
              <div className="absolute top-0.5 left-0.5 w-20 h-30 sm:w-24 sm:h-36 bg-slate-900 border border-slate-700 rounded-xl -z-5 shadow" />

              <CardView faceDown size="md" />

              {/* Draw Pile Badge */}
              <div className="absolute -bottom-2 -right-2 bg-slate-800 text-slate-200 border border-slate-600 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                {deckCount}
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-2">
              {isHumanTurn && canDraw ? 'Tap to Draw' : 'Draw Deck'}
            </span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {topCard && (
                <CardView
                  card={topCard}
                  size="md"
                  className="shadow-2xl"
                  rotation={-4}
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-400">Active Color:</span>
              <span
                className={`w-3 h-3 rounded-full ${colorBgMap[activeColor]} ring-2 ring-white/40 inline-block`}
              />
            </div>
          </div>
        </div>

        {/* Stacking / Pending Penalty Badge */}
        {pendingDrawCount > 0 && (
          <div className="absolute bottom-4 bg-red-600/90 text-white font-extrabold px-3 py-1 rounded-full text-xs shadow-lg border border-red-400 flex items-center gap-1 animate-pulse z-20">
            <Flame className="w-3.5 h-3.5" />
            <span>+{pendingDrawCount} Cards Penalty!</span>
          </div>
        )}
      </div>

      {/* Action Notification Banner */}
      <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-medium shadow flex items-center gap-2 max-w-md text-center">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="truncate">{lastActionText || 'Game started! Match color, number, or symbol.'}</span>
      </div>

      {/* Floating Buttons: CALL ONO and CATCH ONO */}
      <div className="flex items-center gap-3 mt-3">
        {/* Call ONO Button */}
        <button
          id="btn-call-ono"
          onClick={onCallOno}
          className={`px-5 py-2 rounded-2xl font-black text-sm tracking-wider uppercase shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            humanNeedsOno
              ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white animate-bounce ring-4 ring-yellow-400 scale-110'
              : humanPlayer.hasCalledOno
              ? 'bg-emerald-600 text-white opacity-80 cursor-default'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>{humanPlayer.hasCalledOno ? 'ONO CALLED!' : 'SHOUT ONO!'}</span>
        </button>

        {/* Catch Opponent Button */}
        {vulnerableOpponent && (
          <button
            id="btn-catch-ono"
            onClick={() => onCatchOno(vulnerableOpponent)}
            className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl border border-amber-400 flex items-center gap-1.5 animate-pulse cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-yellow-200" />
            <span>Catch {vulnerableOpponent.name}! (+2)</span>
          </button>
        )}
      </div>
    </div>
  );
};

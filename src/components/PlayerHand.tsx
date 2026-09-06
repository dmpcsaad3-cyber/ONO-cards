import React from 'react';
import { Card, CardColor, Player } from '../types';
import { CardView } from './CardView';
import { isCardPlayable } from '../utils/deck';
import { ArrowUpDown, Bot, User } from 'lucide-react';

interface PlayerHandProps {
  player: Player;
  topCard: Card | null;
  activeColor: CardColor;
  isCurrentTurn: boolean;
  onPlayCard: (card: Card) => void;
  pendingDrawCount: number;
  enableStacking: boolean;
  isHuman: boolean;
  hideCards?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  topCard,
  activeColor,
  isCurrentTurn,
  onPlayCard,
  pendingDrawCount,
  enableStacking,
  isHuman,
  hideCards = false,
}) => {
  const [sortBy, setSortBy] = React.useState<'color' | 'value'>('color');

  // Sorted cards for human player convenience
  const displayCards = React.useMemo(() => {
    const list = [...player.hand];
    if (sortBy === 'color') {
      const colorOrder: Record<string, number> = { red: 1, blue: 2, green: 3, yellow: 4, wild: 5 };
      list.sort((a, b) => (colorOrder[a.color] || 0) - (colorOrder[b.color] || 0) || a.value.localeCompare(b.value));
    } else {
      list.sort((a, b) => a.value.localeCompare(b.value) || a.color.localeCompare(b.color));
    }
    return list;
  }, [player.hand, sortBy]);

  const toggleSort = () => {
    setSortBy((prev) => (prev === 'color' ? 'value' : 'color'));
  };

  // Human player active hand (bottom tray)
  if (isHuman && !hideCards) {
    return (
      <div id={`player-hand-${player.id}`} className="w-full flex flex-col items-center">
        {/* Hand Top Bar */}
        <div className="w-full max-w-4xl px-4 flex items-center justify-between text-xs sm:text-sm text-slate-300 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white border border-indigo-400 font-bold">
              {player.avatar || <User className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-white flex items-center gap-1.5">
                {player.name}
                {isCurrentTurn && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase font-extrabold tracking-wider animate-pulse">
                    Your Turn
                  </span>
                )}
              </span>
              <span className="text-slate-400 text-xs">
                {player.hand.length} {player.hand.length === 1 ? 'card' : 'cards'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-sort-cards"
              onClick={toggleSort}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Sort: {sortBy === 'color' ? 'Color' : 'Value'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Cards Tray */}
        <div className="w-full overflow-x-auto pb-4 pt-4 px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="flex items-center justify-center min-w-max gap-1 sm:gap-2 px-6">
            {displayCards.map((card, idx) => {
              const playable =
                isCurrentTurn &&
                isCardPlayable(card, topCard, activeColor, pendingDrawCount, enableStacking);

              return (
                <div
                  key={card.id}
                  className="transition-transform duration-150"
                  style={{
                    marginLeft: idx > 0 && player.hand.length > 8 ? '-1.5rem' : '0rem',
                    zIndex: idx,
                  }}
                >
                  <CardView
                    card={card}
                    size="md"
                    isPlayable={playable}
                    disabled={!isCurrentTurn || !playable}
                    onClick={() => {
                      if (playable) {
                        onPlayCard(card);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Opponent or hidden hand (top or sides)
  return (
    <div
      id={`opponent-hand-${player.id}`}
      className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
        isCurrentTurn ? 'bg-indigo-950/50 border border-indigo-500/50 shadow-lg shadow-indigo-950/50 scale-105' : 'bg-slate-900/40'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white border text-xs font-bold ${
            isCurrentTurn ? 'bg-amber-500 border-amber-300' : 'bg-slate-800 border-slate-700'
          }`}
        >
          {player.isAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
        </div>
        <div className="text-left leading-tight">
          <div className="text-xs font-bold text-white flex items-center gap-1">
            {player.name}
            {player.hasCalledOno && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded font-black tracking-widest">
                ONO!
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            {player.hand.length} {player.hand.length === 1 ? 'card' : 'cards'}
          </div>
        </div>
      </div>

      {/* Mini Face-down Cards Stack */}
      <div className="flex items-center justify-center -space-x-4 max-w-[140px] sm:max-w-[180px] overflow-hidden py-1">
        {player.hand.slice(0, Math.min(player.hand.length, 7)).map((_, idx) => (
          <CardView key={idx} faceDown size="mini" className="pointer-events-none" />
        ))}
        {player.hand.length > 7 && (
          <div className="w-7 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 z-10 shadow">
            +{player.hand.length - 7}
          </div>
        )}
      </div>
    </div>
  );
};

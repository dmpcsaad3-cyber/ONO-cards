import React, { useEffect } from 'react';
import { Player } from '../types';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Trophy, Users } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player | null;
  players: Player[];
  roundScore: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  players,
  roundScore,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  return (
    <div
      id="game-over-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
    >
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-lg shadow-amber-500/20">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-1 block">
          Game Over • Victory!
        </span>
        <h2 className="text-3xl font-black text-white mb-1">
          {winner.name} Won!
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mb-5">
          Successfully cleared all cards! Scored <strong className="text-emerald-400 font-mono">+{roundScore} pts</strong> from opponent hands.
        </p>

        {/* Scoreboard */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 mb-6 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </div>

          <div className="space-y-2">
            {players
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm ${
                    p.id === winner.id
                      ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-slate-500 font-mono font-bold">#{idx + 1}</span>
                    <span className="truncate max-w-[140px]">{p.name}</span>
                    {p.id === winner.id && (
                      <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-black">
                        WINNER
                      </span>
                    )}
                  </div>
                  <div className="font-mono font-bold">{p.score} pts</div>
                </div>
              ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="btn-play-again"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-sm tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Round</span>
          </button>
          <button
            id="btn-return-menu"
            onClick={onMainMenu}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

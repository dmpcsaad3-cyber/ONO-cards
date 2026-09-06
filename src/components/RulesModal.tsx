import React from 'react';
import { BookOpen, CheckCircle, Flame, ShieldAlert, Sparkles, X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Official ONO Rules & Guide</h2>
              <p className="text-xs text-slate-400">Complete standard tournament and card mechanics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Section 1: Objective */}
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Objective</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Be the first player to get rid of all the cards in your hand. Players score points from remaining cards in opponents' hands. First to 500 points (or highest at end of rounds) wins!
            </p>
          </div>

          {/* Section 2: How to Play */}
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Matching Cards</span>
            </h3>
            <p className="text-slate-400 leading-relaxed mb-3">
              On your turn, you must play a card from your hand that matches the top discard card by:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-blue-400 block mb-1">Color</span>
                Match the current active color (Red, Blue, Green, or Yellow).
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-emerald-400 block mb-1">Number / Symbol</span>
                Match the value or symbol (e.g. Blue 7 on Red 7).
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-purple-400 block mb-1">Wild Card</span>
                Can be played on any card at any time to pick next color.
              </div>
            </div>
          </div>

          {/* Section 3: Action Cards */}
          <div>
            <h3 className="text-white font-bold text-base mb-3">Action & Wild Cards</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-black border border-red-500/30">
                  SKIP 🚫
                </span>
                <p className="text-slate-300">
                  The next player loses their turn.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black border border-blue-500/30">
                  REVERSE 🔄
                </span>
                <p className="text-slate-300">
                  Reverses the direction of play. (In 2-player games, acts as a Skip).
                </p>
              </div>
              <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">
                  DRAW TWO (+2)
                </span>
                <p className="text-slate-300">
                  The next player must draw 2 cards and forfeit their turn (unless Stacking rule is enabled).
                </p>
              </div>
              <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-black border border-purple-500/30">
                  WILD & WILD +4 🌈
                </span>
                <p className="text-slate-300">
                  Wild allows you to pick any color. Wild Draw 4 forces the next player to draw 4 cards, forfeit their turn, and you select the new color.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: The ONO Rule */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <h3 className="text-red-400 font-bold text-sm flex items-center gap-1.5 mb-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Calling "ONO!" & Penalty</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              When you play your second-to-last card leaving you with exactly <strong>1 card</strong>, you MUST press the <strong>"SHOUT ONO!"</strong> button!
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              If you forget and another player catches you before the next turn, you receive a <strong>2-card penalty</strong>!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

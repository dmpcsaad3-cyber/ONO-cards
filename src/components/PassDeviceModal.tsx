import React from 'react';
import { Player } from '../types';
import { Eye, ShieldCheck, Smartphone } from 'lucide-react';

interface PassDeviceModalProps {
  isOpen: boolean;
  nextPlayer: Player;
  onReady: () => void;
  onToggleTableMode: () => void;
  isTableMode: boolean;
}

export const PassDeviceModal: React.FC<PassDeviceModalProps> = ({
  isOpen,
  nextPlayer,
  onReady,
  onToggleTableMode,
  isTableMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="pass-device-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center mx-auto mb-4 text-indigo-400">
          <Smartphone className="w-8 h-8 animate-pulse" />
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-1 block">
          Pass & Play Handover
        </span>
        <h3 className="text-2xl font-black text-white mb-2">
          Pass device to <span className="text-amber-400">{nextPlayer.name}</span>
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mb-6">
          Cards are hidden to keep secrets safe. Tap below when {nextPlayer.name} has the device.
        </p>

        <button
          id="btn-reveal-hand"
          onClick={onReady}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white font-black text-base tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Eye className="w-5 h-5 text-amber-300" />
          <span>I'm Ready - Reveal Cards</span>
        </button>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Peek Privacy</span>
          </span>
          <button
            onClick={onToggleTableMode}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            {isTableMode ? 'Turn on curtain' : 'Switch to Open Table'}
          </button>
        </div>
      </div>
    </div>
  );
};

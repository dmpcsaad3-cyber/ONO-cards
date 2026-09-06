import React from 'react';
import { GameSettings } from '../types';
import { Settings as SettingsIcon, Sliders, Volume2, VolumeX, X, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-white">Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="font-bold text-white block">Sound Effects</span>
                <span className="text-xs text-slate-400">Card sounds, ONO shouts, victory chimes</span>
              </div>
            </div>
            <button
              id="toggle-sound-btn"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                settings.soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* AI Speed */}
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Turn Speed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdateSettings({ aiSpeed: speed })}
                  className={`py-2 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer transition-all ${
                    settings.aiSpeed === speed
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Stacking Rule */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="font-bold text-white block">Stacking Rule (+2 on +2)</span>
                <span className="text-xs text-slate-400">Allow passing penalty by playing matching draw card</span>
              </div>
            </div>
            <button
              id="toggle-stacking-btn"
              onClick={() => onUpdateSettings({ enableStacking: !settings.enableStacking })}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                settings.enableStacking ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* ONO Catch Penalty Cards */}
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Missed "ONO!" Penalty</span>
              <span className="text-xs text-slate-400">Cards drawn when opponent catches you</span>
            </div>
            <div className="flex gap-1.5">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => onUpdateSettings({ onoPenaltyCards: count })}
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs border cursor-pointer transition-all ${
                    settings.onoPenaltyCards === count
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  +{count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

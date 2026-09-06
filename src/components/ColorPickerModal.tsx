import React from 'react';
import { CardColor } from '../types';
import { Sparkles } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: CardColor) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onSelectColor }) => {
  if (!isOpen) return null;

  const colors: { name: string; value: CardColor; bg: string; border: string; text: string }[] = [
    {
      name: 'Red',
      value: 'red',
      bg: 'bg-red-500 hover:bg-red-400 active:bg-red-600',
      border: 'border-red-300',
      text: 'text-white',
    },
    {
      name: 'Blue',
      value: 'blue',
      bg: 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600',
      border: 'border-blue-300',
      text: 'text-white',
    },
    {
      name: 'Green',
      value: 'green',
      bg: 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600',
      border: 'border-emerald-300',
      text: 'text-white',
    },
    {
      name: 'Yellow',
      value: 'yellow',
      bg: 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500',
      border: 'border-amber-200',
      text: 'text-slate-950',
    },
  ];

  return (
    <div
      id="color-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="inline-flex p-3 bg-slate-800 rounded-2xl mb-3 border border-slate-700 text-amber-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
          Choose Next Color
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Wild card played! Select the active color for upcoming turns.
        </p>

        <div className="grid grid-cols-2 gap-3.5">
          {colors.map((c) => (
            <button
              key={c.value}
              id={`color-choice-${c.value}`}
              onClick={() => onSelectColor(c.value)}
              className={`${c.bg} ${c.text} ${c.border} border-2 rounded-2xl h-20 flex flex-col items-center justify-center font-black text-lg uppercase tracking-wider shadow-lg transition-transform active:scale-95 hover:scale-105 cursor-pointer`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

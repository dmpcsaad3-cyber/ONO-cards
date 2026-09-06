import React from 'react';
import { Card, CardColor } from '../types';
import { Ban, RotateCcw, Sparkles } from 'lucide-react';

interface CardViewProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'mini';
  isPlayable?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  rotation?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  faceDown = false,
  size = 'md',
  isPlayable = false,
  onClick,
  disabled = false,
  className = '',
  rotation = 0,
}) => {
  // Size classes
  const sizeMap = {
    mini: 'w-10 h-14 text-xs rounded-md shadow-sm',
    sm: 'w-14 h-20 text-xs rounded-lg shadow-md',
    md: 'w-20 h-30 text-sm rounded-xl shadow-lg sm:w-24 sm:h-36 sm:text-base',
    lg: 'w-28 h-42 text-base rounded-2xl shadow-xl sm:w-32 sm:h-48 sm:text-lg',
  };

  // Rotation style
  const style: React.CSSProperties = rotation ? { transform: `rotate(${rotation}deg)` } : {};

  // If face down (e.g. deck or opponent hand)
  if (faceDown || !card) {
    return (
      <div
        id="card-facedown"
        onClick={!disabled && onClick ? onClick : undefined}
        style={style}
        className={`relative flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-700/80 cursor-pointer overflow-hidden transition-all duration-200 select-none ${
          sizeMap[size]
        } ${isPlayable ? 'ring-4 ring-amber-400 shadow-amber-500/50 scale-105' : ''} ${className}`}
      >
        <div className="absolute inset-1 rounded-md bg-gradient-to-br from-slate-800 to-black border border-slate-700 flex items-center justify-center overflow-hidden">
          {/* Decorative oval */}
          <div className="w-4/5 h-4/5 rounded-[50%] bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 opacity-90 -rotate-25 flex items-center justify-center shadow-inner">
            <span className="font-black text-white italic tracking-wider drop-shadow-md text-[1.1em] font-sans">
              ONO
            </span>
          </div>
        </div>
      </div>
    );
  }

  const colorStyles: Record<CardColor, { bg: string; text: string; ovalText: string }> = {
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600 border-red-400/60 shadow-red-950/40',
      text: 'text-white',
      ovalText: 'text-red-600',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/60 shadow-blue-950/40',
      text: 'text-white',
      ovalText: 'text-blue-600',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400/60 shadow-emerald-950/40',
      text: 'text-white',
      ovalText: 'text-emerald-600',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300/80 shadow-amber-950/40',
      text: 'text-slate-950',
      ovalText: 'text-amber-600',
    },
    wild: {
      bg: 'bg-gradient-to-br from-slate-900 to-black border-slate-600/80 shadow-slate-950/60',
      text: 'text-white',
      ovalText: 'text-white',
    },
  };

  const theme = colorStyles[card.color];

  // Render symbol representation
  const renderSymbol = (val: string, isCenter = false) => {
    switch (val) {
      case 'skip':
        return isCenter ? (
          <Ban className="w-3/5 h-3/5 stroke-[2.75]" />
        ) : (
          <Ban className="w-3.5 h-3.5 stroke-[2.5]" />
        );
      case 'reverse':
        return isCenter ? (
          <RotateCcw className="w-3/5 h-3/5 stroke-[2.75]" />
        ) : (
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
        );
      case 'draw2':
        return <span className={`font-black ${isCenter ? 'text-2xl sm:text-3xl' : 'text-xs'}`}>+2</span>;
      case 'wild_draw4':
        return (
          <div className="flex flex-col items-center justify-center">
            <span className={`font-black ${isCenter ? 'text-2xl sm:text-3xl' : 'text-xs'}`}>+4</span>
            {isCenter && (
              <div className="grid grid-cols-2 gap-0.5 w-6 h-6 mt-1 rounded-sm overflow-hidden">
                <div className="bg-red-500" />
                <div className="bg-blue-500" />
                <div className="bg-emerald-500" />
                <div className="bg-amber-400" />
              </div>
            )}
          </div>
        );
      case 'wild':
        return isCenter ? (
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            <div className="w-full h-full rounded-full grid grid-cols-2 shadow-inner border border-white/40 overflow-hidden -rotate-12">
              <div className="bg-red-500" />
              <div className="bg-blue-500" />
              <div className="bg-amber-400" />
              <div className="bg-emerald-500" />
            </div>
            <Sparkles className="absolute w-4 h-4 text-white drop-shadow" />
          </div>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full grid grid-cols-2 overflow-hidden">
            <div className="bg-red-500" />
            <div className="bg-blue-500" />
            <div className="bg-amber-400" />
            <div className="bg-emerald-500" />
          </div>
        );
      default:
        // Number 0-9
        return (
          <span className={`font-black font-mono italic tracking-tighter ${isCenter ? 'text-3xl sm:text-4xl' : 'text-xs sm:text-sm'}`}>
            {val}
          </span>
        );
    }
  };

  return (
    <div
      id={`card-${card.id}`}
      style={style}
      onClick={!disabled && onClick ? onClick : undefined}
      className={`relative select-none flex flex-col justify-between border-2 p-1 sm:p-1.5 transition-all duration-200 overflow-hidden ${
        sizeMap[size]
      } ${theme.bg} ${
        isPlayable
          ? 'cursor-pointer ring-4 ring-yellow-300 ring-offset-2 ring-offset-slate-950 -translate-y-3 shadow-2xl hover:scale-105'
          : disabled
          ? 'opacity-80'
          : 'cursor-default'
      } ${className}`}
    >
      {/* Top Left Badge */}
      <div className={`flex items-center justify-start leading-none font-bold ${theme.text}`}>
        {renderSymbol(card.value, false)}
      </div>

      {/* Center Oval with Value */}
      <div className="relative flex items-center justify-center w-full h-3/5 my-auto">
        <div
          className={`w-[85%] h-[90%] rounded-[50%] -rotate-25 flex items-center justify-center shadow-md ${
            card.color === 'wild'
              ? 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-white/20'
              : 'bg-white'
          }`}
        >
          <div className={`rotate-25 flex items-center justify-center ${card.color === 'wild' ? 'text-white' : theme.ovalText}`}>
            {renderSymbol(card.value, true)}
          </div>
        </div>
      </div>

      {/* Bottom Right Badge (Inverted) */}
      <div className={`flex items-center justify-end leading-none font-bold rotate-180 ${theme.text}`}>
        {renderSymbol(card.value, false)}
      </div>
    </div>
  );
};

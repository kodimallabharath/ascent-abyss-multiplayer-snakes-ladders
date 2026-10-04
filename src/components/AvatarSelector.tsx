import React, { useState } from 'react';
import { AvatarSymbol, TokenColor } from '../types/game';
import { AVATAR_SYMBOLS_LIST, AvatarIcon } from './AvatarIcon';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';
import { Shapes, Sparkles } from 'lucide-react';

interface AvatarSelectorProps {
  selectedSymbol: AvatarSymbol;
  color: TokenColor;
  playerName?: string;
  onSelect: (symbol: AvatarSymbol) => void;
  className?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedSymbol,
  color,
  playerName = 'Player',
  onSelect,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Geometric' | 'Symbolic'>('All');

  const filteredSymbols = AVATAR_SYMBOLS_LIST.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header and Live Avatar Preview */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PlayerAvatar
            color={color}
            symbol={selectedSymbol}
            name={playerName}
            size="lg"
            showGlow
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-200">
              Avatar Symbol
            </span>
            <span className="text-[11px] font-mono capitalize text-amber-400">
              {selectedSymbol}
            </span>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[10px]">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveCategory('All');
            }}
            className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveCategory('Geometric');
            }}
            className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              activeCategory === 'Geometric'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shapes className="w-3 h-3 text-amber-400" />
            <span>Shapes</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveCategory('Symbolic');
            }}
            className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              activeCategory === 'Symbolic'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Symbols</span>
          </button>
        </div>
      </div>

      {/* Grid of Minimalist Geometric Shapes and Symbols */}
      <div className="grid grid-cols-8 sm:grid-cols-8 gap-1.5 p-2 bg-neutral-950/70 border border-neutral-850 rounded-xl">
        {filteredSymbols.map(item => {
          const isSelected = selectedSymbol === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                sound.playClick();
                onSelect(item.id);
              }}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 ring-2 ring-amber-400/30 shadow-md scale-105'
                  : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900'
              }`}
              title={`${item.name} (${item.category})`}
            >
              <AvatarIcon symbol={item.id} className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[9px] font-mono mt-1 text-neutral-400 group-hover:text-neutral-200 capitalize truncate w-full text-center">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

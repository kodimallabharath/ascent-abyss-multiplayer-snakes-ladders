import React from 'react';
import { Player } from '../types/game';
import { TOKEN_THEMES } from '../utils/board';
import { AvatarIcon } from './AvatarIcon';

interface PlayerTokenProps {
  player: Player;
  isCurrentTurn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  offset?: { x: number; y: number };
  showName?: boolean;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  isCurrentTurn = false,
  size = 'md',
  offset = { x: 0, y: 0 },
  showName = false,
}) => {
  const theme = TOKEN_THEMES[player.color] || TOKEN_THEMES.crimson;

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-10 h-10',
  }[size];

  const iconSizes = {
    sm: 'w-2.5 h-2.5 stroke-[2.5]',
    md: 'w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]',
    lg: 'w-5 h-5 stroke-[2]',
  }[size];

  return (
    <div
      className="relative flex flex-col items-center justify-center transition-transform duration-300 ease-out select-none"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      {/* Outer Glow Ring for Active Turn */}
      {isCurrentTurn && (
        <div
          className="absolute -inset-1 rounded-full animate-ping opacity-60 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
      )}

      {/* Circular Profile Avatar Coin */}
      <div
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center font-bold shadow-md border-[1.5px] transition-all duration-200 ${
          isCurrentTurn ? 'ring-2 ring-white scale-110 shadow-lg' : 'scale-100 hover:scale-105'
        }`}
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, #090d16)`,
          borderColor: isCurrentTurn ? '#ffffff' : theme.primary,
          boxShadow: `0 0 10px ${theme.glow}`,
          color: '#ffffff',
        }}
        title={`${player.name} (${player.position})`}
      >
        {/* Subtle metallic reflection highlight */}
        <div className="absolute top-0.5 left-1 right-1 h-1/3 rounded-t-full bg-white/30 pointer-events-none" />

        {/* Center Geometric Shape Avatar Symbol */}
        <div className="relative z-10 drop-shadow-md flex items-center justify-center text-white">
          {player.avatarSymbol ? (
            <AvatarIcon symbol={player.avatarSymbol} className={iconSizes} />
          ) : (
            <span className="font-mono text-xs font-bold leading-none">
              {player.name ? player.name.charAt(0).toUpperCase() : '?'}
            </span>
          )}
        </div>

        {/* Bot indicator small badge */}
        {player.isBot && (
          <span className="absolute -bottom-1 -right-1 text-[8px] bg-neutral-900 border border-neutral-600 rounded-full px-1 text-neutral-300">
            AI
          </span>
        )}
      </div>

      {/* Floating Name Label */}
      {showName && (
        <span className="mt-1 text-[11px] font-medium tracking-tight text-neutral-200 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800 backdrop-blur-xs whitespace-nowrap shadow-xs flex items-center gap-1">
          {player.avatarSymbol && (
            <AvatarIcon symbol={player.avatarSymbol} className="w-2.5 h-2.5 text-amber-400" />
          )}
          <span>{player.name}</span>
        </span>
      )}
    </div>
  );
};

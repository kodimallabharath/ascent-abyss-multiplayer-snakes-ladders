import React from 'react';
import { Player, TokenColor, AvatarSymbol } from '../types/game';
import { TOKEN_THEMES } from '../utils/board';
import { AvatarIcon } from './AvatarIcon';

interface PlayerAvatarProps {
  player?: Player;
  color?: TokenColor;
  symbol?: AvatarSymbol;
  name?: string;
  isBot?: boolean;
  isCurrentTurn?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  color,
  symbol,
  name,
  isBot,
  isCurrentTurn = false,
  size = 'md',
  showGlow = true,
  className = '',
  onClick,
  title,
}) => {
  const activeColor: TokenColor = player?.color || color || 'crimson';
  const activeSymbol: AvatarSymbol | undefined = player?.avatarSymbol || symbol;
  const activeName = player?.name || name || 'Player';
  const isAi = player?.isBot ?? isBot ?? false;
  const theme = TOKEN_THEMES[activeColor] || TOKEN_THEMES.crimson;

  const sizeConfig = {
    xs: {
      container: 'w-5 h-5 text-[9px]',
      icon: 'w-2.5 h-2.5 stroke-[2.5]',
      border: 'border-[1px]',
      ping: '-inset-0.5',
    },
    sm: {
      container: 'w-6 h-6 text-[10px]',
      icon: 'w-3 h-3 stroke-[2.2]',
      border: 'border-[1.5px]',
      ping: '-inset-0.5',
    },
    md: {
      container: 'w-8 h-8 text-xs',
      icon: 'w-4 h-4 stroke-[2.2]',
      border: 'border-[1.5px]',
      ping: '-inset-1',
    },
    lg: {
      container: 'w-10 h-10 text-sm',
      icon: 'w-5 h-5 stroke-[2.2]',
      border: 'border-2',
      ping: '-inset-1',
    },
    xl: {
      container: 'w-14 h-14 text-base',
      icon: 'w-7 h-7 stroke-[2]',
      border: 'border-2',
      ping: '-inset-1.5',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      } ${className}`}
      title={title || `${activeName}${activeSymbol ? ` (${activeSymbol})` : ''}`}
    >
      {/* Outer Glow Ping for Active Turn */}
      {isCurrentTurn && (
        <div
          className={`absolute ${sizeConfig.ping} rounded-full animate-ping opacity-60 pointer-events-none`}
          style={{ backgroundColor: theme.primary }}
        />
      )}

      {/* Circular Profile Avatar Coin */}
      <div
        className={`relative ${sizeConfig.container} ${sizeConfig.border} rounded-full flex items-center justify-center font-bold text-white transition-all duration-200 overflow-hidden ${
          isCurrentTurn ? 'ring-2 ring-white scale-105 shadow-lg' : 'shadow-md'
        }`}
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, #090d16)`,
          borderColor: isCurrentTurn ? '#ffffff' : theme.primary,
          boxShadow: showGlow ? `0 0 10px ${theme.glow}` : undefined,
        }}
      >
        {/* Subtle Metallic Bevel / Gloss Highlight */}
        <div className="absolute top-0.5 left-1 right-1 h-1/3 rounded-t-full bg-white/25 pointer-events-none" />

        {/* Minimalist Geometric Shape / Symbol in Center */}
        <div className="relative z-10 flex items-center justify-center text-white drop-shadow-sm">
          {activeSymbol ? (
            <AvatarIcon symbol={activeSymbol} className={sizeConfig.icon} />
          ) : (
            <span className="font-mono font-bold leading-none">
              {activeName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Bot AI Badge Indicator */}
        {isAi && size !== 'xs' && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-mono bg-neutral-950 border border-neutral-700 rounded-full px-0.5 text-neutral-300 leading-none">
            AI
          </span>
        )}
      </div>
    </div>
  );
};

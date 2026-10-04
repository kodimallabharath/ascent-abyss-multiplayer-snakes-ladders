import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { Dices, Sparkles } from 'lucide-react';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  playerColor?: string;
  playerName?: string;
  isMyTurn?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
  playerColor = '#ef4444',
  playerName = 'Player',
  isMyTurn = true,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value || 1);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update display when roll completes
  useEffect(() => {
    if (value && !isRolling) {
      setDisplayValue(value);
      const angles: Record<number, { x: number; y: number }> = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: 180 },
        3: { x: 0, y: -90 },
        4: { x: 0, y: 90 },
        5: { x: -90, y: 0 },
        6: { x: 90, y: 0 },
      };
      setRotation(angles[value] || { x: 0, y: 0 });
    }
  }, [value, isRolling]);

  // Dice roll tumbling animation
  useEffect(() => {
    if (!isRolling) return;
    sound.playDiceRoll();

    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
      setRotation({
        x: Math.floor(Math.random() * 4) * 90 + (Math.random() * 50 - 25),
        y: Math.floor(Math.random() * 4) * 90 + (Math.random() * 50 - 25),
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isRolling]);

  // Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canRoll && !isRolling) {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        e.preventDefault();
        onRoll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRoll, isRolling, onRoll]);

  // Crisp, high-contrast dots that NEVER fade into background
  const renderPips = (num: number) => {
    const pipClass = "w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-neutral-950 shadow-inner";

    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2 sm:p-2.5">
            <span className={`${pipClass} self-start`} />
            <span className={`${pipClass} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-2 sm:p-2.5">
            <span className={`${pipClass} self-start`} />
            <span className={`${pipClass} self-center`} />
            <span className={`${pipClass} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2 sm:p-2.5 gap-2 place-items-center">
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 sm:p-2 place-items-center">
            <span className={`${pipClass} col-start-1 row-start-1`} />
            <span className={`${pipClass} col-start-3 row-start-1`} />
            <span className={`${pipClass} col-start-2 row-start-2`} />
            <span className={`${pipClass} col-start-1 row-start-3`} />
            <span className={`${pipClass} col-start-3 row-start-3`} />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 sm:p-2 gap-x-2.5 gap-y-1.5 place-items-center">
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* 3D Kinetic Ivory Dice */}
      <div
        className="relative perspective-800 cursor-pointer select-none group"
        onClick={() => {
          if (canRoll && !isRolling) onRoll();
        }}
        title={canRoll ? "Click or tap Spacebar to roll die" : "Waiting for turn"}
      >
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-neutral-300 shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isRolling ? 'scale-110 shadow-amber-400/50' : ''
          } ${canRoll ? 'ring-4 ring-amber-400/60 scale-105 hover:scale-110' : 'opacity-90'}`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            boxShadow: canRoll ? `0 12px 28px -6px ${playerColor}66` : '0 10px 20px -5px rgba(0,0,0,0.4)',
          }}
        >
          {/* Subtle ivory face bevel & pips */}
          <div className="w-full h-full flex items-center justify-center">
            {renderPips(displayValue)}
          </div>
        </div>

        {/* Pulsing indicator when ready to roll */}
        {canRoll && !isRolling && (
          <div className="absolute -inset-2 rounded-2xl border-2 border-amber-400 animate-ping opacity-30 pointer-events-none" />
        )}
      </div>

      {/* Primary Roll Action Button */}
      <button
        onClick={onRoll}
        disabled={!canRoll || isRolling}
        className={`w-full max-w-xs py-3 px-5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg ${
          canRoll && !isRolling
            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-neutral-950 hover:from-amber-300 hover:to-yellow-300 active:scale-95 cursor-pointer ring-2 ring-amber-300/60 animate-pulse'
            : 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700/60'
        }`}
      >
        {isRolling ? (
          <span className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            Rolling Die...
          </span>
        ) : canRoll ? (
          <>
            <Dices className="w-5 h-5 text-neutral-950 animate-bounce" />
            <span className="text-base font-extrabold uppercase">
              {isMyTurn ? 'Roll Dice!' : `Roll for ${playerName}`}
            </span>
            <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/20 text-neutral-900 border border-black/10">
              Space
            </kbd>
          </>
        ) : (
          <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400/60 animate-pulse" />
            Waiting for {playerName}...
          </span>
        )}
      </button>
    </div>
  );
};

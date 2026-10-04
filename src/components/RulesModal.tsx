import React from 'react';
import { sound } from '../utils/audio';
import { X, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Game Rules</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-neutral-300">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <strong className="text-neutral-100 block">Board & Movement</strong>
              The board has 100 tiles arranged in a boustrophedon (snake) pattern from Tile 1 (START) to Tile 100 (FINISH). Players take turns rolling a 6-sided die.
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block">Ladders (Ascent)</strong>
              Landing at the bottom of a ladder automatically boosts your token up to the ladder’s peak!
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <TrendingDown className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 block">Snakes (Abyss)</strong>
              Beware! Landing on a vicious snake’s head slides your token down to the tip of its tail.
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block">Exact Roll to Win (Bounce-Back)</strong>
              To claim victory at Tile 100, you must land on it with an exact roll. If your roll exceeds 100, your token bounces backward from 100 by the surplus steps!
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer mt-1"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};

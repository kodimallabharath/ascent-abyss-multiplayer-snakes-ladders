import React from 'react';
import { MoveRecord } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { History, TrendingUp, TrendingDown, RotateCcw, Trophy } from 'lucide-react';

interface GameLogProps {
  logs: MoveRecord[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  return (
    <div className="flex flex-col h-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3.5 overflow-hidden">
      <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-800 text-xs font-semibold text-neutral-300">
        <History className="w-3.5 h-3.5 text-amber-400" />
        <span>Move Feed</span>
        <span className="text-[10px] text-neutral-500 font-mono ml-auto">
          {logs.length} moves
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1 text-xs">
        {logs.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-neutral-500 text-[11px] italic">
            Roll the dice to start the journey!
          </div>
        ) : (
          logs.slice(0, 30).map(log => {
            return (
              <div
                key={log.id}
                className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-850 flex items-start justify-between gap-2 transition-colors hover:border-neutral-700"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <PlayerAvatar
                    color={log.playerColor}
                    symbol={log.avatarSymbol}
                    name={log.playerName}
                    size="xs"
                    showGlow={false}
                  />
                  <div className="truncate">
                    <span className="font-semibold text-neutral-200">
                      {log.playerName}
                    </span>
                    <span className="text-neutral-400 ml-1">
                      rolled <strong className="font-mono text-neutral-200">{log.roll}</strong>
                    </span>
                  </div>
                </div>

                {/* Event outcome badge */}
                <div className="shrink-0 flex items-center gap-1 font-mono text-[11px]">
                  {log.specialEvent === 'ladder' && (
                    <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      <span>{log.to}</span>
                    </span>
                  )}
                  {log.specialEvent === 'snake' && (
                    <span className="flex items-center gap-0.5 text-rose-400 font-medium">
                      <TrendingDown className="w-3 h-3" />
                      <span>{log.to}</span>
                    </span>
                  )}
                  {log.specialEvent === 'bounce' && (
                    <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                      <RotateCcw className="w-3 h-3" />
                      <span>{log.to}</span>
                    </span>
                  )}
                  {log.specialEvent === 'win' && (
                    <span className="flex items-center gap-0.5 text-yellow-400 font-bold">
                      <Trophy className="w-3 h-3" />
                      <span>100!</span>
                    </span>
                  )}
                  {!log.specialEvent && (
                    <span className="text-neutral-400">
                      {log.from} → {log.to}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

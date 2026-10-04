import React, { useMemo } from 'react';
import { Player } from '../types/game';
import {
  BOARD_SIZE,
  TOTAL_CELLS,
  SNAKES_AND_LADDERS,
  getCellCoordinates,
  getSnakeSvgPath,
  getLadderSvgData,
} from '../utils/board';
import { PlayerToken } from './PlayerToken';

interface BoardProps {
  players: Player[];
  currentTurnPlayerId: string;
  activeCellHighlight?: number | null;
  lastMovePath?: { from: number; to: number; special?: 'ladder' | 'snake' | 'bounce' | 'win' } | null;
}

export const Board: React.FC<BoardProps> = ({
  players,
  currentTurnPlayerId,
  activeCellHighlight,
  lastMovePath,
}) => {
  // Generate list of cells 1 to 100
  const cells = useMemo(() => {
    const list: Array<{
      num: number;
      col: number;
      row: number; // 0 is top row in layout, 9 is bottom row
      isEvenCell: boolean;
      snakeLadder?: (typeof SNAKES_AND_LADDERS)[0];
    }> = [];

    // Layout from top row (rowFromTop 0) to bottom row (rowFromTop 9)
    for (let rowFromTop = 0; rowFromTop < BOARD_SIZE; rowFromTop++) {
      const rowFromBottom = BOARD_SIZE - 1 - rowFromTop;
      for (let col = 0; col < BOARD_SIZE; col++) {
        const colInRow = rowFromBottom % 2 === 0 ? col : BOARD_SIZE - 1 - col;
        const cellNum = rowFromBottom * BOARD_SIZE + colInRow + 1;

        const sl = SNAKES_AND_LADDERS.find(item => item.from === cellNum);
        list.push({
          num: cellNum,
          col,
          row: rowFromTop,
          isEvenCell: (rowFromTop + col) % 2 === 0,
          snakeLadder: sl,
        });
      }
    }
    return list;
  }, []);

  // Group players by cell position
  const playersByCell = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach(p => {
      const pos = Math.max(1, Math.min(100, p.position));
      const list = map.get(pos) || [];
      list.push(p);
      map.set(pos, list);
    });
    return map;
  }, [players]);

  // Compute calculated SVG data for snakes and ladders
  const snakesSvg = useMemo(() => {
    return SNAKES_AND_LADDERS.filter(sl => sl.type === 'snake').map(snake => {
      const { path, headAngle } = getSnakeSvgPath(snake.from, snake.to);
      const head = getCellCoordinates(snake.from);
      const tail = getCellCoordinates(snake.to);
      return { ...snake, path, headAngle, head, tail };
    });
  }, []);

  const laddersSvg = useMemo(() => {
    return SNAKES_AND_LADDERS.filter(sl => sl.type === 'ladder').map(ladder => {
      const data = getLadderSvgData(ladder.from, ladder.to);
      const base = getCellCoordinates(ladder.from);
      const top = getCellCoordinates(ladder.to);
      return { ...ladder, ...data, base, top };
    });
  }, []);

  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto select-none rounded-2xl p-2 sm:p-3 bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-md">
      {/* 10x10 Grid Container */}
      <div className="relative w-full h-full grid grid-cols-10 grid-rows-10 rounded-xl overflow-hidden border border-neutral-700/60 bg-neutral-950">
        {/* Cell Tiles */}
        {cells.map(cell => {
          const isStart = cell.num === 1;
          const isFinish = cell.num === TOTAL_CELLS;
          const isHighlighted = activeCellHighlight === cell.num;
          const isLastFrom = lastMovePath?.from === cell.num;
          const isLastTo = lastMovePath?.to === cell.num;

          return (
            <div
              key={cell.num}
              data-cell={cell.num}
              className={`relative flex flex-col justify-between p-1 transition-colors duration-200 border-[0.5px] border-neutral-800/80 ${
                cell.isEvenCell ? 'bg-neutral-900/60' : 'bg-neutral-900/30'
              } ${isStart ? 'bg-emerald-950/40 border-emerald-600/40' : ''} ${
                isFinish ? 'bg-amber-950/40 border-amber-500/40' : ''
              } ${isHighlighted ? 'bg-amber-500/20 ring-1 ring-amber-400 inset-0 z-10' : ''} ${
                isLastTo ? 'bg-sky-500/20' : ''
              }`}
            >
              {/* Cell Number Header */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[9px] sm:text-[11px] font-mono font-semibold tracking-tighter ${
                    isFinish
                      ? 'text-amber-400 font-bold'
                      : isStart
                      ? 'text-emerald-400 font-bold'
                      : 'text-neutral-400'
                  }`}
                >
                  {cell.num}
                </span>

                {/* Subtle Mini Tag for Start / 100 */}
                {isFinish && (
                  <span className="hidden sm:inline-block text-[8px] uppercase tracking-widest px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    WIN
                  </span>
                )}
                {isStart && (
                  <span className="hidden sm:inline-block text-[8px] uppercase tracking-widest px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    GO
                  </span>
                )}
              </div>

              {/* Cell Footnote Indicator for Ladder Base or Snake Head */}
              {cell.snakeLadder && (
                <div className="self-end mt-auto text-[8px] sm:text-[10px] font-medium leading-none flex items-center gap-0.5 opacity-80">
                  {cell.snakeLadder.type === 'ladder' ? (
                    <span className="text-emerald-400 font-mono">↗{cell.snakeLadder.to}</span>
                  ) : (
                    <span className="text-rose-400 font-mono">↘{cell.snakeLadder.to}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* SVG Overlay Layer for Ladders and Snakes */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients for Ladders */}
            <linearGradient id="ladderGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
            </linearGradient>

            {/* Gradients for Snakes */}
            <linearGradient id="snakeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fb7185" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="snakeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.8" />
            </linearGradient>

            {/* Filter for subtle drop shadow on snakes & ladders */}
            <filter id="slShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.4" stdDeviation="0.6" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Render Ladders */}
          {laddersSvg.map(ladder => (
            <g key={ladder.id} filter="url(#slShadow)">
              {/* Rails */}
              <line
                x1={ladder.rail1.x1}
                y1={ladder.rail1.y1}
                x2={ladder.rail1.x2}
                y2={ladder.rail1.y2}
                stroke="url(#ladderGrad)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <line
                x1={ladder.rail2.x1}
                y1={ladder.rail2.y1}
                x2={ladder.rail2.x2}
                y2={ladder.rail2.y2}
                stroke="url(#ladderGrad)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              {/* Rungs */}
              {ladder.rungs.map((rung, i) => (
                <line
                  key={i}
                  x1={rung.x1}
                  y1={rung.y1}
                  x2={rung.x2}
                  y2={rung.y2}
                  stroke="#6ee7b7"
                  strokeWidth="0.65"
                  strokeLinecap="round"
                />
              ))}

              {/* Ladder Base Indicator dot */}
              <circle
                cx={ladder.base.x}
                cy={ladder.base.y}
                r="1"
                fill="#10b981"
                className="animate-pulse"
              />
            </g>
          ))}

          {/* Render Snakes */}
          {snakesSvg.map((snake, idx) => {
            const grad = idx % 2 === 0 ? 'url(#snakeGrad1)' : 'url(#snakeGrad2)';
            return (
              <g key={snake.id} filter="url(#slShadow)">
                {/* Snake Body path */}
                <path
                  d={snake.path}
                  fill="none"
                  stroke={grad}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Snake inner belly stripe for depth */}
                <path
                  d={snake.path}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.35"
                  strokeOpacity="0.4"
                  strokeDasharray="1 1.2"
                />

                {/* Snake Head */}
                <g
                  transform={`translate(${snake.head.x}, ${snake.head.y}) rotate(${snake.headAngle})`}
                >
                  <circle cx="0" cy="0" r="1.6" fill="#be123c" />
                  {/* Eye dots */}
                  <circle cx="0.6" cy="-0.6" r="0.35" fill="#fef08a" />
                  <circle cx="0.6" cy="0.6" r="0.35" fill="#fef08a" />
                  <circle cx="0.7" cy="-0.6" r="0.15" fill="#000000" />
                  <circle cx="0.7" cy="0.6" r="0.15" fill="#000000" />
                </g>

                {/* Snake Tail Tip */}
                <circle cx={snake.tail.x} cy={snake.tail.y} r="0.7" fill="#fb7185" />
              </g>
            );
          })}
        </svg>

        {/* Players Token Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {Array.from(playersByCell.entries()).map(([cellNum, cellPlayers]) => {
            const coords = getCellCoordinates(cellNum);

            return (
              <div
                key={`cell-players-${cellNum}`}
                className="absolute flex items-center justify-center transition-all duration-500 ease-out"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {cellPlayers.map((player, pIdx) => {
                  // If multiple players on the same cell, cluster them nicely up to 16
                  const count = cellPlayers.length;
                  let offsetX = 0;
                  let offsetY = 0;
                  if (count > 1) {
                    if (count <= 4) {
                      const angle = (pIdx / count) * Math.PI * 2;
                      const radius = Math.min(10, count * 3);
                      offsetX = Math.cos(angle) * radius;
                      offsetY = Math.sin(angle) * radius;
                    } else if (count <= 8) {
                      const angle = (pIdx / count) * Math.PI * 2;
                      const radius = 11;
                      offsetX = Math.cos(angle) * radius;
                      offsetY = Math.sin(angle) * radius;
                    } else {
                      // Multi-tier ring for 9 to 16 players
                      const isInner = pIdx < 5;
                      const ringTotal = isInner ? 5 : count - 5;
                      const ringIdx = isInner ? pIdx : pIdx - 5;
                      const angle = (ringIdx / ringTotal) * Math.PI * 2;
                      const radius = isInner ? 6 : 13;
                      offsetX = Math.cos(angle) * radius;
                      offsetY = Math.sin(angle) * radius;
                    }
                  }

                  const tokenSize = count > 6 ? 'sm' : count > 2 ? 'sm' : 'md';

                  return (
                    <PlayerToken
                      key={player.id}
                      player={player}
                      isCurrentTurn={player.id === currentTurnPlayerId}
                      size={tokenSize}
                      offset={{ x: offsetX, y: offsetY }}
                      showName={count === 1}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

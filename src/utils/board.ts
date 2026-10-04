import { SnakeLadder, TokenColor, TokenTheme } from '../types/game';

export const BOARD_SIZE = 10;
export const TOTAL_CELLS = 100;

export const TOKEN_THEMES: Record<TokenColor, TokenTheme> = {
  crimson: {
    id: 'crimson',
    name: 'Ruby Crimson',
    primary: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.45)',
    bgGradient: 'from-rose-500 to-red-700',
    border: 'border-rose-400',
    text: 'text-rose-100',
  },
  emerald: {
    id: 'emerald',
    name: 'Jade Emerald',
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    bgGradient: 'from-emerald-400 to-teal-700',
    border: 'border-emerald-400',
    text: 'text-emerald-100',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Cobalt Sapphire',
    primary: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.45)',
    bgGradient: 'from-blue-500 to-indigo-700',
    border: 'border-blue-400',
    text: 'text-blue-100',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    bgGradient: 'from-amber-400 to-yellow-600',
    border: 'border-amber-300',
    text: 'text-amber-100',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Mystic Amethyst',
    primary: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)',
    bgGradient: 'from-purple-500 to-fuchsia-700',
    border: 'border-purple-400',
    text: 'text-purple-100',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Shadow Obsidian',
    primary: '#64748b',
    glow: 'rgba(148, 163, 184, 0.45)',
    bgGradient: 'from-slate-400 to-slate-800',
    border: 'border-slate-300',
    text: 'text-slate-100',
  },
  cyan: {
    id: 'cyan',
    name: 'Neon Cyan',
    primary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.45)',
    bgGradient: 'from-cyan-400 to-teal-700',
    border: 'border-cyan-300',
    text: 'text-cyan-100',
  },
  rose: {
    id: 'rose',
    name: 'Blush Rose',
    primary: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.45)',
    bgGradient: 'from-rose-400 to-pink-700',
    border: 'border-rose-300',
    text: 'text-rose-100',
  },
  lime: {
    id: 'lime',
    name: 'Vibrant Lime',
    primary: '#84cc16',
    glow: 'rgba(132, 204, 22, 0.45)',
    bgGradient: 'from-lime-400 to-green-700',
    border: 'border-lime-300',
    text: 'text-lime-100',
  },
  violet: {
    id: 'violet',
    name: 'Ultra Violet',
    primary: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.45)',
    bgGradient: 'from-indigo-400 to-violet-800',
    border: 'border-indigo-300',
    text: 'text-indigo-100',
  },
  coral: {
    id: 'coral',
    name: 'Sunset Coral',
    primary: '#f97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    bgGradient: 'from-orange-400 to-red-600',
    border: 'border-orange-300',
    text: 'text-orange-100',
  },
  teal: {
    id: 'teal',
    name: 'Ocean Teal',
    primary: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.45)',
    bgGradient: 'from-teal-400 to-emerald-700',
    border: 'border-teal-300',
    text: 'text-teal-100',
  },
  fuchsia: {
    id: 'fuchsia',
    name: 'Electric Fuchsia',
    primary: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.45)',
    bgGradient: 'from-fuchsia-400 to-purple-800',
    border: 'border-fuchsia-300',
    text: 'text-fuchsia-100',
  },
  bronze: {
    id: 'bronze',
    name: 'Antique Bronze',
    primary: '#b45309',
    glow: 'rgba(180, 83, 9, 0.45)',
    bgGradient: 'from-amber-600 to-stone-800',
    border: 'border-amber-500',
    text: 'text-amber-100',
  },
  sky: {
    id: 'sky',
    name: 'Glacier Sky',
    primary: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.45)',
    bgGradient: 'from-sky-400 to-blue-700',
    border: 'border-sky-300',
    text: 'text-sky-100',
  },
  pearl: {
    id: 'pearl',
    name: 'Platinum Pearl',
    primary: '#cbd5e1',
    glow: 'rgba(203, 213, 225, 0.45)',
    bgGradient: 'from-slate-200 to-slate-500',
    border: 'border-white',
    text: 'text-slate-900',
  },
};

export const SNAKES_AND_LADDERS: SnakeLadder[] = [
  // Ladders (Ascent)
  { id: 'ladder-1', from: 4, to: 14, type: 'ladder' },
  { id: 'ladder-2', from: 9, to: 31, type: 'ladder' },
  { id: 'ladder-3', from: 20, to: 38, type: 'ladder' },
  { id: 'ladder-4', from: 28, to: 84, type: 'ladder' },
  { id: 'ladder-5', from: 40, to: 59, type: 'ladder' },
  { id: 'ladder-6', from: 51, to: 67, type: 'ladder' },
  { id: 'ladder-7', from: 71, to: 91, type: 'ladder' },
  { id: 'ladder-8', from: 80, to: 99, type: 'ladder' },

  // Snakes (Abyss)
  { id: 'snake-1', from: 17, to: 7, type: 'snake' },
  { id: 'snake-2', from: 54, to: 34, type: 'snake' },
  { id: 'snake-3', from: 62, to: 19, type: 'snake' },
  { id: 'snake-4', from: 64, to: 60, type: 'snake' },
  { id: 'snake-5', from: 87, to: 24, type: 'snake' },
  { id: 'snake-6', from: 93, to: 73, type: 'snake' },
  { id: 'snake-7', from: 95, to: 75, type: 'snake' },
  { id: 'snake-8', from: 98, to: 79, type: 'snake' },
];

/**
 * Returns normalized coordinates (0 to 100) for cell center in SVG viewBox.
 * Cell 1 is bottom-left (x: 5, y: 95)
 * Cell 10 is bottom-right (x: 95, y: 95)
 * Cell 11 is row 1 right (x: 95, y: 85)
 * Cell 20 is row 1 left (x: 5, y: 85)
 * Cell 100 is top-left (x: 5, y: 5)
 */
export function getCellCoordinates(cellNumber: number): { x: number; y: number } {
  const clamped = Math.max(1, Math.min(100, cellNumber));
  const rowFromBottom = Math.floor((clamped - 1) / BOARD_SIZE);
  const colInRow = (clamped - 1) % BOARD_SIZE;

  const col = rowFromBottom % 2 === 0 ? colInRow : BOARD_SIZE - 1 - colInRow;
  const rowFromTop = BOARD_SIZE - 1 - rowFromBottom;

  const x = (col + 0.5) * (100 / BOARD_SIZE);
  const y = (rowFromTop + 0.5) * (100 / BOARD_SIZE);

  return { x, y };
}

/**
 * Calculates a natural sinusoidal bezier curve for snakes with 2-3 wiggle wave peaks
 */
export function getSnakeSvgPath(fromCell: number, toCell: number): { path: string; headAngle: number } {
  const start = getCellCoordinates(fromCell); // Head (higher cell)
  const end = getCellCoordinates(toCell);     // Tail (lower cell)

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);

  // Wiggle amplitude proportional to distance
  const amp = Math.min(6, dist * 0.12);
  
  // 3 curve points
  const p1x = start.x + dx * 0.25 + perpX * amp;
  const p1y = start.y + dy * 0.25 + perpY * amp;

  const p2x = start.x + dx * 0.5 - perpX * amp * 0.8;
  const p2y = start.y + dy * 0.5 - perpY * amp * 0.8;

  const p3x = start.x + dx * 0.75 + perpX * amp * 0.5;
  const p3y = start.y + dy * 0.75 + perpY * amp * 0.5;

  const path = `M ${start.x} ${start.y} Q ${p1x} ${p1y} ${start.x + dx * 0.38} ${start.y + dy * 0.38} Q ${p2x} ${p2y} ${start.x + dx * 0.65} ${start.y + dy * 0.65} Q ${p3x} ${p3y} ${end.x} ${end.y}`;

  const headAngle = (Math.atan2(p1y - start.y, p1x - start.x) * 180) / Math.PI;

  return { path, headAngle };
}

/**
 * Calculates ladder geometry: 2 parallel rails and rungs
 */
export function getLadderSvgData(fromCell: number, toCell: number): {
  rail1: { x1: number; y1: number; x2: number; y2: number };
  rail2: { x1: number; y1: number; x2: number; y2: number };
  rungs: Array<{ x1: number; y1: number; x2: number; y2: number }>;
} {
  const start = getCellCoordinates(fromCell); // Base (lower cell)
  const end = getCellCoordinates(toCell);     // Top (higher cell)

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const railWidth = 2.2; // in SVG units
  const perpX = -Math.sin(angle) * (railWidth / 2);
  const perpY = Math.cos(angle) * (railWidth / 2);

  const rail1 = {
    x1: start.x + perpX,
    y1: start.y + perpY,
    x2: end.x + perpX,
    y2: end.y + perpY,
  };

  const rail2 = {
    x1: start.x - perpX,
    y1: start.y - perpY,
    x2: end.x - perpX,
    y2: end.y - perpY,
  };

  const rungCount = Math.max(3, Math.floor(dist / 4.5));
  const rungs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  for (let i = 1; i <= rungCount; i++) {
    const t = i / (rungCount + 1);
    const cx = start.x + dx * t;
    const cy = start.y + dy * t;
    rungs.push({
      x1: cx + perpX,
      y1: cy + perpY,
      x2: cx - perpX,
      y2: cy - perpY,
    });
  }

  return { rail1, rail2, rungs };
}

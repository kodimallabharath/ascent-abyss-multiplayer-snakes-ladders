export type TokenColor = 
  | 'crimson' 
  | 'emerald' 
  | 'sapphire' 
  | 'amber' 
  | 'amethyst' 
  | 'obsidian'
  | 'cyan'
  | 'rose'
  | 'lime'
  | 'violet'
  | 'coral'
  | 'teal'
  | 'fuchsia'
  | 'bronze'
  | 'sky'
  | 'pearl';

export type AvatarSymbol = 
  | 'circle'
  | 'triangle'
  | 'square'
  | 'diamond'
  | 'hexagon'
  | 'cross'
  | 'star'
  | 'crown'
  | 'shield'
  | 'lightning'
  | 'flame'
  | 'moon'
  | 'sun'
  | 'compass'
  | 'heart'
  | 'sparkle';

export interface TokenTheme {
  id: TokenColor;
  name: string;
  primary: string;
  glow: string;
  bgGradient: string;
  border: string;
  text: string;
}

export interface Player {
  id: string;
  name: string;
  color: TokenColor;
  avatarSymbol?: AvatarSymbol;
  position: number; // 1 to 100 (0 before start if off-board, but starting at cell 1 is standard)
  isHost: boolean;
  isBot?: boolean;
  isReady: boolean;
  connected: boolean;
  wins?: number;
}

export interface SnakeLadder {
  id: string;
  from: number;
  to: number;
  type: 'ladder' | 'snake';
}

export type GameStatus = 'setup' | 'lobby' | 'playing' | 'game_over';

export interface MoveRecord {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: TokenColor;
  avatarSymbol?: AvatarSymbol;
  roll: number;
  from: number;
  to: number;
  intermediate?: number;
  specialEvent?: 'ladder' | 'snake' | 'bounce' | 'win';
  timestamp: number;
}

export interface EmoteMessage {
  id: string;
  playerId: string;
  playerName: string;
  emoji: string;
  timestamp: number;
}

export interface GameState {
  roomId: string;
  status: GameStatus;
  maxPlayers: number;
  players: Player[];
  currentTurnIndex: number;
  lastDiceRoll: number | null;
  isRolling: boolean;
  winner: Player | null;
  moveHistory: MoveRecord[];
  activeEmotes: EmoteMessage[];
}

export type NetworkAction =
  | { type: 'JOIN_REQUEST'; player: { id: string; name: string; color: TokenColor; avatarSymbol?: AvatarSymbol } }
  | { type: 'JOIN_ACCEPTED'; state: GameState; assignedId: string }
  | { type: 'JOIN_REJECTED'; reason: string }
  | { type: 'PLAYER_READY'; playerId: string; isReady: boolean }
  | { type: 'PLAYER_CHANGE_COLOR'; playerId: string; color: TokenColor }
  | { type: 'PLAYER_CHANGE_AVATAR'; playerId: string; avatarSymbol: AvatarSymbol }
  | { type: 'START_GAME' }
  | { type: 'ROLL_REQUEST'; playerId: string }
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'SEND_EMOTE'; emote: EmoteMessage }
  | { type: 'RESTART_GAME' };

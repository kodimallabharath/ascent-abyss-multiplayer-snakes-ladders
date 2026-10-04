import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  Player,
  TokenColor,
  AvatarSymbol,
  MoveRecord,
  EmoteMessage,
  NetworkAction,
} from './types/game';
import { SNAKES_AND_LADDERS, TOKEN_THEMES } from './utils/board';
import { sound } from './utils/audio';
import { launchConfetti } from './utils/confetti';
import { peerService } from './utils/peerService';
import { Board } from './components/Board';
import { Dice } from './components/Dice';
import { Lobby } from './components/Lobby';
import { GameLog } from './components/GameLog';
import { EmoteOverlay } from './components/EmoteOverlay';
import { RulesModal } from './components/RulesModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { AvatarIcon, AVATAR_SYMBOLS_LIST } from './components/AvatarIcon';
import { PlayerAvatar } from './components/PlayerAvatar';
import { AvatarSelector } from './components/AvatarSelector';
import { Github } from './components/GithubIcon';
import {
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Users,
  Smartphone,
  Sparkles,
  Trophy,
  ArrowRight,
  Sun,
  Moon,
  Camera,
  Play,
  Bot,
  UserCheck,
  Home,
} from 'lucide-react';

const INITIAL_COLORS: TokenColor[] = [
  'crimson',
  'emerald',
  'sapphire',
  'amber',
  'amethyst',
  'obsidian',
  'cyan',
  'rose',
  'lime',
  'violet',
  'coral',
  'teal',
  'fuchsia',
  'bronze',
  'sky',
  'pearl',
];

export default function App() {
  const [view, setView] = useState<'welcome' | 'create_online' | 'join_online' | 'lobby' | 'game'>('welcome');
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);

  // User inputs
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState<TokenColor>('crimson');
  const [userAvatar, setUserAvatar] = useState<AvatarSymbol>('crown');
  const [inputRoomId, setInputRoomId] = useState('');
  const [maxPlayerCount, setMaxPlayerCount] = useState<number>(4);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>({
    roomId: '',
    status: 'setup',
    maxPlayers: 4,
    players: [],
    currentTurnIndex: 0,
    lastDiceRoll: null,
    isRolling: false,
    winner: null,
    moveHistory: [],
    activeEmotes: [],
  });

  const [localPlayerId, setLocalPlayerId] = useState<string>('');
  const [lastMoveInfo, setLastMoveInfo] = useState<{
    from: number;
    to: number;
    special?: 'ladder' | 'snake' | 'bounce' | 'win';
  } | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Auto-detect ?room= in URL to join instantly
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInputRoomId(roomParam.trim().toUpperCase());
        setView('join_online');
        setIsOnlineMode(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleTheme = () => {
    sound.playClick();
    setIsDarkMode(prev => !prev);
  };

  // Completely reset match and return cleanly to main menu
  const handleReturnToMenu = useCallback(() => {
    sound.playClick();
    peerService.destroy();
    setGameState({
      roomId: '',
      status: 'setup',
      maxPlayers: 4,
      players: [],
      currentTurnIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      winner: null,
      moveHistory: [],
      activeEmotes: [],
    });
    setLastMoveInfo(null);
    setErrorMessage(null);
    setView('welcome');
  }, []);

  // Core Dice Roll & Movement Step
  const handleExecuteDiceRoll = useCallback(() => {
    const state = gameStateRef.current;
    if (state.isRolling || state.winner || state.players.length === 0) return;

    const currentPlayer = state.players[state.currentTurnIndex];
    if (!currentPlayer) return;

    const roll = Math.floor(Math.random() * 6) + 1;

    // Trigger rolling state
    const rollingState: GameState = {
      ...state,
      isRolling: true,
      lastDiceRoll: roll,
    };
    setGameState(rollingState);
    if (peerService.isHost) peerService.broadcastState(rollingState);

    setTimeout(() => {
      const fromPos = currentPlayer.position;
      let targetPos = fromPos + roll;
      let specialEvent: 'ladder' | 'snake' | 'bounce' | 'win' | undefined = undefined;

      // Exact Roll Rule for Tile 100
      if (targetPos > 100) {
        const overshoot = targetPos - 100;
        targetPos = 100 - overshoot;
        specialEvent = 'bounce';
      }

      // Check Snake or Ladder on target position
      const snakeLadder = SNAKES_AND_LADDERS.find(sl => sl.from === targetPos);
      let finalPos = targetPos;

      if (snakeLadder) {
        if (snakeLadder.type === 'ladder') {
          finalPos = snakeLadder.to;
          specialEvent = 'ladder';
          setTimeout(() => sound.playLadderClimb(), 200);
        } else {
          finalPos = snakeLadder.to;
          specialEvent = 'snake';
          setTimeout(() => sound.playSnakeSlide(), 200);
        }
      } else {
        setTimeout(() => sound.playStep(), 150);
      }

      const isWin = finalPos === 100;
      if (isWin) {
        specialEvent = 'win';
        setTimeout(() => {
          sound.playWin();
          launchConfetti();
        }, 250);
      }

      const moveRecord: MoveRecord = {
        id: `move-${Date.now()}`,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerColor: currentPlayer.color,
        avatarSymbol: currentPlayer.avatarSymbol,
        roll,
        from: fromPos,
        to: finalPos,
        specialEvent,
        timestamp: Date.now(),
      };

      const nextTurnIndex = (state.currentTurnIndex + 1) % state.players.length;

      const finalState: GameState = {
        ...state,
        isRolling: false,
        lastDiceRoll: roll,
        players: state.players.map(p =>
          p.id === currentPlayer.id ? { ...p, position: finalPos } : p
        ),
        currentTurnIndex: nextTurnIndex,
        winner: isWin ? currentPlayer : null,
        status: isWin ? 'game_over' : 'playing',
        moveHistory: [moveRecord, ...state.moveHistory],
      };

      setLastMoveInfo({ from: fromPos, to: finalPos, special: specialEvent });
      setGameState(finalState);
      if (peerService.isHost) peerService.broadcastState(finalState);
    }, 650);
  }, []);

  // Setup PeerJS & BroadcastChannel listeners
  useEffect(() => {
    peerService.setCallbacks({
      onStateUpdate: (newState: GameState) => {
        // Self-heal: ensure Player 2's localPlayerId is always matched to their slot!
        if (!peerService.isHost) {
          setLocalPlayerId(prevId => {
            if (newState.players.some(p => p.id === prevId)) return prevId;
            const myName = (userName.trim() || 'Player').toLowerCase();
            const matched = newState.players.find(
              p => !p.isHost && (p.name.toLowerCase() === myName || p.id === peerService.myPeerId)
            );
            if (matched) return matched.id;
            const nonHost = newState.players.find(p => !p.isHost);
            if (nonHost) return nonHost.id;
            return prevId;
          });
        }

        setGameState(newState);
        if (newState.status === 'playing' && view !== 'game') {
          setView('game');
        } else if (newState.status === 'lobby' && view !== 'lobby') {
          setView('lobby');
        }
      },
      onJoinAccepted: (assignedId: string, newState: GameState) => {
        setLocalPlayerId(assignedId);
        setGameState(newState);
        setView(newState.status === 'playing' ? 'game' : 'lobby');
      },
      onEmote: (emote: EmoteMessage) => {
        sound.playEmote();
        setGameState(prev => ({
          ...prev,
          activeEmotes: [...prev.activeEmotes.slice(-5), emote],
        }));
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            activeEmotes: prev.activeEmotes.filter(e => e.id !== emote.id),
          }));
        }, 3200);
      },
      onError: (err: string) => {
        setErrorMessage(err);
      },
      onStatus: ({ peerId }) => {
        if (!peerService.isHost) {
          setLocalPlayerId(peerId);
        }
      },
    });

    // Handle peer actions on host
    const handleHostAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: NetworkAction; peerId: string }>;
      const { action, peerId } = customEvent.detail;
      const current = gameStateRef.current;

      if (!peerService.isHost) return;

      if (action.type === 'JOIN_REQUEST') {
        const { player } = action;
        const assignedId = peerId || player.id || `peer-${Date.now()}`;

        // If player already in list, send direct accept
        const existingPlayer = current.players.find(p => p.id === assignedId);
        if (existingPlayer) {
          peerService.sendToPeer(assignedId, {
            type: 'JOIN_ACCEPTED',
            assignedId,
            state: current,
          });
          return;
        }

        if (current.players.length >= current.maxPlayers) {
          peerService.sendToPeer(assignedId, { type: 'JOIN_REJECTED', reason: 'Room is full.' });
          return;
        }

        let assignedColor = player.color;
        const taken = current.players.map(p => p.color);
        if (taken.includes(assignedColor)) {
          const avail = INITIAL_COLORS.find(c => !taken.includes(c));
          if (avail) assignedColor = avail;
        }

        const newPlayer: Player = {
          id: assignedId,
          name: player.name || `Player ${current.players.length + 1}`,
          color: assignedColor,
          avatarSymbol: player.avatarSymbol || 'star',
          position: 1,
          isHost: false,
          isReady: true,
          connected: true,
        };

        const updated: GameState = {
          ...current,
          players: [...current.players, newPlayer],
        };

        setGameState(updated);
        // Explicitly send accept to that peer & broadcast to all
        peerService.sendToPeer(assignedId, {
          type: 'JOIN_ACCEPTED',
          assignedId,
          state: updated,
        });
        peerService.broadcastState(updated);
      } else if (action.type === 'PLAYER_READY') {
        const updated: GameState = {
          ...current,
          players: current.players.map(p =>
            p.id === action.playerId ? { ...p, isReady: action.isReady } : p
          ),
        };
        setGameState(updated);
        peerService.broadcastState(updated);
      } else if (action.type === 'PLAYER_CHANGE_COLOR') {
        const updated: GameState = {
          ...current,
          players: current.players.map(p =>
            p.id === action.playerId ? { ...p, color: action.color } : p
          ),
        };
        setGameState(updated);
        peerService.broadcastState(updated);
      } else if (action.type === 'PLAYER_CHANGE_AVATAR') {
        const updated: GameState = {
          ...current,
          players: current.players.map(p =>
            p.id === action.playerId ? { ...p, avatarSymbol: action.avatarSymbol } : p
          ),
        };
        setGameState(updated);
        peerService.broadcastState(updated);
      } else if (action.type === 'ROLL_REQUEST') {
        // Player 2 requested dice roll
        handleExecuteDiceRoll();
      } else if (action.type === 'SEND_EMOTE') {
        peerService.broadcastEmote(action.emote);
        setGameState(prev => ({
          ...prev,
          activeEmotes: [...prev.activeEmotes.slice(-5), action.emote],
        }));
      }
    };

    window.addEventListener('host_received_action', handleHostAction);
    return () => {
      window.removeEventListener('host_received_action', handleHostAction);
    };
  }, [view, userName, handleExecuteDiceRoll]);

  // Bot Turn Automation
  useEffect(() => {
    if (gameState.status !== 'playing' || gameState.isRolling || gameState.winner) return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (currentPlayer && currentPlayer.isBot) {
      if (!isOnlineMode || peerService.isHost) {
        const timer = setTimeout(() => {
          handleExecuteDiceRoll();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.status, gameState.currentTurnIndex, gameState.isRolling, gameState.winner, isOnlineMode, handleExecuteDiceRoll]);

  // Trigger Roll Action (Player 1 or Player 2)
  const onTriggerRoll = () => {
    sound.playClick();
    if (isOnlineMode && !peerService.isHost) {
      // Send roll request to host
      peerService.sendToHost({ type: 'ROLL_REQUEST', playerId: localPlayerId });
    } else {
      handleExecuteDiceRoll();
    }
  };

  // Host creates online room
  const handleCreateOnlineRoom = () => {
    sound.playClick();
    const cleanName = userName.trim() || 'Player 1 (Host)';
    const cleanRoom = Math.random().toString(36).substring(2, 7).toUpperCase();

    const hostPlayer: Player = {
      id: `host-${cleanRoom}`,
      name: cleanName,
      color: userColor,
      avatarSymbol: userAvatar,
      position: 1,
      isHost: true,
      isReady: true,
      connected: true,
    };

    const initial: GameState = {
      roomId: cleanRoom,
      status: 'lobby',
      maxPlayers: maxPlayerCount,
      players: [hostPlayer],
      currentTurnIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      winner: null,
      moveHistory: [],
      activeEmotes: [],
    };

    setGameState(initial);
    setLocalPlayerId(hostPlayer.id);
    setIsOnlineMode(true);
    setView('lobby');

    peerService.createRoom(cleanRoom, initial, assignedPeerId => {
      setLocalPlayerId(assignedPeerId);
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => (p.isHost ? { ...p, id: assignedPeerId } : p)),
      }));
    });
  };

  // Peer joins online room (Player 2)
  const handleJoinOnlineRoom = () => {
    sound.playClick();
    const cleanName = userName.trim() || 'Player 2';
    const cleanRoom = inputRoomId.trim().toUpperCase();

    if (!cleanRoom) {
      setErrorMessage('Please enter a valid Room ID.');
      return;
    }

    setErrorMessage(null);
    setIsOnlineMode(true);

    const tempId = `peer-${Date.now()}`;
    setLocalPlayerId(tempId);

    peerService.joinRoom(
      cleanRoom,
      { id: tempId, name: cleanName, color: userColor, avatarSymbol: userAvatar },
      assignedId => {
        setLocalPlayerId(assignedId);
        setView('lobby');
      }
    );
  };

  // 1-Click Instant 2-Player Pass & Play Game (Guaranteed 100% playable for 2 players!)
  const handleStart2PlayerGame = () => {
    sound.playClick();
    setIsOnlineMode(false);
    peerService.destroy();

    const p1Name = userName.trim() || 'Player 1';
    const p2Name = 'Player 2';

    const p1: Player = {
      id: 'local-p1',
      name: p1Name,
      color: userColor,
      avatarSymbol: userAvatar,
      position: 1,
      isHost: true,
      isReady: true,
      connected: true,
    };

    const p2: Player = {
      id: 'local-p2',
      name: p2Name,
      color: userColor === 'emerald' ? 'crimson' : 'emerald',
      avatarSymbol: userAvatar === 'star' ? 'lightning' : 'star',
      position: 1,
      isHost: false,
      isReady: true,
      connected: true,
    };

    const state: GameState = {
      roomId: 'LOCAL-2P',
      status: 'playing',
      maxPlayers: 2,
      players: [p1, p2],
      currentTurnIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      winner: null,
      moveHistory: [],
      activeEmotes: [],
    };

    setLocalPlayerId(p1.id);
    setGameState(state);
    setView('game');
  };

  // 1-Click Instant Solo vs AI Bot
  const handleQuickPlayWithBot = () => {
    sound.playClick();
    setIsOnlineMode(false);
    peerService.destroy();

    const humanName = userName.trim() || 'Player 1';
    const p1: Player = {
      id: 'local-1',
      name: humanName,
      color: userColor,
      avatarSymbol: userAvatar,
      position: 1,
      isHost: true,
      isReady: true,
      connected: true,
    };

    const bot: Player = {
      id: 'local-bot',
      name: 'Cyber Bot',
      color: userColor === 'emerald' ? 'crimson' : 'emerald',
      avatarSymbol: 'lightning',
      position: 1,
      isHost: false,
      isBot: true,
      isReady: true,
      connected: true,
    };

    const state: GameState = {
      roomId: 'OFFLINE',
      status: 'playing',
      maxPlayers: 2,
      players: [p1, bot],
      currentTurnIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      winner: null,
      moveHistory: [],
      activeEmotes: [],
    };

    setLocalPlayerId(p1.id);
    setGameState(state);
    setView('game');
  };

  // Start Multi-player Local Game (2 to 16 players)
  const handleStartLocalGame = (playerCount: number) => {
    sound.playClick();
    setIsOnlineMode(false);
    peerService.destroy();

    const initialPlayers: Player[] = [];
    const symbols: AvatarSymbol[] = [
      'circle', 'triangle', 'square', 'diamond', 'hexagon', 'cross',
      'star', 'crown', 'shield', 'lightning', 'flame', 'moon',
      'sun', 'compass', 'heart', 'sparkle',
    ];

    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        id: `local-${i + 1}`,
        name: i === 0 && userName.trim() ? userName.trim() : `Player ${i + 1}`,
        color: INITIAL_COLORS[i % INITIAL_COLORS.length],
        avatarSymbol: i === 0 ? userAvatar : symbols[i % symbols.length],
        position: 1,
        isHost: i === 0,
        isReady: true,
        connected: true,
      });
    }

    const state: GameState = {
      roomId: 'LOCAL',
      status: 'playing',
      maxPlayers: playerCount,
      players: initialPlayers,
      currentTurnIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      winner: null,
      moveHistory: [],
      activeEmotes: [],
    };

    setLocalPlayerId(initialPlayers[0].id);
    setGameState(state);
    setView('game');
  };

  // Add AI Bot
  const handleAddBot = () => {
    const current = gameState;
    if (current.players.length >= current.maxPlayers) return;

    const takenColors = current.players.map(p => p.color);
    const availColor = INITIAL_COLORS.find(c => !takenColors.includes(c)) || 'obsidian';
    const botNum = current.players.filter(p => p.isBot).length + 1;
    const botSymbols: AvatarSymbol[] = ['hexagon', 'triangle', 'diamond', 'circle', 'square', 'cross', 'shield', 'lightning'];

    const botPlayer: Player = {
      id: `bot-${Date.now()}-${botNum}`,
      name: `Cyborg ${botNum}`,
      color: availColor,
      avatarSymbol: botSymbols[(botNum - 1) % botSymbols.length],
      position: 1,
      isHost: false,
      isBot: true,
      isReady: true,
      connected: true,
    };

    const updated: GameState = {
      ...current,
      players: [...current.players, botPlayer],
    };
    setGameState(updated);
    if (isOnlineMode && peerService.isHost) {
      peerService.broadcastState(updated);
    }
  };

  const handleChangeAvatar = (symbol: AvatarSymbol) => {
    setUserAvatar(symbol);
    if (isOnlineMode) {
      peerService.sendToHost({
        type: 'PLAYER_CHANGE_AVATAR',
        playerId: localPlayerId,
        avatarSymbol: symbol,
      });
    } else {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => (p.id === localPlayerId ? { ...p, avatarSymbol: symbol } : p)),
      }));
    }
  };

  const handleRemovePlayer = (id: string) => {
    sound.playClick();
    const updated: GameState = {
      ...gameState,
      players: gameState.players.filter(p => p.id !== id),
    };
    setGameState(updated);
    if (isOnlineMode && peerService.isHost) {
      peerService.broadcastState(updated);
    }
  };

  const handleToggleReady = () => {
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return;
    const nextReady = !player.isReady;

    if (isOnlineMode) {
      peerService.sendToHost({
        type: 'PLAYER_READY',
        playerId: localPlayerId,
        isReady: nextReady,
      });
    } else {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => (p.id === localPlayerId ? { ...p, isReady: nextReady } : p)),
      }));
    }
  };

  const handleChangeColor = (color: TokenColor) => {
    if (isOnlineMode) {
      peerService.sendToHost({
        type: 'PLAYER_CHANGE_COLOR',
        playerId: localPlayerId,
        color,
      });
    } else {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => (p.id === localPlayerId ? { ...p, color } : p)),
      }));
    }
  };

  const handleStartGame = () => {
    let players = gameState.players;
    if (players.length < 2) {
      const taken = players.map(p => p.color);
      const avail = INITIAL_COLORS.find(c => !taken.includes(c)) || 'emerald';
      players = [
        ...players,
        {
          id: `bot-${Date.now()}`,
          name: 'AI Challenger',
          color: avail,
          position: 1,
          isHost: false,
          isBot: true,
          isReady: true,
          connected: true,
        },
      ];
    }

    const updated: GameState = {
      ...gameState,
      players,
      status: 'playing',
      currentTurnIndex: 0,
      lastDiceRoll: null,
      winner: null,
    };
    setGameState(updated);
    setView('game');
    if (isOnlineMode && peerService.isHost) {
      peerService.broadcastState(updated);
    }
  };

  const handleRestartGame = () => {
    sound.playClick();
    const resetPlayers = gameState.players.map(p => ({
      ...p,
      position: 1,
    }));
    const updated: GameState = {
      ...gameState,
      status: 'playing',
      players: resetPlayers,
      currentTurnIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      winner: null,
      moveHistory: [],
    };
    setGameState(updated);
    setLastMoveInfo(null);
    if (isOnlineMode && peerService.isHost) {
      peerService.broadcastState(updated);
    }
  };

  const handleSendEmote = (emoji: string) => {
    const me = gameState.players.find(p => p.id === localPlayerId);
    const emote: EmoteMessage = {
      id: `emote-${Date.now()}-${Math.random()}`,
      playerId: localPlayerId,
      playerName: me ? me.name : 'Player',
      emoji,
      timestamp: Date.now(),
    };

    setGameState(prev => ({
      ...prev,
      activeEmotes: [...prev.activeEmotes.slice(-5), emote],
    }));

    if (isOnlineMode) {
      peerService.broadcastEmote(emote);
    }

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        activeEmotes: prev.activeEmotes.filter(e => e.id !== emote.id),
      }));
    }, 3200);
  };

  // Active turn verification
  const currentTurnPlayer = gameState.players[gameState.currentTurnIndex];
  
  // In Online mode: it's my turn if currentTurnPlayer.id matches localPlayerId OR if Player 2's name matches userName
  const isMyTurn = !isOnlineMode
    ? true // In local mode, anyone at the device can roll
    : currentTurnPlayer?.id === localPlayerId ||
      (!peerService.isHost && currentTurnPlayer && !currentTurnPlayer.isHost && (currentTurnPlayer.name.toLowerCase() === (userName.trim() || 'player 2').toLowerCase() || currentTurnPlayer.id === peerService.myPeerId));

  const canRoll = isMyTurn && !gameState.isRolling && !gameState.winner && !currentTurnPlayer?.isBot;

  // Host fallback option: can roll on behalf of Player 2 if sitting together or if Player 2 has network delay
  const hostCanAssistRoll = isOnlineMode && peerService.isHost && !isMyTurn && !gameState.isRolling && !gameState.winner;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'} transition-colors flex flex-col font-sans`}>
      {/* Top Navbar */}
      <header className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div
            onClick={() => {
              if (view !== 'welcome') {
                handleReturnToMenu();
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-rose-600 flex items-center justify-center font-bold text-neutral-950 shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                Ascent & Abyss
              </span>
              <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-mono">
                Snakes & Ladders 100
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {view !== 'welcome' && (
              <button
                onClick={handleReturnToMenu}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Return to Main Menu"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>Menu</span>
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                setIsRulesOpen(true);
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
              title="Game Rules"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-400" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsGithubOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="GitHub Pages Deployment Guide"
            >
              <Github className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">GitHub Pages</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs underline hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Welcome Screen */}
        {view === 'welcome' && (
          <div className="max-w-lg mx-auto w-full flex flex-col gap-4 py-3 sm:py-6 text-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-400 mb-2 shadow-xs">
                <span>WebRTC P2P</span>
                <span>·</span>
                <span>100 Cells</span>
                <span>·</span>
                <span>Procedural Audio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Ascent & Abyss
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                Play the classic 100-cell Snakes & Ladders game online or locally with 2 to 6 players.
              </p>
            </div>

            {/* FEATURED: Instant 2-Player Game (1-Click Start) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Instant 2-Player Game
                </span>
                <h3 className="font-extrabold text-white text-base">Play 2 Players (Player 1 vs Player 2)</h3>
                <p className="text-xs text-neutral-300">Take turns rolling the 3D dice on this device. Guaranteed zero setup!</p>
              </div>
              <button
                onClick={handleStart2PlayerGame}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center gap-2 shadow-md hover:shadow-xl active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start 2 Players!</span>
              </button>
            </div>

            {/* Profile Config */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl text-left flex flex-col gap-3 shadow-lg">
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name (e.g. Player 1)"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  maxLength={16}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Your Coin Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {INITIAL_COLORS.map(col => {
                    const theme = TOKEN_THEMES[col];
                    const isSelected = userColor === col;
                    return (
                      <button
                        key={col}
                        onClick={() => {
                          sound.playClick();
                          setUserColor(col);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-800 border-white text-white shadow-xs'
                            : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-600 text-neutral-300'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <span>{theme.name.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimalist Geometric Shape & Symbol Profile Avatar Selector */}
              <div className="pt-2.5 border-t border-neutral-800/80">
                <AvatarSelector
                  selectedSymbol={userAvatar}
                  color={userColor}
                  playerName={userName.trim() || 'Player 1'}
                  onSelect={setUserAvatar}
                />
              </div>
            </div>

            {/* Multiplayer Modes Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  sound.playClick();
                  setView('create_online');
                }}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/60 transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group hover:bg-neutral-900 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                    Host Online Room
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                    Create Online Room
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Get a QR code & link to invite Player 2 from their phone or PC.
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Create Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  setView('join_online');
                }}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-sky-500/60 transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group hover:bg-neutral-900 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold">
                    Join Room (Player 2)
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                    Join Friend&apos;s Room
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Enter host&apos;s Room ID or scan QR to play as Player 2.
                  </p>
                </div>
                <div className="text-xs font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Join Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Group Play / Pass & Play up to 16 members */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2.5 text-left shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-200">
                    Pass & Play on One Device (Up to 16 Players)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Local Group</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[2, 3, 4, 5, 6, 8, 10, 12, 16].map(num => (
                  <button
                    key={num}
                    onClick={() => handleStartLocalGame(num)}
                    className="flex-1 min-w-[45px] py-1.5 rounded-lg text-xs font-bold bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer text-center"
                    title={`Start ${num}-Player Game`}
                  >
                    {num}P
                  </button>
                ))}
              </div>
            </div>

            {/* Solo / Bot Option */}
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-850 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">
                    Solo Game vs AI Bot
                  </h4>
                  <p className="text-[11px] text-neutral-400">Play alone against a computer player.</p>
                </div>
              </div>
              <button
                onClick={handleQuickPlayWithBot}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
              >
                Play Bot
              </button>
            </div>
          </div>
        )}

        {/* 2. Create Online Room Screen */}
        {view === 'create_online' && (
          <div className="max-w-md mx-auto w-full flex flex-col gap-4 p-5 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white tracking-tight">Create Online Room</h2>
              <button
                onClick={() => {
                  sound.playClick();
                  setView('welcome');
                }}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Host a room for up to 16 players. Invite friends via link or QR code.
            </p>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Player Capacity
                </label>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {maxPlayerCount} Players
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-2.5">
                {[2, 3, 4, 6, 8, 10, 12, 16].map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      sound.playClick();
                      setMaxPlayerCount(count);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      maxPlayerCount === count
                        ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={maxPlayerCount}
                onChange={e => setMaxPlayerCount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-neutral-800 flex gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setView('welcome');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>← Back to Menu</span>
              </button>
              <button
                onClick={handleCreateOnlineRoom}
                className="flex-2 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer shadow-md"
              >
                Generate Room & QR
              </button>
            </div>
          </div>
        )}

        {/* 3. Join Online Room Screen (Player 2 - 16) */}
        {view === 'join_online' && (
          <div className="max-w-md mx-auto w-full flex flex-col gap-4 p-5 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white tracking-tight">Join Online Room</h2>
              <button
                onClick={() => {
                  sound.playClick();
                  setView('welcome');
                }}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Enter the 5-character Room ID from Host or from a scanned QR link.
            </p>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Room ID
              </label>
              <input
                type="text"
                placeholder="e.g. 7K9X2"
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-base font-bold text-amber-300 uppercase tracking-widest focus:outline-hidden focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="pt-3 border-t border-neutral-800 flex gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setView('welcome');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>← Back to Menu</span>
              </button>
              <button
                onClick={handleJoinOnlineRoom}
                className="flex-2 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-neutral-950 transition-colors cursor-pointer shadow-md"
              >
                Connect to Room
              </button>
            </div>
          </div>
        )}

        {/* 4. Lobby View */}
        {view === 'lobby' && (
          <Lobby
            isHost={peerService.isHost || !isOnlineMode}
            roomId={gameState.roomId}
            players={gameState.players}
            maxPlayers={gameState.maxPlayers}
            localPlayerId={localPlayerId}
            onStartGame={handleStartGame}
            onLeaveLobby={handleReturnToMenu}
            onAddBot={handleAddBot}
            onRemovePlayer={handleRemovePlayer}
            onToggleReady={handleToggleReady}
            onChangeColor={handleChangeColor}
            onChangeAvatar={handleChangeAvatar}
            isOnlineMode={isOnlineMode}
          />
        )}

        {/* 5. Active Game View */}
        {view === 'game' && (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Turn & Status Header Banner */}
            <div className="w-full max-w-[560px] px-3 sm:px-4 py-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={handleReturnToMenu}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center gap-1 cursor-pointer shrink-0"
                  title="Back to Menu"
                >
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Menu</span>
                </button>

                {currentTurnPlayer && (
                  <PlayerAvatar
                    player={currentTurnPlayer}
                    size="sm"
                    isCurrentTurn={!gameState.winner}
                    showGlow
                  />
                )}
                <div className="truncate">
                  <span className="text-[11px] text-neutral-400 block font-medium leading-none">
                    {gameState.winner ? 'Match Ended' : 'Current Turn'}
                  </span>
                  <span className="text-sm font-bold text-white truncate">
                    {currentTurnPlayer?.name}
                    {isMyTurn && ' (Your Turn!)'}
                    {currentTurnPlayer?.isBot && ' (AI)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lastMoveInfo && (
                  <div className="text-[11px] font-mono text-neutral-400 hidden sm:block">
                    Tile <strong className="text-white">{lastMoveInfo.to}</strong>
                  </div>
                )}
                <EmoteOverlay
                  emotes={gameState.activeEmotes}
                  onSendEmote={handleSendEmote}
                  disabled={gameState.status !== 'playing'}
                />
              </div>
            </div>

            {/* Main Game Layout: Board + Controls */}
            <div className="w-full flex flex-col lg:flex-row gap-5 items-center lg:items-start justify-center">
              {/* Board Arena */}
              <div className="w-full max-w-[560px] flex flex-col items-center">
                <Board
                  players={gameState.players}
                  currentTurnPlayerId={currentTurnPlayer?.id || ''}
                  activeCellHighlight={currentTurnPlayer?.position}
                  lastMovePath={lastMoveInfo}
                />

                {/* PROMINENT INTEGRATED DICE CONTROL BAR */}
                <div className="w-full mt-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/95 border-2 border-neutral-800 shadow-2xl flex flex-col items-center justify-center gap-2.5">
                  <div className="w-full flex items-center justify-between px-2 text-xs font-semibold text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <PlayerAvatar
                        player={currentTurnPlayer}
                        size="xs"
                        showGlow={false}
                      />
                      <span>{currentTurnPlayer?.name}&apos;s Roll</span>
                    </span>
                    <span className="font-mono text-neutral-300">
                      Tile {currentTurnPlayer?.position} / 100
                    </span>
                  </div>

                  {/* Tactile Ivory Dice & Roll Action */}
                  <Dice
                    value={gameState.lastDiceRoll}
                    isRolling={gameState.isRolling}
                    canRoll={canRoll}
                    onRoll={onTriggerRoll}
                    playerColor={TOKEN_THEMES[currentTurnPlayer?.color || 'crimson']?.primary}
                    playerName={currentTurnPlayer?.name}
                    isMyTurn={isMyTurn}
                  />

                  {/* Host Assist Fallback: Enables Host to roll if Player 2 is sharing device or lagging */}
                  {hostCanAssistRoll && (
                    <div className="w-full pt-1.5 border-t border-neutral-800 flex justify-center">
                      <button
                        onClick={handleExecuteDiceRoll}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 underline cursor-pointer"
                      >
                        <span>Host Assist: Roll for {currentTurnPlayer?.name}</span>
                      </button>
                    </div>
                  )}

                  <div className="w-full pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={handleReturnToMenu}
                      className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      <span>Back to Menu</span>
                    </button>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {gameState.players.length} Players
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar: Players List & Move Feed */}
              <div className="w-full max-w-[560px] lg:w-80 flex flex-col gap-3.5">
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-neutral-800 flex items-center justify-between">
                    <span>Players in Game</span>
                    <span className="font-mono text-[10px]">Position</span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {gameState.players.map((p, idx) => {
                      const theme = TOKEN_THEMES[p.color];
                      const isTurn = idx === gameState.currentTurnIndex;
                      const isThisPlayerMe = p.id === localPlayerId || (!peerService.isHost && !p.isHost && isOnlineMode);

                      return (
                        <div
                          key={p.id}
                          className={`p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            isTurn
                              ? 'bg-neutral-800/90 border border-amber-500/40 font-semibold'
                              : 'bg-neutral-950/40 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <PlayerAvatar
                              player={p}
                              size="xs"
                              isCurrentTurn={isTurn}
                              showGlow={false}
                            />
                            <span className="truncate">{p.name}</span>
                            {isThisPlayerMe && (
                              <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                                You
                              </span>
                            )}
                            {p.isBot && (
                              <span className="text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded">
                                AI
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-neutral-100">
                            Tile {p.position}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-44 sm:h-52">
                  <GameLog logs={gameState.moveHistory} />
                </div>

                <button
                  onClick={handleReturnToMenu}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Exit Game to Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Victory Overlay */}
        {gameState.winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg animate-bounce">
                  <Trophy className="w-8 h-8 fill-current" />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <PlayerAvatar
                    player={gameState.winner}
                    size="md"
                    showGlow
                  />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                  Victorious Champion
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">
                  {gameState.winner.name} Reached 100!
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Mastered all snakes & ladders to conquer the peak.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <button
                  onClick={handleRestartGame}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={handleReturnToMenu}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <GitHubPagesModal isOpen={isGithubOpen} onClose={() => setIsGithubOpen(false)} />
    </div>
  );
}

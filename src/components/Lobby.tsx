import React, { useState, useEffect, useRef } from 'react';
import { Player, TokenColor, AvatarSymbol } from '../types/game';
import { TOKEN_THEMES } from '../utils/board';
import { sound } from '../utils/audio';
import { PlayerAvatar } from './PlayerAvatar';
import { AvatarSelector } from './AvatarSelector';
import { AvatarIcon } from './AvatarIcon';
import {
  Users,
  Copy,
  Check,
  QrCode,
  Camera,
  Bot,
  Play,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LobbyProps {
  isHost: boolean;
  roomId: string;
  players: Player[];
  maxPlayers: number;
  localPlayerId: string;
  onStartGame: () => void;
  onLeaveLobby?: () => void;
  onAddBot?: () => void;
  onRemovePlayer?: (playerId: string) => void;
  onToggleReady: () => void;
  onChangeColor: (color: TokenColor) => void;
  onChangeAvatar?: (symbol: AvatarSymbol) => void;
  isOnlineMode: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({
  isHost,
  roomId,
  players,
  maxPlayers,
  localPlayerId,
  onStartGame,
  onLeaveLobby,
  onAddBot,
  onRemovePlayer,
  onToggleReady,
  onChangeColor,
  onChangeAvatar,
  isOnlineMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const qrContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerInstanceRef = useRef<any>(null);

  const localPlayer = players.find(p => p.id === localPlayerId);

  // Generate shareable link
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : `?room=${roomId}`;

  // Generate QR Code into container using qrcode.js CDN or SVG canvas
  useEffect(() => {
    if (!showQrModal && !qrContainerRef.current) return;

    const timer = setTimeout(() => {
      const container = qrContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      if (window.QRCode) {
        try {
          new window.QRCode(container, {
            text: shareUrl,
            width: 220,
            height: 220,
            colorDark: '#0a0a0a',
            colorLight: '#ffffff',
            correctLevel: 2, // High error correction
          });
        } catch (e) {
          console.error('QRCode creation failed', e);
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [showQrModal, roomId, shareUrl]);

  // Handle Camera QR Scanner
  useEffect(() => {
    if (!showScannerModal) {
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.stop().then(() => {
            scannerInstanceRef.current.clear();
          });
        } catch {
          // ignore
        }
        scannerInstanceRef.current = null;
      }
      return;
    }

    setScannerError(null);
    const scannerDivId = 'html5-qr-reader';

    const timer = setTimeout(async () => {
      if (!window.Html5Qrcode) {
        setScannerError('Scanner library is loading. You can also paste the Room ID directly.');
        return;
      }

      try {
        const html5QrCode = new window.Html5Qrcode(scannerDivId);
        scannerInstanceRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText: string) => {
            sound.playClick();
            // Stop scanning and parse Room ID
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              scannerInstanceRef.current = null;
              setShowScannerModal(false);

              // Check if URL has ?room=
              try {
                const url = new URL(decodedText);
                const r = url.searchParams.get('room');
                if (r) {
                  window.location.search = `?room=${r}`;
                  return;
                }
              } catch {
                // Not full URL, might be raw room id
              }
              window.location.search = `?room=${encodeURIComponent(decodedText.trim())}`;
            });
          },
          () => {
            // ignore scan frame misses
          }
        );
      } catch (err: unknown) {
        console.warn('Camera scan start failed', err);
        setScannerError('Could not access camera. Please allow camera permissions or enter the Room code manually.');
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.stop().catch(() => {});
        } catch {
          // ignore
        }
      }
    };
  }, [showScannerModal]);

  const copyShareLink = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const copyRoomCode = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Color availability (16 distinct colors)
  const colors: TokenColor[] = [
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
  const takenColors = players
    .filter(p => p.id !== localPlayerId)
    .map(p => p.color);

  const canStart = isHost && players.length >= 2;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 p-4 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            {onLeaveLobby && (
              <button
                onClick={() => {
                  sound.playClick();
                  onLeaveLobby();
                }}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-semibold pr-2 border-r border-neutral-800 cursor-pointer"
                title="Return to Main Menu"
              >
                ← Back
              </button>
            )}
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
              {isOnlineMode ? 'WebRTC Multiplayer' : 'Local Pass & Play'}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs font-mono font-semibold text-neutral-300">
              {players.length}/{maxPlayers} Players
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Lobby: <span className="font-mono text-amber-400">{roomId}</span>
          </h2>
        </div>

        {/* Share & QR Code Actions (Online Mode) */}
        {isOnlineMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setShowQrModal(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>QR Code</span>
            </button>

            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Invite Link"
            >
              {copied ? <Check className="w-4 h-4 text-neutral-950" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Invite'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Shareable Link Bar (Online Mode) */}
      {isOnlineMode && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-neutral-500 text-xs font-mono select-none">CODE:</span>
            <span className="text-xs font-mono font-bold tracking-widest text-amber-300">
              {roomId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomCode}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Players List Grid */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-medium tracking-tight">Connected Players</span>
          {isHost && players.length < maxPlayers && onAddBot && (
            <button
              onClick={() => {
                sound.playClick();
                onAddBot();
              }}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+ Add AI Bot</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {players.map(player => {
            const theme = TOKEN_THEMES[player.color];
            const isMe = player.id === localPlayerId;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isMe
                    ? 'bg-neutral-800/80 border-amber-500/40 ring-1 ring-amber-500/20'
                    : 'bg-neutral-950/60 border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Token Circular Profile Avatar */}
                  <PlayerAvatar
                    player={player}
                    size="md"
                    showGlow
                  />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-neutral-100">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          You
                        </span>
                      )}
                      {player.isHost && (
                        <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">
                          Host
                        </span>
                      )}
                      {player.isBot && (
                        <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          BOT
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <span>{theme.name.split(' ')[1]}</span>
                      {player.avatarSymbol && (
                        <>
                          <span className="text-neutral-600">·</span>
                          <span className="capitalize text-amber-400/90">{player.avatarSymbol}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Status or Remove Bot */}
                <div className="flex items-center gap-2">
                  {isHost && player.isBot && onRemovePlayer && (
                    <button
                      onClick={() => onRemovePlayer(player.id)}
                      className="text-neutral-500 hover:text-rose-400 text-xs p-1 rounded hover:bg-neutral-800 transition-colors"
                      title="Remove Bot"
                    >
                      ✕
                    </button>
                  )}
                  {isOnlineMode && !player.isHost && (
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                        player.isReady
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {player.isReady ? 'Ready' : 'Waiting'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Customizer for Local Player */}
      {localPlayer && (
        <div className="pt-2 border-t border-neutral-800/80">
          <label className="text-xs text-neutral-400 font-medium block mb-2">
            Choose Your Coin Theme
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map(col => {
              const theme = TOKEN_THEMES[col];
              const isSelected = localPlayer.color === col;
              const isTaken = takenColors.includes(col);

              return (
                <button
                  key={col}
                  disabled={isTaken}
                  onClick={() => {
                    sound.playClick();
                    onChangeColor(col);
                  }}
                  className={`relative px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-neutral-800 border-white text-white shadow-xs'
                      : isTaken
                      ? 'opacity-30 border-neutral-800 bg-neutral-900 cursor-not-allowed text-neutral-500'
                      : 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-500 text-neutral-300 cursor-pointer'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span>{theme.name.split(' ')[1]}</span>
                  {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Avatar Geometric Symbol Customizer */}
          {onChangeAvatar && (
            <div className="pt-3 mt-3 border-t border-neutral-800/60">
              <AvatarSelector
                selectedSymbol={localPlayer.avatarSymbol || 'circle'}
                color={localPlayer.color}
                playerName={localPlayer.name}
                onSelect={onChangeAvatar}
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Start / Ready Controls */}
      <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-neutral-400">
          {players.length < 2 ? (
            <span className="text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Need at least 2 players to start game
            </span>
          ) : (
            <span>Ready to roll the dice on 100 tiles!</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onLeaveLobby && (
            <button
              onClick={() => {
                sound.playClick();
                onLeaveLobby();
              }}
              className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer"
            >
              Leave Room
            </button>
          )}

          {isOnlineMode && !isHost && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleReady();
              }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer ${
                localPlayer?.isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {localPlayer?.isReady ? 'Mark Not Ready' : 'I am Ready!'}
            </button>
          )}

          {isHost && (
            <button
              onClick={() => {
                sound.playClick();
                onStartGame();
              }}
              disabled={!canStart}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md ${
                canStart
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer hover:shadow-lg active:scale-95'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-800'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Game</span>
            </button>
          )}
        </div>
      </div>

      {/* QR Code Modal for Easy Phone Joining */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white">Scan to Join Game</h3>
            <p className="text-xs text-neutral-400">
              Open your phone camera to scan this QR code and join the room instantly.
            </p>

            {/* QR Container */}
            <div className="p-3 bg-white rounded-xl shadow-inner flex items-center justify-center">
              <div ref={qrContainerRef} className="w-[220px] h-[220px] flex items-center justify-center" />
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={copyShareLink}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Copy Shareable URL</span>
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera QR Scanner Modal (For Peers wishing to scan host QR) */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white">Scan Room QR Code</h3>
            <p className="text-xs text-neutral-400">
              Point your camera at the host's QR code.
            </p>

            <div
              id="html5-qr-reader"
              ref={scannerRef}
              className="w-full max-w-[260px] aspect-square rounded-xl overflow-hidden bg-black border border-neutral-800"
            />

            {scannerError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800">
                {scannerError}
              </p>
            )}

            <button
              onClick={() => setShowScannerModal(false)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

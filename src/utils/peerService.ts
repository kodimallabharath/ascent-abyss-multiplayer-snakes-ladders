import { GameState, NetworkAction, EmoteMessage, TokenColor, AvatarSymbol } from '../types/game';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Peer: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    QRCode: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Html5Qrcode: any;
  }
}

type StateCallback = (state: GameState) => void;
type EmoteCallback = (emote: EmoteMessage) => void;
type ErrorCallback = (error: string) => void;
type StatusCallback = (status: { connected: boolean; peerId: string; isHost: boolean }) => void;
type JoinAcceptedCallback = (assignedId: string, state: GameState) => void;

export class PeerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private peer: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private connections: Map<string, any> = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hostConnection: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  
  public isHost: boolean = false;
  public myPeerId: string = '';
  public currentRoomId: string = '';
  public myNickName: string = '';

  private onStateUpdateCb: StateCallback | null = null;
  private onEmoteCb: EmoteCallback | null = null;
  private onErrorCb: ErrorCallback | null = null;
  private onStatusCb: StatusCallback | null = null;
  private onJoinAcceptedCb: JoinAcceptedCallback | null = null;

  public setCallbacks(callbacks: {
    onStateUpdate?: StateCallback;
    onEmote?: EmoteCallback;
    onError?: ErrorCallback;
    onStatus?: StatusCallback;
    onJoinAccepted?: JoinAcceptedCallback;
  }) {
    if (callbacks.onStateUpdate) this.onStateUpdateCb = callbacks.onStateUpdate;
    if (callbacks.onEmote) this.onEmoteCb = callbacks.onEmote;
    if (callbacks.onError) this.onErrorCb = callbacks.onError;
    if (callbacks.onStatus) this.onStatusCb = callbacks.onStatus;
    if (callbacks.onJoinAccepted) this.onJoinAcceptedCb = callbacks.onJoinAccepted;
  }

  // Cross-tab broadcast channel for instantaneous zero-latency local tab testing
  private initBroadcastChannel(roomId: string) {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
      }
      this.broadcastChannel = new BroadcastChannel(`ascent_snl_${roomId.toUpperCase()}`);
      this.broadcastChannel.onmessage = (event) => {
        const action = event.data as NetworkAction;
        if (!action || !action.type) return;

        if (this.isHost) {
          const peerId = (action as { playerId?: string }).playerId || 
                         (action as { player?: { id: string } }).player?.id || 
                         'tab-peer';
          window.dispatchEvent(
            new CustomEvent('host_received_action', {
              detail: { action, peerId },
            })
          );
        } else {
          this.handleClientReceivedAction(action);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  // Create room as host
  public async createRoom(
    roomId: string,
    initialState: GameState,
    onPeerReady: (peerId: string) => void
  ): Promise<void> {
    this.destroy();
    this.isHost = true;
    this.currentRoomId = roomId;

    this.initBroadcastChannel(roomId);

    let attempts = 0;
    while (!window.Peer && attempts < 15) {
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }

    if (!window.Peer) {
      console.warn('PeerJS CDN not reached, continuing with cross-tab local multiplayer');
      this.myPeerId = `host-${roomId}`;
      onPeerReady(this.myPeerId);
      this.onStatusCb?.({ connected: true, peerId: this.myPeerId, isHost: true });
      return;
    }

    try {
      const peerId = `snl-room-${roomId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      this.peer = new window.Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
      });

      this.peer.on('open', (id: string) => {
        this.myPeerId = id;
        this.onStatusCb?.({ connected: true, peerId: id, isHost: true });
        onPeerReady(id);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.peer.on('connection', (conn: any) => {
        const peerKey = conn.peer;
        this.connections.set(peerKey, conn);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conn.on('data', (data: NetworkAction) => {
          this.handleHostReceivedAction(data, conn, initialState);
        });

        conn.on('close', () => {
          this.connections.delete(peerKey);
        });

        conn.on('error', (err: unknown) => {
          console.warn('Connection error with peer:', peerKey, err);
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.peer.on('error', (err: any) => {
        console.warn('Host Peer notice:', err);
        if (err.type === 'unavailable-id') {
          const fallbackId = `snl-room-${roomId}-${Math.floor(Math.random() * 1000)}`;
          this.createRoom(fallbackId, initialState, onPeerReady);
        }
      });
    } catch (e) {
      console.error('Failed to create Peer:', e);
      this.myPeerId = `host-${roomId}`;
      onPeerReady(this.myPeerId);
    }
  }

  // Join existing room as peer (Player 2)
  public async joinRoom(
    roomId: string,
    playerInfo: { id: string; name: string; color: TokenColor; avatarSymbol?: AvatarSymbol },
    onConnected: (assignedId: string) => void
  ): Promise<void> {
    this.destroy();
    this.isHost = false;
    this.currentRoomId = roomId;
    this.myNickName = playerInfo.name;

    this.initBroadcastChannel(roomId);

    const localId = playerInfo.id || `peer-${Date.now()}`;
    this.myPeerId = localId;

    // Send immediate join request via BroadcastChannel
    if (this.broadcastChannel) {
      const joinReq: NetworkAction = {
        type: 'JOIN_REQUEST',
        player: { ...playerInfo, id: localId },
      };
      this.broadcastChannel.postMessage(joinReq);
      onConnected(localId);
    }

    let attempts = 0;
    while (!window.Peer && attempts < 15) {
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }

    if (!window.Peer) {
      return;
    }

    try {
      this.peer = new window.Peer(undefined, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
      });

      this.peer.on('open', (myId: string) => {
        this.myPeerId = myId;
        const targetHostId = `snl-room-${roomId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        
        const conn = this.peer.connect(targetHostId, {
          reliable: true,
        });

        this.hostConnection = conn;

        conn.on('open', () => {
          this.onStatusCb?.({ connected: true, peerId: myId, isHost: false });
          const joinReq: NetworkAction = {
            type: 'JOIN_REQUEST',
            player: { ...playerInfo, id: myId },
          };
          conn.send(joinReq);
          onConnected(myId);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conn.on('data', (data: NetworkAction) => {
          this.handleClientReceivedAction(data);
        });

        conn.on('close', () => {
          this.onStatusCb?.({ connected: false, peerId: myId, isHost: false });
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conn.on('error', (err: any) => {
          console.warn('Client peer conn warning:', err);
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.peer.on('error', (err: any) => {
        console.warn('Client peer error:', err);
      });
    } catch (e) {
      console.warn('Could not initialize client WebRTC:', e);
    }
  }

  // Host sends direct message to a specific connected peer
  public sendToPeer(peerId: string, action: NetworkAction) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send(action);
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(action);
    }
  }

  // Host broadcasts state update to all connected peers
  public broadcastState(state: GameState) {
    if (!this.isHost) return;
    const action: NetworkAction = {
      type: 'STATE_UPDATE',
      state,
    };
    
    this.connections.forEach(conn => {
      if (conn && conn.open) {
        conn.send(action);
      }
    });

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(action);
    }
  }

  // Broadcast an emote
  public broadcastEmote(emote: EmoteMessage) {
    const action: NetworkAction = {
      type: 'SEND_EMOTE',
      emote,
    };
    if (this.isHost) {
      this.connections.forEach(conn => {
        if (conn && conn.open) conn.send(action);
      });
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(action);
      }
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send(action);
      }
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(action);
      }
    }
  }

  // Send action from client (Player 2) to host
  public sendToHost(action: NetworkAction) {
    let sent = false;
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(action);
      sent = true;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(action);
      sent = true;
    }
    return sent;
  }

  // Delegate for host action reception
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleHostReceivedAction(action: NetworkAction, conn: any, _initialState: GameState) {
    const peerKey = conn?.peer || 
                    (action as { playerId?: string }).playerId || 
                    (action as { player?: { id: string } }).player?.id || 
                    'peer';
    window.dispatchEvent(new CustomEvent('host_received_action', { detail: { action, peerId: peerKey } }));
  }

  // Delegate for client action reception
  private handleClientReceivedAction(action: NetworkAction) {
    if (action.type === 'STATE_UPDATE') {
      this.onStateUpdateCb?.(action.state);
    } else if (action.type === 'JOIN_ACCEPTED') {
      this.myPeerId = action.assignedId;
      this.onJoinAcceptedCb?.(action.assignedId, action.state);
      this.onStateUpdateCb?.(action.state);
    } else if (action.type === 'SEND_EMOTE') {
      this.onEmoteCb?.(action.emote);
    } else if (action.type === 'JOIN_REJECTED') {
      this.onErrorCb?.(action.reason || 'Join request rejected.');
    }
  }

  public destroy() {
    try {
      this.connections.forEach(conn => conn.close());
      this.connections.clear();
      if (this.hostConnection) {
        this.hostConnection.close();
        this.hostConnection = null;
      }
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
        this.broadcastChannel = null;
      }
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
    } catch {
      // ignore
    }
  }
}

export const peerService = new PeerService();

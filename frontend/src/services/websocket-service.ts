import type { Message, ShipForCreation } from '@/types';
import { io, Socket } from 'socket.io-client';

export interface GameWebSocketEvents {
  // Events we send to server
  'join-game': (data: { gameId: number; username: string }) => void;
  'leave-game': () => void;
  'request-game-state': (data: { gameId: number }) => void;
  'send-message': (data: { message: string }) => void;

  // Events we receive from server
  'joined-game': (data: { gameId: number; username: string }) => void;
  'game-state-update': (data: any) => void;
  'player-connected': (data: { username: string }) => void;
  'player-disconnected': (data: { username: string }) => void;
  'shot-fired': (data: {
    player: string;
    x: number;
    y: number;
    hit: boolean;
    shot: any;
  }) => void;
  'turn-changed': (data: { currentTurn: string; previousTurn: string }) => void;
  'ships-placed': (data: { player: string; ships: any[] }) => void;
  'game-finished': (data: { winner: string; game: any }) => void;
  'message-received': (data: Message) => void;
  error: (data: { message: string }) => void;
}

export class GameWebSocketService {
  private socket: Socket | null = null;
  private gameId: number | null = null;
  private username: string | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private connectionPromise: Promise<void> | null = null;

  constructor(private serverUrl: string = 'http://localhost:3000') {}

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        this.connectionPromise = null;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection failed:', error);
        this.connectionPromise = null;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket server:', reason);
      });

      this.setupEventForwarding();
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.gameId = null;
    this.connectionPromise = null;
  }

  /**
   * Join a game room
   */
  async joinGame(gameId: number, username: string): Promise<void> {
    await this.connect();

    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    this.gameId = gameId;
    this.username = username;

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket connection lost'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Join game timeout'));
      }, 10000);

      const onJoined = () => {
        clearTimeout(timeout);
        this.socket?.off('joined-game', onJoined);
        this.socket?.off('error', onError);
        resolve();
      };

      const onError = (data: { message: string }) => {
        clearTimeout(timeout);
        this.socket?.off('joined-game', onJoined);
        this.socket?.off('error', onError);
        reject(new Error(data.message));
      };

      this.socket.once('joined-game', onJoined);
      this.socket.once('error', onError);

      this.socket.emit('join-game', { gameId, username });
    });
  }

  async postFleet(
    gameId: number,
    username: string,
    ships: ShipForCreation[]
  ): Promise<void> {
    await this.connect();

    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to server');
    }

    this.socket.emit('post-fleet', { gameId, username, ships });
  }

  async makeShot(
    gameId: number,
    username: string,
    x: number,
    y: number
  ): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to server');
    }

    this.socket.emit('make-shot', { gameId, username, x, y });
  }

  /**
   * Leave the current game room
   */
  leaveGame(): void {
    if (this.socket && this.socket.connected && this.gameId) {
      this.socket.emit('leave-game');
      this.gameId = null;
      this.username = null;
    }
  }

  /**
   * Request current game state
   */
  requestGameState(): void {
    if (this.socket && this.socket.connected && this.gameId) {
      this.socket.emit('request-game-state', { gameId: this.gameId });
    }
  }

  /**
   * Send a chat message
   */
  sendMessage(message: string): void {
    if (this.socket && this.socket.connected && this.gameId) {
      this.socket.emit('send-message', { message });
    }
  }

  /**
   * Add event listener
   */
  on<T extends keyof GameWebSocketEvents>(
    event: T,
    handler: GameWebSocketEvents[T]
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler as Function);
  }

  /**
   * Remove event listener
   */
  off<T extends keyof GameWebSocketEvents>(
    event: T,
    handler: GameWebSocketEvents[T]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as Function);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Remove all event listeners for an event
   */
  removeAllListeners(event?: keyof GameWebSocketEvents): void {
    if (event) {
      this.eventHandlers.delete(event);
    } else {
      this.eventHandlers.clear();
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current game ID
   */
  get currentGameId(): number | null {
    return this.gameId;
  }

  /**
   * Get current username
   */
  get currentUsername(): string | null {
    return this.username;
  }

  /**
   * Setup event forwarding from socket to our event handlers
   */
  private setupEventForwarding(): void {
    if (!this.socket) return;

    const events: (keyof GameWebSocketEvents)[] = [
      'joined-game',
      'game-state-update',
      'player-connected',
      'player-disconnected',
      'shot-fired',
      'turn-changed',
      'ships-placed',
      'game-finished',
      'message-received',
      'error',
    ];

    events.forEach((event) => {
      this.socket!.on(event, (...args) => {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach((handler) => {
            try {
              handler(...args);
            } catch (error) {
              console.error(`Error in ${event} handler:`, error);
            }
          });
        }
      });
    });
  }
}

// Create singleton instance
export const gameWebSocketService = new GameWebSocketService();

export default gameWebSocketService;

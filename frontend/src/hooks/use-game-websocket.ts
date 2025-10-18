import { useEffect, useState, useCallback, useRef } from 'react';
import { gameWebSocketService } from '@/services/websocket-service';
import type { GameWebSocketEvents } from '@/services/websocket-service';
import type { GameRoom, Message, ShipForCreation } from '@/types';

export interface UseGameWebSocketOptions {
  gameId?: number;
  username?: string;
  autoConnect?: boolean;
}

export interface UseGameWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  gameState: GameRoom | null;
  messages: Array<Message>;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  joinGame: (gameId: number, username: string) => Promise<void>;
  leaveGame: () => void;
  postFleet: (
    gameIe: number,
    username: string,
    ships: ShipForCreation[]
  ) => Promise<void>;
  makeShot: (
    gameId: number,
    username: string,
    x: number,
    y: number
  ) => Promise<void>;
  requestGameState: () => void;
  sendMessage: (message: string) => void;

  // Event listeners
  on: <T extends keyof GameWebSocketEvents>(
    event: T,
    handler: GameWebSocketEvents[T]
  ) => void;
  off: <T extends keyof GameWebSocketEvents>(
    event: T,
    handler: GameWebSocketEvents[T]
  ) => void;
}

export const useGameWebSocket = (
  options: UseGameWebSocketOptions = {}
): UseGameWebSocketReturn => {
  const { gameId, username, autoConnect = false } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const hasJoinedRef = useRef(false);

  // Connection functions
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      await gameWebSocketService.connect();
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    gameWebSocketService.disconnect();
    setIsConnected(false);
    setGameState(null);
    setMessages([]);
    setError(null);
  }, []);

  const joinGame = useCallback(async (gameId: number, username: string) => {
    setError(null);
    try {
      console.log(
        `📞 joinGame called for game ${gameId}, username ${username}`
      );
      await gameWebSocketService.joinGame(gameId, username);
      console.log(`✅ Successfully joined game ${gameId}`);
    } catch (err) {
      console.error('❌ Failed to join game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
      throw err;
    }
  }, []);

  const postFleet = useCallback(
    async (gameId: number, username: string, ships: ShipForCreation[]) => {
      setError(null);
      try {
        await gameWebSocketService.postFleet(gameId, username, ships);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed setting up ships'
        );
      }
    },
    []
  );

  const makeShot = useCallback(
    async (gameId: number, username: string, x: number, y: number) => {
      setError(null);
      try {
        await gameWebSocketService.makeShot(gameId, username, x, y);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed making shot');
      }
    },
    []
  );

  const leaveGame = useCallback(() => {
    gameWebSocketService.leaveGame();
    setGameState(null);
  }, []);

  const requestGameState = useCallback(() => {
    gameWebSocketService.requestGameState();
  }, []);

  const sendMessage = useCallback((message: string) => {
    gameWebSocketService.sendMessage(message);
    setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), sender: username || 'you', content: message, timestamp: new Date().toISOString() }]);
  }, []);

  // Event listener management
  const on = useCallback(
    <T extends keyof GameWebSocketEvents>(
      event: T,
      handler: GameWebSocketEvents[T]
    ) => {
      gameWebSocketService.on(event, handler);
    },
    []
  );

  const off = useCallback(
    <T extends keyof GameWebSocketEvents>(
      event: T,
      handler: GameWebSocketEvents[T]
    ) => {
      gameWebSocketService.off(event, handler);
    },
    []
  );

  // Setup event handlers
  useEffect(() => {
    const handleGameStateUpdate = (data: GameRoom) => {
      console.log('🔄 Game state updated:', data);
      setGameState({...data});
    };

    const handlePlayerConnected = (data: { username: string }) => {
      console.log('👋 Player connected:', data.username);
    };

    const handlePlayerDisconnected = (data: { username: string }) => {
      console.log('👋 Player disconnected:', data.username);
    };

    const handleMessageReceived = (data: Message) => {
      console.log('💬 Message received:', data);
      setMessages((prev) => [...prev, data]);
    };

    const handleError = (data: { message: string }) => {
      console.error('❌ WebSocket error:', data.message);
      setError(data.message);
    };

    const handleShotFired = (data: {
      player: string;
      x: number;
      y: number;
      hit: boolean;
      shot: any;
    }) => {
      console.log('💥 Shot fired:', data);
    };

    const handleTurnChanged = (data: {
      currentTurn: string;
      previousTurn: string;
    }) => {
      console.log('🔄 Turn changed:', data);
    };

    const handleShipsPlaced = (data: { player: string; ships: any[] }) => {
      console.log('🚢 Ships placed:', data);
    };

    const handleGameFinished = (data: { winner: string; game: any }) => {
      console.log('🏆 Game finished:', data);
      setGameState(data.game);
    };

    const handleJoinedGame = (data: { gameId: number; username: string }) => {
      console.log('🎮 Joined game:', data);
    };

    // Register event handlers
    gameWebSocketService.on('game-state-update', handleGameStateUpdate);
    gameWebSocketService.on('player-connected', handlePlayerConnected);
    gameWebSocketService.on('player-disconnected', handlePlayerDisconnected);
    gameWebSocketService.on('message-received', handleMessageReceived);
    gameWebSocketService.on('error', handleError);
    gameWebSocketService.on('shot-fired', handleShotFired);
    gameWebSocketService.on('turn-changed', handleTurnChanged);
    gameWebSocketService.on('ships-placed', handleShipsPlaced);
    gameWebSocketService.on('game-finished', handleGameFinished);
    gameWebSocketService.on('joined-game', handleJoinedGame);

    // Update connection status based on service state
    const checkConnection = () => {
      setIsConnected(gameWebSocketService.isConnected);
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check

    return () => {
      // Cleanup event handlers
      gameWebSocketService.off('game-state-update', handleGameStateUpdate);
      gameWebSocketService.off('player-connected', handlePlayerConnected);
      gameWebSocketService.off('player-disconnected', handlePlayerDisconnected);
      gameWebSocketService.off('message-received', handleMessageReceived);
      gameWebSocketService.off('error', handleError);
      gameWebSocketService.off('shot-fired', handleShotFired);
      gameWebSocketService.off('turn-changed', handleTurnChanged);
      gameWebSocketService.off('ships-placed', handleShipsPlaced);
      gameWebSocketService.off('game-finished', handleGameFinished);
      gameWebSocketService.off('joined-game', handleJoinedGame);

      clearInterval(interval);
    };
  }, []);

  // Auto-connect if specified
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, isConnected, isConnecting, connect]);

  // Auto-join game if gameId and username are provided
  useEffect(() => {
    const attemptJoin = async () => {
      // Prevent duplicate joins
      if (
        isConnected &&
        gameId &&
        username &&
        gameWebSocketService.currentGameId !== gameId &&
        !hasJoinedRef.current
      ) {
        hasJoinedRef.current = true;
        try {
          console.log(`🎮 Auto-joining game ${gameId} as ${username}`);
          await joinGame(gameId, username);
        } catch (error) {
          console.error('Failed to auto-join game:', error);
          hasJoinedRef.current = false;
        }
      }
    };

    attemptJoin();
  }, [isConnected, gameId, username, joinGame]);

  return {
    isConnected,
    isConnecting,
    error,
    gameState,
    messages,
    connect,
    disconnect,
    joinGame,
    postFleet,
    makeShot,
    leaveGame,
    requestGameState,
    sendMessage,
    on,
    off,
  };
};

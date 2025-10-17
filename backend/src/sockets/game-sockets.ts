import { Server, Socket } from 'socket.io';
import {
  getGameService,
  postFleetService,
  postShotService,
} from '../services/games-service';
import { generateUniqueId } from '../utils';
import { ShipCreationDTO } from '../entities/Ship';
import { Shot } from '../entities/Shot';

interface GameConnection {
  gameId: number;
  username: string;
  socketId: string;
}

const gameConnections = new Map<string, GameConnection>();
const gameRooms = new Map<number, Set<string>>(); // gameId -> Set of socketIds

export const setupGameSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      'join-game',
      async (data: { gameId: number; username: string }) => {
        try {
          const { gameId, username } = data;

          const game = await getGameService(gameId);
          if (!game) {
            socket.emit('error', { message: 'Game not found' });
            return;
          }
          if (game.player1 !== username && game.player2 !== username) {
            socket.emit('error', {
              message: 'You cannot join this game, the room is full',
            });
            return;
          }

          const connection: GameConnection = {
            gameId,
            username,
            socketId: socket.id,
          };
          gameConnections.set(socket.id, connection);
          if (!gameRooms.has(gameId)) {
            gameRooms.set(gameId, new Set());
          }
          gameRooms.get(gameId)!.add(socket.id);

          const roomName = `game-${gameId}`;
          socket.join(roomName);
          console.log(
            `Player ${username} joined game ${gameId} (socket: ${socket.id})`
          );
          socket.emit('joined-game', { gameId, username });

          socket.to(roomName).emit('player-connected', { username });

          socket.emit('game-state-update', game);
        } catch (error: any) {
          console.error('Error joining game:', error);
          socket.emit('error', {
            message: error.message || 'Failed to join game',
          });
        }
      }
    );

    socket.on('leave-game', () => {
      handleDisconnection(socket);
    });

    socket.on(
      'request-game-state',
      async (data: { gameId: number; username: string }) => {
        try {
          if (!isValidRoomConnection(socket.id, data.gameId)) {
            socket.emit('error', {
              message: 'You are not connected to this game',
            });
            return;
          }
          const game = await getGameService(data.gameId);
          const filteredShips = game.ships.filter(
            (ship) => ship.player === data.username
          );
          game.ships = filteredShips;
          socket.emit('game-state-update', game);
        } catch (error: any) {
          socket.emit('error', {
            message: error.message || 'Failed to get game state',
          });
        }
      }
    );

    socket.on(
      'post-fleet',
      async (data: {
        gameId: number;
        username: string;
        ships: ShipCreationDTO[];
      }) => {
        if (!isValidRoomConnection(socket.id, data.gameId)) {
          socket.emit('error', {
            message: 'You are not connected to this game',
          });
          return;
        }
        try {
          await postFleetService(data.gameId, data.username, data.ships);
          console.log(data.username + ' placed its ships');
        } catch (err: any) {
          socket.emit('error', {
            message: "Coudln't place ships: " + err.message,
          });
        }
      }
    );

    socket.on(
      'make-shot',
      async (data: {
        gameId: number;
        username: string;
        x: number;
        y: number;
      }) => {
        if (!isValidRoomConnection(socket.id, data.gameId)) {
          socket.emit('error', {
            message: 'You are not connected to this game',
          });
          return;
        }
        try {
          await postShotService(data.gameId, data.username, data.x, data.y);
        } catch (err: any) {
          socket.emit('error', {
            message: "Coudln't make shot: " + err.message,
          });
        }
      }
    );

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      handleDisconnection(socket);
    });

    socket.on('send-message', (data: { message: string }) => {
      const connection = gameConnections.get(socket.id);
      if (connection) {
        const roomName = `game-${connection.gameId}`;
        socket.to(roomName).emit('message-received', {
          id: generateUniqueId(),
          sender: connection.username,
          content: data.message,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });
};

const handleDisconnection = (socket: Socket) => {
  const connection = gameConnections.get(socket.id);
  if (!connection) {
    return;
  }

  const { gameId, username } = connection;
  const roomName = `game-${gameId}`;

  if (gameRooms.has(gameId)) {
    gameRooms.get(gameId)!.delete(socket.id);
    if (gameRooms.get(gameId)!.size === 0) {
      gameRooms.delete(gameId);
    }
  }
  gameConnections.delete(socket.id);

  socket.leave(roomName);
  socket.to(roomName).emit('player-disconnected', { username });

  console.log(`Player ${username} left game ${gameId} (socket: ${socket.id})`);
};

function isValidRoomConnection(socketId: string, gameId: number): boolean {
  const connection = gameConnections.get(socketId);
  if (!connection || connection.gameId !== gameId) {
    return false;
  }
  return true;
}

// Helper function to emit to all players in a game
export const emitToGameRoom = (
  io: Server,
  gameId: number,
  event: string,
  data: any
) => {
  const roomName = `game-${gameId}`;
  io.to(roomName).emit(event, data);
};

// Helper function to emit to a specific player in a game
export const emitToPlayer = (
  io: Server,
  gameId: number,
  username: string,
  event: string,
  data: any
) => {
  const roomName = `game-${gameId}`;
  const gameRoom = gameRooms.get(gameId);

  if (gameRoom) {
    for (const socketId of gameRoom) {
      const connection = gameConnections.get(socketId);
      if (connection && connection.username === username) {
        io.to(socketId).emit(event, data);
        break;
      }
    }
  }
};

// Helper function to get connected players for a game
export const getConnectedPlayersInGame = (gameId: number): string[] => {
  const gameRoom = gameRooms.get(gameId);
  const players: string[] = [];

  if (gameRoom) {
    for (const socketId of gameRoom) {
      const connection = gameConnections.get(socketId);
      if (connection) {
        players.push(connection.username);
      }
    }
  }

  return players;
};

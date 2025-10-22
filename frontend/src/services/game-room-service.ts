import type { GameRoom } from '@/types';
import { API_URL, handleResponse } from './api-utils';

export const gamesEndpointPrefix = 'games';

export const GameRoomService = {
  createGameRoom: async (
    gameRoomName: string,
    username: string
  ): Promise<GameRoom | null> => {
    try {
      const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameRoomName, username }),
      });
      return handleResponse<GameRoom>(res);
    } catch (err) {
      console.error('Error creating game room: ', err);
      return null;
    }
  },

  getGameRooms: async (): Promise<GameRoom[]> => {
    const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`);
    const response = await handleResponse<{ games: GameRoom[] }>(res);
    return response.games;
  },

  joinGameRoom: async (
    gameRoomId: number,
    username: string
  ): Promise<GameRoom> => {
    const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, gameId: gameRoomId }),
    });
    return handleResponse<GameRoom>(res);
  },

  getGameRoom: async (id: string): Promise<GameRoom> => {
    const res = await fetch(`${API_URL}/${gamesEndpointPrefix}/${id}`);
    return handleResponse<GameRoom>(res);
  },

  getReplay: async (gameRoomId: number): Promise<string> => {
    const res = await fetch(
      `${API_URL}/${gamesEndpointPrefix}/${gameRoomId}/replay`
    );
    return handleResponse<string>(res);
  },
};

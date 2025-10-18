import type { GameRoom } from '@/types';
import { API_URL, handleResponse } from './api-utils';

export const gamesEndpointPrefix = 'games';

export const GameRoomService = {
  createGameRoom: async (
    gameRoomName: string,
    username: string
  ): Promise<GameRoom> => {
    const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameRoomName, username }),
    });
    return handleResponse<GameRoom>(res);
  },

  getGameRooms: async (): Promise<GameRoom[]> => {
    const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`);
    return handleResponse<GameRoom[]>(res);
  },

  joinGameRoom: async (
    gameRoomId: number,
    username: string
  ): Promise<GameRoom> => {
    const res = await fetch(`${API_URL}/${gamesEndpointPrefix}/${gameRoomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
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

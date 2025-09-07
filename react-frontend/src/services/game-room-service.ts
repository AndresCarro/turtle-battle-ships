import type { Game } from "@/models/models";
import { API_URL, handleResponse } from "./api-utils";

export const gamesEndpointPrefix = "games";

export const GameRoomService = {
    createGameRoom: async (gameRoomName: string, username: string): Promise<Game> => {
        const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameRoomName, username }),
            });
        return handleResponse<Game>(res);
    },

    getGameRooms: async (): Promise<Game[]> => {
        const res = await fetch(`${API_URL}/${gamesEndpointPrefix}`);
        return handleResponse<Game[]>(res);
    },

    joinGameRoom: async (gameRoomId: number, username: string): Promise<Game> => {
        const res = await fetch(`${API_URL}/${gamesEndpointPrefix}/${gameRoomId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        return handleResponse<Game>(res);
    },

    getGameRoom: async (id: string): Promise<Game> => {
        const res = await fetch(`${API_URL}/${gamesEndpointPrefix}/${id}`);
        return handleResponse<Game>(res);
  },
}
import type { Ship, ShipInput, Shot } from "@/models/models";
import { API_URL, handleResponse } from "./api-utils";

export const gamesApi = {
  postFleet: async (
    id: number,
    player: string,
    ships: ShipInput[]
  ): Promise<Ship[]> => {
    const res = await fetch(`${API_URL}/${id}/fleet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, ships }),
    });
    return handleResponse<Ship[]>(res);
  },

  getFleets: async (id: number, player?: string): Promise<Ship[]> => {
    const query = player ? `?player=${player}` : "";
    const res = await fetch(`${API_URL}/${id}/fleet${query}`);
    return handleResponse<Ship[]>(res);
  },

  postShot: async (
    id: number,
    username: string,
    x: number,
    y: number
  ): Promise<Shot> => {
    const res = await fetch(`${API_URL}/${id}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, x, y }),
    });
    return handleResponse<Shot>(res);
  },

  getShots: async (id: number): Promise<Shot[]> => {
    const res = await fetch(`${API_URL}/${id}/shots`);
    return handleResponse<Shot[]>(res);
  },
};

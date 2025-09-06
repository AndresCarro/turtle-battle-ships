// frontend/src/services/gamesApi.ts
export type Game = {
  id: number;
  player1: string;
  player2?: string;
  status: string;
};

export type ShipType = "CARRIER" | "BATTLESHIP" | "SUBMARINE" | "DESTROYER";
export type Orientation = "HORIZONTAL" | "VERTICAL";

export type ShipInput = {
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
};

export type Ship = ShipInput & {
  id: number;
  player: string;
  length: number;
};

export type Shot = {
  id: number;
  player: string;
  x: number;
  y: number;
  hit: boolean;
};

const API_URL = "http://localhost:3000/games";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "API Error");
  }
  return res.json();
}

export const gamesApi = {
  createGame: async (username: string): Promise<Game> => {
    const res = await fetch(`${API_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return handleResponse<Game>(res);
  },

  joinGame: async (id: number, username: string): Promise<Game> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return handleResponse<Game>(res);
  },

  listGames: async (): Promise<Game[]> => {
    const res = await fetch(`${API_URL}/`);
    return handleResponse<Game[]>(res);
  },

  getGame: async (id: number): Promise<Game> => {
    const res = await fetch(`${API_URL}/${id}`);
    return handleResponse<Game>(res);
  },

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

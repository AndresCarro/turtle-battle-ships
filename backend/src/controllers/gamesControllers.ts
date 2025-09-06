import { Request, Response } from "express";
import {
  createGameService,
  getFleetsService,
  getGameService,
  getShotsService,
  joinGameService,
  listGamesService,
  postFleetService,
  postShotService,
} from "../services/gamesService";

export const createGame = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username)
      return res.status(400).json({ error: "username is required" });
    const game = await createGameService(username);
    res.json(game);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const joinGame = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    const game = await joinGameService(Number(id), username);
    res.json(game);
  } catch (err: any) {
    if (err.message === "Game not found")
      return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const listGames = async (_req: Request, res: Response) => {
  try {
    const games = await listGamesService();
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await getGameService(Number(id));
    res.json(game);
  } catch (err: any) {
    if (err.message === "Game not found")
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const postFleet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, ships } = req.body;
    if (!username || !ships)
      return res.status(400).json({ error: "username and ships are required" });
    const fleet = await postFleetService(Number(id), username, ships);
    res.json(fleet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFleets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fleets = await getFleetsService(Number(id));
    res.json(fleets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const postShot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, x, y } = req.body;
    if (username === undefined || x === undefined || y === undefined)
      return res.status(400).json({ error: "username, x and y are required" });
    const shot = await postShotService(Number(id), username, x, y);
    res.json(shot);
  } catch (err: any) {
    if (err.message === "Game not found")
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const getShots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shots = await getShotsService(Number(id));
    res.json(shots);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

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
} from "../services/games-service";

export const createGame = async (req: Request, res: Response) => {
  try {
    const { gameRoomName, username } = req.body;
    if (!gameRoomName)
      return res.status(400).json({ error: "gameRoomName is required" });
    if (!username)
      return res.status(400).json({ error: "username is required" });
    const game = await createGameService(username, gameRoomName);
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
    res.status(200).json(game);
  } catch (err: any) {
    if (err.message === "Game not found") {
      return res.status(404).json({ error: err.message });
    }
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
    res.status(200).json(game);
  } catch (err: any) {
    if (err.message === "Game not found")
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const postFleet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { player, ships } = req.body;

    if (!player || !ships)
      return res.status(400).json({ error: "player and ships are required" });

    const savedShips = await postFleetService(Number(id), player, ships);
    res.status(201).json(savedShips);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getFleets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { player } = req.query;
    const ships = await getFleetsService(
      Number(id),
      player as string | undefined
    );
    res.json(ships);
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
    res.status(200).json(shot);
  } catch (err: any) {
    if (err.message === "Game not found")
      return res.status(404).json({ error: err.message });
    res.status(409).json({ error: err.message });
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

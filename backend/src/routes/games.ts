import { Router } from "express";
import {
  createGame,
  getFleets,
  getGame,
  getShots,
  joinGame,
  listGames,
  postFleet,
  postShot,
} from "../controllers/gamesControllers";

const gamesRouter = Router();

gamesRouter.post("/", createGame);
gamesRouter.put("/:id", joinGame);
gamesRouter.get("/", listGames);
gamesRouter.get("/:id", getGame);
gamesRouter.post("/:id/fleet", postFleet);
gamesRouter.get("/:id/fleet", getFleets);
gamesRouter.post("/:id/shots", postShot);
gamesRouter.get("/:id/shots", getShots);

export default gamesRouter;

import { Router } from "express";
import {
  createGame,
  getFleets,
  getGame,
  getShots,
  index,
  joinGame,
  listGames,
  postFleet,
  postShot,
} from "../controllers/games-controllers";
import { createUser } from "../controllers/user-controller";

const router = Router();

router.get("/", index);
router.post("/games/", createGame);
router.put("/games/:id", joinGame);
router.get("/games/", listGames);
router.get("/games/:id", getGame);
router.post("/games/:id/fleet", postFleet);
router.get("/games/:id/fleet", getFleets);
router.post("/games/:id/shots", postShot);
router.get("/games/:id/shots", getShots);

router.post("/users", createUser);
router.get("/users", (req, res) => res.send("pong"));

export default router;

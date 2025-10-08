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

router.get("/games/:id/websocket-info", (req, res) => {
  const { id } = req.params;
  res.json({
    gameId: parseInt(id),
    websocketEndpoint: "/",
    events: {
      client_to_server: [
        "join-game",
        "leave-game", 
        "request-game-state",
        "send-message"
      ],
      server_to_client: [
        "joined-game",
        "game-state-update",
        "player-connected",
        "player-disconnected",
        "shot-fired",
        "turn-changed",
        "ships-placed",
        "game-finished",
        "error"
      ]
    },
    instructions: {
      connect: "Connect to the WebSocket endpoint and emit 'join-game' with gameId and username",
      example: {
        join: { gameId: parseInt(id), username: "player1" }
      }
    }
  });
});

router.post("/users", createUser);
router.get("/users", (req, res) => res.send("pong"));

export default router;

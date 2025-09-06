import { AppDataSource } from "../dataSource";
import { Fleet } from "../entities/Fleet";
import { Game } from "../entities/Game";
import { Shot } from "../entities/Shot";

const gameRepository = AppDataSource.getRepository(Game);
const fleetRepository = AppDataSource.getRepository(Fleet);
const shotRepository = AppDataSource.getRepository(Shot);

export const createGameService = async (username: string) => {
  const game = gameRepository.create({ player1: username });
  return gameRepository.save(game);
};

export const joinGameService = async (id: number, username: string) => {
  const game = await gameRepository.findOne({ where: { id } });
  if (!game) throw new Error("Game not found");
  if (game.player2) throw new Error("Game already has two players");

  game.player2 = username;
  game.status = "IN_PROGRESS";
  return gameRepository.save(game);
};

export const listGamesService = async () => {
  return gameRepository.find({ where: { status: "IN_PROGRESS" } });
};

export const getGameService = async (id: number) => {
  const game = await gameRepository.findOne({
    where: { id },
    relations: ["fleets", "shots"],
  });
  if (!game) throw new Error("Game not found");
  return game;
};

export const postFleetService = async (
  id: number,
  username: string,
  ships: any[]
) => {
  const fleet = fleetRepository.create({
    player: username,
    ships,
    game: { id } as Game,
  });
  return fleetRepository.save(fleet);
};

export const getFleetsService = async (id: number) => {
  return fleetRepository.find({ where: { game: { id } } });
};

export const postShotService = async (
  id: number,
  username: string,
  x: number,
  y: number
) => {
  const game = await gameRepository.findOne({
    where: { id },
    relations: ["fleets"],
  });
  if (!game) throw new Error("Game not found");

  const opponentFleet = game.fleets.find((f) => f.player !== username);
  let hit = false;

  if (opponentFleet) {
    for (const ship of opponentFleet.ships) {
      if (ship.positions.some((pos: any) => pos.x === x && pos.y === y)) {
        hit = true;
        break;
      }
    }
  }

  const shot = shotRepository.create({ player: username, x, y, hit, game });
  return shotRepository.save(shot);
};

export const getShotsService = async (id: number) => {
  return shotRepository.find({ where: { game: { id } } });
};

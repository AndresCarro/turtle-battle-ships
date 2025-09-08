import { AppDataSource } from "../data-source";
import { Game, GameStatus } from "../entities/Game";
import { getShipTypeSize, Orientation, Ship, ShipType } from "../entities/Ship";
import { Shot } from "../entities/Shot";
import { saveGameReplay } from "./game-replay-services";

const gameRepository = AppDataSource.getRepository(Game);
const shipRepository = AppDataSource.getRepository(Ship);
const shotRepository = AppDataSource.getRepository(Shot);

export const createGameService = async (
  username: string,
  gameRoomName: string
) => {
  const game = gameRepository.create({ player1: username, name: gameRoomName });
  return gameRepository.save(game);
};

export const joinGameService = async (id: number, username: string) => {
  const game = await gameRepository.findOne({ where: { id } });
  if (!game) throw new Error("Game not found");
  if (game.player2) throw new Error("Game already has two players");

  game.player2 = username;
  game.status = GameStatus.SHIPS_SETUP;
  game.currentTurn = game.player1;
  return gameRepository.save(game);
};

export const listGamesService = async () => {
  return gameRepository.find();
};

export const getGameService = async (id: number) => {
  const game = await gameRepository.findOne({
    where: { id },
    relations: ["ships", "shots"],
  });
  if (!game) throw new Error("Game not found");
  return game;
};

export const postFleetService = async (
  id: number,
  player: string,
  shipsInput: {
    type: ShipType;
    x: number;
    y: number;
    orientation: Orientation;
  }[]
): Promise<Ship[]> => {
  const game = await gameRepository.findOne({
    where: { id },
    relations: ["ships"],
  });
  if (!game) throw new Error("Game not found");

  const existingShips = game.ships.filter((s) => s.player === player);
  if (existingShips.length > 0) throw new Error("Player already placed ships");

  const typeCount: Record<ShipType, number> = {
    [ShipType.CARRIER]: 0,
    [ShipType.BATTLESHIP]: 0,
    [ShipType.SUBMARINE]: 0,
    [ShipType.DESTROYER]: 0,
  };

  for (const s of shipsInput) typeCount[s.type]++;
  for (const type of Object.keys(typeCount) as ShipType[]) {
    switch (type) {
      case ShipType.CARRIER:
        if (typeCount[type] !== 1) {
          throw new Error(`Player must place exactly 1 ships of type ${type}`);
        }
        break;
      case ShipType.BATTLESHIP:
        if (typeCount[type] !== 1) {
          throw new Error(`Player must place exactly 1 ships of type ${type}`);
        }
        break;
      case ShipType.SUBMARINE:
        if (typeCount[type] !== 2) {
          throw new Error(`Player must place exactly 2 ships of type ${type}`);
        }
        break;
      case ShipType.DESTROYER:
        if (typeCount[type] !== 1) {
          throw new Error(`Player must place exactly 1 ships of type ${type}`);
        }
        break;
      default:
        throw new Error(`Incorrect ship type ${type}`);
    }
  }

  console.log(game);
  // Crear instancias de Ship correctamente tipadas
  const ships = shipsInput.map((s) =>
    shipRepository.create({
      player,
      type: s.type,
      x: s.x,
      y: s.y,
      orientation: s.orientation,
      length: getShipTypeSize(s.type),
      game: game,
      gameId: id,
    })
  );

  // Guardarlas en la base de datos, TypeORM devuelve Ship[]
  const savedShips = await shipRepository.save(ships);

  // Chequeamos si terminaron de setupear las ships
  const allShips = await shipRepository.find({ where: { game: { id } } });
  const players = Array.from(new Set(allShips.map((s) => s.player)));
  if (players.length === 2) {
    game.status = GameStatus.IN_PROGRESS;
    await gameRepository.update(id, { status: GameStatus.IN_PROGRESS });
  }

  return savedShips;
};

export const getFleetsService = async (id: number, player?: string) => {
  const whereClause: any = { game: { id } };
  if (player) whereClause.player = player;
  return shipRepository.find({ where: whereClause });
};

export const postShotService = async (
  id: number,
  username: string,
  x: number,
  y: number
) => {
  const game = await gameRepository.findOne({
    where: { id },
    relations: ["ships", "shots"],
  });
  if (!game) throw new Error("Game not found");
  if (game.status != GameStatus.IN_PROGRESS)
    throw Error("Game is not in a valid state, it should be in progress.");
  if (game.currentTurn !== username) {
    throw Error(`User ${username} cannot make a shot. It is not his turn`);
  }

  const opponentUsername =
    game.player1 === username ? game.player2 : game.player1;

  const opponentShips = await getFleetsService(game.id, opponentUsername);
  console.log("OPPONENTS SHIP ", opponentShips);

  let hit = false;

  for (const ship of opponentShips) {
    const shipPositions = [];

    for (let i = 0; i < ship.length; i++) {
      if (ship.orientation === Orientation.HORIZONTAL) {
        shipPositions.push({ x: ship.x + i, y: ship.y });
      } else {
        shipPositions.push({ x: ship.x, y: ship.y + i });
      }
    }

    if (shipPositions.some((pos) => pos.x === x && pos.y === y)) {
      hit = true;
      break;
    }
  }

  const shot = await shotRepository.save(
    shotRepository.create({ player: username, x, y, hit, game })
  );

  if (checkIfGameFinished(game, username)) {
    game.status = GameStatus.FINISHED;
    game.winner = username;
    await gameRepository.save(game);
    saveGameReplay(game.id);
    return;
  }

  game.currentTurn = game.player1 === username ? game.player2 : game.player1;
  await gameRepository.save(game);

  return shot;
};

function checkIfGameFinished(game: Game, lastShooter: string): boolean {
  const opponentShips = game.ships.filter((s) => s.player !== lastShooter);

  const hits = game.shots.filter((s) => s.player === lastShooter && s.hit);

  const allPositions = opponentShips.flatMap((ship) => {
    const positions = [];
    for (let i = 0; i < ship.length; i++) {
      if (ship.orientation === Orientation.HORIZONTAL) {
        positions.push({ x: ship.x + i, y: ship.y });
      } else {
        positions.push({ x: ship.x, y: ship.y + i });
      }
    }
    return positions;
  });

  const allSunk = allPositions.every((pos) =>
    hits.some((s) => s.x === pos.x && s.y === pos.y)
  );

  if (allSunk) {
    return true;
  }

  return false;
}

export const getShotsService = async (id: number) => {
  return shotRepository.find({ where: { game: { id } } });
};

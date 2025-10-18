import { Server } from 'socket.io';
import { AppDataSource } from '../data-source';
import { Game, GameStatus } from '../entities/Game';
import {
  AMOUNT_SHOTS_REQUIERED_TO_WIN,
  getShipTypeSize,
  Orientation,
  Ship,
  ShipType,
} from '../entities/Ship';
import { Shot, ShotSuccess } from '../entities/Shot';
import { saveGameReplay } from './game-replay-services';
import { emitToPlayer } from '../sockets/game-sockets';
import { GameRepository } from '../repositories/game-repository';
import { ShipRepository } from '../repositories/ship-repository';
import { ShotRepository } from '../repositories/shot-repository';

let socketIOInstance: Server | null = null;
const gameRepo = new GameRepository();
const shipRepo = new ShipRepository();
const shotRepo = new ShotRepository();

export const setSocketIOInstance = (io: Server) => {
  socketIOInstance = io;
};

const emitToGameRoom = (gameId: number, event: string, data: any) => {
  if (socketIOInstance) {
    socketIOInstance.to(`game-${gameId}`).emit(event, data);
  }
};

export const createGameService = async (
  username: string,
  gameRoomName: string
) => {
  return gameRepo.createGame(username, gameRoomName);
};

export const joinGameService = async (gameId: number, username: string) => {
  const game = await gameRepo.joinGame(gameId, username);
  emitToGameRoom(gameId, 'game-state-update', game);
  return game;
};

export const listGamesService = async () => gameRepo.listGames();

export const getGameService = async (gameId: number): Promise<Game> => {
  const game = await gameRepo.getGame(gameId);
  if (!game) throw new Error('Game not found');

  const player1Fleet = await shipRepo.getByGameAndPlayer(gameId, game.player1);
  const player2Fleet = await shipRepo.getByGameAndPlayer(
    gameId,
    game.player2 ?? '-'
  );
  const shots = await shotRepo.getByGameId(gameId);

  game.shots = shots;
  game.ships = [...(player1Fleet ?? []), ...(player2Fleet ?? [])];

  return game;
};

export const getFleetsService = async (
  gameId: number,
  player?: string
): Promise<Ship[]> => {
  if (!player) {
    return [];
  }
  const ships = await shipRepo.getByGameAndPlayer(gameId, player);
  return ships ?? [];
};

export const getShotsService = async (gameId: number) => {
  return shotRepo.getByGameId(gameId);
};

export const postFleetService = async (
  gameId: number,
  player: string,
  ships: Ship[]
): Promise<Ship[]> => {
  const game = await gameRepo.getGame(gameId);
  const existingFleet = await shipRepo.getByGameAndPlayer(gameId, player);
  if (existingFleet) throw new Error('Player already placed ships');

  // Validación de cantidades por tipo
  const typeCount: Record<ShipType, number> = {
    [ShipType.CARRIER]: 0,
    [ShipType.BATTLESHIP]: 0,
    [ShipType.SUBMARINE]: 0,
    [ShipType.DESTROYER]: 0,
  };

  for (const s of shipsInput) typeCount[s.type]++;
  for (const type of Object.keys(typeCount) as ShipType[]) {
    const required = type === ShipType.SUBMARINE ? 2 : 1;
    if (typeCount[type] !== required)
      throw new Error(
        `Player must place exactly ${required} ship(s) of type ${type}`
      );
  }

  await shipRepo.saveAll(gameId, player, ships);

  const allShipsP1 = await shipRepo.getByGameAndPlayer(gameId, game.player1);
  const allShipsP2 = await shipRepo.getByGameAndPlayer(
    gameId,
    game.player2 ?? '-'
  );
  if (allShipsP1 && allShipsP2)
    await gameRepo.updateStatus(gameId, GameStatus.IN_PROGRESS);

  const updatedGame = await gameRepo.getGame(gameId);
  emitToPlayer(
    socketIOInstance!,
    gameId,
    player,
    'game-state-update',
    updatedGame
  );

  const savedShips = await shipRepository.save(ships);

  for (const ship of shipsInput) {
    console.log(
      'SHIPS SUBMITTED x: ' +
        ship.x +
        ' y: ' +
        ship.y +
        ' type: ' +
        ship.type +
        ' orientation: ' +
        ship.orientation
    );
  }

  const allShips = await shipRepository.find({
    where: { game: { id: gameId } },
  });
  const players = Array.from(new Set(allShips.map((s) => s.player)));

  if (players.length === 2) {
    game.status = GameStatus.IN_PROGRESS;
    await gameRepository.update(gameId, { status: GameStatus.IN_PROGRESS });
    const updatedGame = await getGameService(gameId);
    updatedGame.ships = ships.filter((ship) => ship.player === player);
    emitToGameRoom(gameId, 'game-state-update', updatedGame);
  } else {
    const updatedGame = await getGameService(gameId);
    updatedGame.ships = ships.filter((ship) => ship.player === player);
    emitToPlayer(
      socketIOInstance,
      gameId,
      player,
      'game-state-update',
      updatedGame
    );
  }

  return savedShips;
};

export const getFleetsService = async (id: number, player?: string) => {
  const whereClause: any = { game: { id } };
  if (player) whereClause.player = player;
  return shipRepository.find({ where: whereClause });
};

export const postShotService = async (
  gameId: number,
  username: string,
  x: number,
  y: number
) => {
  const game = await getGameService(gameId);
  if (!game) throw new Error('Game not found');
  if (game.status != GameStatus.IN_PROGRESS)
    throw Error('Game is not in a valid state, it should be in progress.');
  if (game.currentTurn !== username) {
    throw Error(`User ${username} cannot make a shot. It is not his turn`);
  }
  if (!socketIOInstance) throw new Error('No socket service available');

  const previousShots = (await shotRepo.getByGameId(gameId)).filter(
    (shot) => shot.player === username
  );
  const opponentUsername =
    game.player1 === username ? game.player2! : game.player1;
  const opponentFleet = await shipRepo.getByGameAndPlayer(
    gameId,
    opponentUsername
  );
  if (!opponentFleet) throw new Error('Opponent has not placed ships yet');

  let shotSuccess = ShotSuccess.miss;

  for (const ship of opponentShips) {
    const shipPositions = getShipPositions(ship);
    if (shipPositions.some((pos) => pos.x === x && pos.y === y)) {
      shotSuccess = hasSunkShip(
        [...getShotPositions(previousShots), { x, y }],
        positions
      )
        ? ShotSuccess.sunk
        : ShotSuccess.hit;

      if (shotSuccess === ShotSuccess.sunk) {
        // If the new shot sunk the ship,
        // we have to change all the shot's Successes related to that sunken ship
        const sinkingShotsForShip = previousShots.filter((shot) =>
          shotHasSunkShip(shot, shipPositions)
        );
        for (const shot of sinkingShotsForShip) {
          await shotRepository.update(shot.id, {
            shotSuccess: ShotSuccess.sunk,
          });
        }
      }
    }
  }

  const shot = new Shot(
    previousShots.length + 1,
    gameId,
    username,
    x,
    y,
    shotSuccess
  );
  await shotRepo.create(shot);

  console.log(
    'Player ' +
      username +
      ' shot x:' +
      x +
      ' y: ' +
      y +
      ' shotSuccess: ' +
      shotSuccess
  );

  const newCurrentTurn =
    game.player1 === username ? game.player2 : game.player1;
  await gameRepository.update(game.id, { currentTurn: newCurrentTurn });
  const updatedGame = await getGameService(id);
  emitGameStateUpdate(id, updatedGame, socketIOInstance);

  if (await checkIfGameFinished(updatedGame, username)) {
    await gameRepository.update(game.id, {
      status: GameStatus.FINISHED,
      winner: username,
    });
    const updatedGame = await getGameService(id);
    emitToGameRoom(id, 'game-finished', {
      winner: username,
      game: updatedGame,
    });
    saveGameReplay(gameId);
  } else {
    const nextTurn = game.player1 === username ? game.player2! : game.player1;
    await gameRepo.updateTurn(gameId, nextTurn);
    emitToGameRoom(gameId, 'turn-changed', {
      currentTurn: nextTurn,
      previousTurn: username,
    });
  }

  return shot;
};

function shotHasSunkShip(
  shot: Shot,
  shipPositions: { x: number; y: number }[]
): boolean {
  return shipPositions.some(
    (shipPosition) => shot.x === shipPosition.x && shot.y === shipPosition.y
  );
}

function emitGameStateUpdate(gameId: number, game: Game, io: Server) {
  const shipsForPlayerOne = game.ships.filter(
    (ship) => ship.player === game.player1
  );
  const shipsForPlayerTwo = game.ships.filter(
    (ship) => ship.player === game.player2
  );

  game.ships = shipsForPlayerOne;
  emitToPlayer(io, gameId, game.player1, 'game-state-update', game);

  game.ships = shipsForPlayerTwo;
  emitToPlayer(io, gameId, game.player2 ?? '-', 'game-state-update', game);
}

function getShipPositions(ship: Ship): { x: number; y: number }[] {
  const shipPositions = [];
  for (let i = 0; i < ship.length; i++) {
    shipPositions.push(
      ship.orientation === Orientation.HORIZONTAL
        ? { x: ship.x + i, y: ship.y }
        : { x: ship.x, y: ship.y + i }
    );
  }
  return shipPositions;
}

function hasSunkShip(
  shots: { x: number; y: number }[],
  shipPositions: { x: number; y: number }[]
) {
  return shipPositions.every((pos) =>
    shots.some((s) => s.x === pos.x && s.y === pos.y)
  );
}

function getShotPositions(shots: Shot[]) {
  return shots.map((s) => ({ x: s.x, y: s.y }));
}

async function checkIfGameFinished(
  game: Game,
  lastShooter: string
): Promise<boolean> {
  const opponentShips = game.ships.filter((s) => s.player !== lastShooter);

  const sinkingShots = game.shots.filter(
    (shot) =>
      shot.player === lastShooter && shot.shotSuccess === ShotSuccess.sunk
  );

  if (sinkingShots.length !== AMOUNT_SHOTS_REQUIERED_TO_WIN) {
    return false;
  }

  const allOpponentShipPositions = opponentShips.flatMap((ship) => {
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

  const allSunk = allOpponentShipPositions.every((pos) =>
    sinkingShots.some((s) => s.x === pos.x && s.y === pos.y)
  );

  if (!allSunk) {
    return false;
  }

  return true;
}

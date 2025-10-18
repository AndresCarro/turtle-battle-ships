export interface CreateGameRoomRequest {
  gameRoomName: string;
  username: string;
}

/**
 * Response payload after creating a user
 */
export interface GameRoomResponse {
  gameRoom: Game;
}

/**
 * Error response payload
 */
export interface ErrorResponse {
  error: string;
  message?: string;
}

export enum GameStatus {
  WAITING_FOR_PLAYER = "WAITING_FOR_PLAYER",
  SHIPS_SETUP = "SETTING_UP_SHIPS",
  IN_PROGRESS = "PLAYING",
  FINISHED = "FINISHED",
}

export enum ShipType {
  CARRIER = "CARRIER",
  DESTROYER = "DESTROYER",
  BATTLESHIP = "BATTLESHIP",
  SUBMARINE = "SUBMARINE",
}

export enum Orientation {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
}

export class Ship {
  constructor(
    public readonly gameId: number,
    public readonly player: string,
    public readonly type: ShipType,
    public readonly x: number,
    public readonly y: number,
    public readonly orientation: Orientation,
    public readonly length: number
  ) {}
}

export enum ShotSuccess {
  "miss",
  "hit",
  "sunk",
}

export class Shot {
  constructor(
    public readonly id: number,
    public readonly gameId: number,
    public readonly player: string,
    public readonly x: number,
    public readonly y: number,
    public readonly shotSuccess: ShotSuccess
  ) {}

  static create(props: {
    id?: number;
    gameId: number;
    player: string;
    x: number;
    y: number;
    shotSuccess: ShotSuccess;
  }): Shot {
    return new Shot(
      props.id ?? 0,
      props.gameId,
      props.player,
      props.x,
      props.y,
      props.shotSuccess
    );
  }
}

export class Game {
  constructor(
    public id: number,
    public player1: string,
    public player2?: string,
    public name?: string,
    public currentTurn?: string,
    public winner?: string,
    public creationTimestamp?: Date,
    public status: GameStatus = GameStatus.WAITING_FOR_PLAYER,
    public ships: Ship[] = [],
    public shots: Shot[] = []
  ) {}

  static create(props: { id?: number; player1: string; name: string }): Game {
    return new Game(props.id ?? 0, props.player1, undefined, props.name);
  }
}

export enum GameStatusPostgres {
  WAITING_FOR_PLAYER = "WAITING_FOR_PLAYER",
  SHIPS_SETUP = "SETTING_UP_SHIPS",
  IN_PROGRESS = "PLAYING",
  FINISHED = "FINISHED",
}

export class GamePostgres {
  id!: number;
  player1!: string;
  player2: string | null = null;
  name!: string;
  currentTurn: string | null = null;
  winner: string | null = null;
  creationTimestamp!: Date;
  status!: GameStatusPostgres;

  static toDomain(
    entity: GamePostgres,
    ships: any[] = [],
    shots: any[] = []
  ): Game {
    return new Game(
      entity.id,
      entity.player1,
      entity.player2 ?? undefined,
      entity.name,
      entity.currentTurn ?? undefined,
      entity.winner ?? undefined,
      entity.creationTimestamp,
      GamePostgres.mapStatusToDomain(entity.status),
      ships,
      shots
    );
  }

  static fromDomain(domain: Game): GamePostgres {
    const entity = new GamePostgres();
    entity.id = domain.id;
    entity.player1 = domain.player1;
    entity.player2 = domain.player2 ?? null;
    entity.name = domain.name ?? "";
    entity.currentTurn = domain.currentTurn ?? null;
    entity.winner = domain.winner ?? null;
    entity.creationTimestamp = domain.creationTimestamp ?? new Date();
    entity.status = GamePostgres.mapStatusToPostgres(domain.status);
    return entity;
  }

  public static mapStatusToDomain(status: GameStatusPostgres): GameStatus {
    switch (status) {
      case GameStatusPostgres.WAITING_FOR_PLAYER:
        return GameStatus.WAITING_FOR_PLAYER;
      case GameStatusPostgres.SHIPS_SETUP:
        return GameStatus.SHIPS_SETUP;
      case GameStatusPostgres.IN_PROGRESS:
        return GameStatus.IN_PROGRESS;
      case GameStatusPostgres.FINISHED:
        return GameStatus.FINISHED;
    }
  }

  public static mapStatusToPostgres(status: GameStatus): GameStatusPostgres {
    switch (status) {
      case GameStatus.WAITING_FOR_PLAYER:
        return GameStatusPostgres.WAITING_FOR_PLAYER;
      case GameStatus.SHIPS_SETUP:
        return GameStatusPostgres.SHIPS_SETUP;
      case GameStatus.IN_PROGRESS:
        return GameStatusPostgres.IN_PROGRESS;
      case GameStatus.FINISHED:
        return GameStatusPostgres.FINISHED;
    }
  }
}

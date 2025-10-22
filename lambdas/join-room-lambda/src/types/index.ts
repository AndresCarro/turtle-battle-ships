/**
 * Request payload for creating a user
 */
export interface JoinGameRequest {
  username: string;
  gameId: number;
}

/**
 * Response payload after creating a user
 */
export type JoinGameResponse = Game;

/**
 * Error response payload
 */
export interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * Game types
 */

export enum GameStatus {
  WAITING_FOR_PLAYER = "WAITING_FOR_PLAYER",
  SHIPS_SETUP = "SETTING_UP_SHIPS",
  IN_PROGRESS = "PLAYING",
  FINISHED = "FINISHED",
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
    public ships = [],
    public shots = []
  ) {}

  static create(props: { id?: number; player1: string; name: string }): Game {
    return new Game(props.id ?? 0, props.player1, undefined, props.name);
  }
}

export enum ShotSuccess {
  miss = 'miss',
  hit = 'hit',
  sunk = 'sunk',
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

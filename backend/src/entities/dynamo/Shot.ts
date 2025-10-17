import { Shot, ShotSuccess } from '../../models/Shot';

export interface ShotDynamo {
  PK: string;
  SK: string;
  player: string;
  x: number;
  y: number;
  shotSuccess: ShotSuccess;
}

export class ShotMapper {
  static toDynamo(shot: Shot): ShotDynamo {
    return {
      PK: `game:${shot.gameId}:shot`,
      SK: `${shot.id}`,
      player: shot.player,
      x: shot.x,
      y: shot.y,
      shotSuccess: shot.shotSuccess,
    };
  }

  static fromDynamo(item: ShotDynamo): Shot {
    const id = Number(item.SK);
    const gameId = Number(item.PK.split(':')[1]);
    return new Shot(id, gameId, item.player, item.x, item.y, item.shotSuccess);
  }
}

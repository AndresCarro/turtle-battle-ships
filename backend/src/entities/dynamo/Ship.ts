import { Ship } from '../../models/Ship';

export interface ShipsDynamo {
  PK: string;
  SK: string;
  player: string;
  gameId: number;
  ships: Ship[];
}

export class ShipsMapper {
  static toDynamo(gameId: number, player: string, ships: Ship[]) {
    return {
      PK: `game:${gameId}:ships:`,
      SK: `user:${player}`,
      gameId,
      player,
      ships: JSON.stringify(ships), // serializamos todo el array
    };
  }

  static fromDynamo(item: any): Ship[] {
    if (!item?.ships) return [];
    return JSON.parse(item.ships).map(
      (s: any) =>
        new Ship(s.gameId, s.player, s.type, s.x, s.y, s.orientation, s.length)
    );
  }
}

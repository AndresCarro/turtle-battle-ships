import { getShipTypeSize, Orientation, Ship, ShipType } from '../models/Ship';

export type ShipCreationDTO = {
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
};

export class ShipDTO {
  constructor(
    public readonly type: ShipType,
    public readonly x: number,
    public readonly y: number,
    public readonly orientation: Orientation
  ) {}

  static fromCreationDTO(dto: ShipCreationDTO): ShipDTO {
    return new ShipDTO(dto.type, dto.x, dto.y, dto.orientation);
  }

  toDomain(gameId: number, player: string): Ship {
    return new Ship(
      gameId,
      player,
      this.type,
      this.x,
      this.y,
      this.orientation,
      getShipTypeSize(this.type)
    );
  }
}

export const AMOUNT_SHOTS_REQUIERED_TO_WIN = 17;

export enum ShipType {
  CARRIER = 'CARRIER',
  DESTROYER = 'DESTROYER',
  BATTLESHIP = 'BATTLESHIP',
  SUBMARINE = 'SUBMARINE',
}

export enum Orientation {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
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

export function getShipTypeSize(shipType: ShipType): number {
  switch (shipType) {
    case ShipType.CARRIER:
      return 5;
    case ShipType.BATTLESHIP:
      return 4;
    case ShipType.SUBMARINE:
      return 3;
    case ShipType.DESTROYER:
      return 2;
    default:
      throw new Error(`Unknown ship type: ${shipType}`);
  }
}

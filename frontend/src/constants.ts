export const GRID_SIZE = 10;

export enum GameRoomStatuses {
  WAITING_FOR_PLAYER = 'WAITING_FOR_PLAYER',
  SHIPS_SETUP = 'SETTING_UP_SHIPS',
  IN_PROGRESS = 'PLAYING',
  FINISHED = 'FINISHED',
}

export const SHIPS = {
  carrier: { size: 5, count: 1, name: 'Carrier' },
  battleship: { size: 4, count: 1, name: 'Battleship' },
  submarine: { size: 3, count: 2, name: 'Submarine' },
  destroyer: { size: 2, count: 1, name: 'Destroyer' },
};

export const maxAmountOfShips = Object.values(SHIPS).reduce(
  (total, ship) => total + ship.count,
  0
);

export enum ShipType {
  CARRIER = 'Carrier',
  DESTROYER = 'Destroyer',
  BATTLESHIP = 'Battleship',
  SUBMARINE = 'Submarine',
}

export enum Orientation {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

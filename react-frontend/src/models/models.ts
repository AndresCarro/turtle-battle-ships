export type Game = {
  id: number;
  name: string;
  player1: string;
  player2?: string;
  status: string;
};

export type ShipType = "CARRIER" | "BATTLESHIP" | "SUBMARINE" | "DESTROYER";
export type Orientation = "HORIZONTAL" | "VERTICAL";

export type ShipInput = {
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
};

export type Ship = ShipInput & {
  id: number;
  player: string;
  length: number;
};

export type Shot = {
  id: number;
  player: string;
  x: number;
  y: number;
  hit: boolean;
};
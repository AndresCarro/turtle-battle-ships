import type { GameRoomStatuses } from './constants';

export type GameRoomStatus = `${GameRoomStatuses}`;

export type Ship = {
  id: number;
  player: string;
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
  length: number;
  gameId: number;
};

export type ShipForCreation = {
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
};

export type Shot = {
  id: number;
  player: string;
  x: number;
  y: number;
  shotSuccess: number;
  gameId: number;
};

export type Player = {
  id: string;
  name: string;
  totalGames: number;
  totalWins: number;
};

export type GameRoom = {
  id: number;
  name: string;
  status: GameRoomStatus;
  currentTurn: string;
  winner: string;
  creationTimestamp: Date; // ISO format
  player1: string | null;
  player2: string | null;
  ships?: Ship[];
  shots?: Shot[];
};

export type Message = {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
};

export type CellState = '' | 'miss' | 'hit' | 'ship' | 'sunk';
export type Board = CellState[][];

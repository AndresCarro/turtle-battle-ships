import type { GameRoomStatuses } from './constants';

export type GameRoomStatus = `${GameRoomStatuses}`;

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
  player1: Player | null;
  player2: Player | null;
};

export type Message = {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
};

export type CellState = '' | 'miss' | 'hit' | 'ship' | 'sunk';
export type Board = CellState[][];

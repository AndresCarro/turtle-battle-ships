import type { GameRoomStatuses } from "./constants";

export type GameRoomStatus = `${GameRoomStatuses}`

export type Player = {
    id: string;
    username: string;
    totalGames: number;
    wins: number;
}

export type GameRoom = {
    id: string;
    name: string;
    status: GameRoomStatus;
    createdAt: Date;
    players: Player[];
}

export type Message = {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
}

export type CellState = "" | "miss" | "hit" | "ship" | "sunk";
export type Board = CellState[][];
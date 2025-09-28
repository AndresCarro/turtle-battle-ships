import { GRID_SIZE, SHIPS } from "@/constants";
import type { Board } from "@/types";

export function placeShip(board: Board, ship: string, row: number, col: number, orientation: "horizontal" | "vertical"): Board | null {
    const newBoard = board.map(r => [...r]); // Deep copy
    const shipName = ship.split("-")[0] as keyof typeof SHIPS;
    const shipSize = SHIPS[shipName].size;
    if (orientation === "horizontal") {
        for (let i = 0; i < shipSize; i++) {
            const currentIndex = col + i;
            if (currentIndex >= GRID_SIZE || board[row][currentIndex] !== "") {
                return null; // Out of bounds or overlapping
            } else {
                newBoard[row][currentIndex] = "ship";
            }
        }
    } else {
        for (let i = 0; i < shipSize; i++) {
            const currentIndex = row + i;
            if (currentIndex >= GRID_SIZE || board[currentIndex][col] !== "") {
                return null; // Out of bounds or overlapping
            } else {
                newBoard[currentIndex][col] = "ship";
            }
        }
    }
    return newBoard;
}

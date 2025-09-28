import type { Board } from "@/types";

export function canMakeMove(board: Board, row: number, col: number): boolean {
    if (board[row][col] === "hit" || board[row][col] === "miss" || board[row][col] === "sunk") {
        return false;
    }
    return true;
}

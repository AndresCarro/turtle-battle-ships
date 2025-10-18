import type { Board, Shot } from '@/types';
import { shotSuccessMap } from '@/utils/shot-success-map';

export function canMakeMove(board: Board, row: number, col: number): boolean {
  if (
    board[row][col] === 'hit' ||
    board[row][col] === 'miss' ||
    board[row][col] === 'sunk'
  ) {
    return false;
  }
  return true;
}

/*
 * The shot that is being placed comes from the backend, meaning its already
 * a valid shot.
 */
function placeShot(
  board: Board,
  row: number,
  col: number,
  shotSuccess: number
): Board {
  const newBoard = board.map((r) => [...r]); // Deep copy
  newBoard[row][col] = shotSuccessMap.get(shotSuccess) ?? 'miss';
  return newBoard;
}

export function placeShotsOnBoard(board: Board, shots: Shot[]): Board {
  let newBoard = board;
  shots.forEach((shot) => {
    newBoard = placeShot(newBoard, shot.y, shot.x, shot.shotSuccess);
  });
  return newBoard;
}

export function boardsAreUpToDate(
  playerBoard: Board,
  opponentBoard: Board,
  playerShots: Shot[],
  opponentShots: Shot[]
): boolean {
  for (const playerShot of playerShots) {
    if (
      opponentBoard[playerShot.y][playerShot.x] !==
      shotSuccessMap.get(playerShot.shotSuccess)
    ) {
      return false;
    }
  }

  for (const opponentShot of opponentShots) {
    if (
      playerBoard[opponentShot.y][opponentShot.x] !==
      shotSuccessMap.get(opponentShot.shotSuccess)
    ) {
      return false;
    }
  }
  return true;
}

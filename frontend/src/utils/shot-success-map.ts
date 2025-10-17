import type { CellState } from '@/types';

export const shotSuccessMap: Map<number, CellState> = new Map([
  [0, 'miss'],
  [1, 'hit'],
  [2, 'sunk'],
]);

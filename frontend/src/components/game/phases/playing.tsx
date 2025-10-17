import { canMakeMove } from '@/domain/playing';
import { Board } from '../board';
import { BaseComponent } from './base';
import type { Board as BoardType, GameRoom } from '@/types';

type Props = {
  room: GameRoom;
  playerBoard: BoardType;
  username: string;
  opponentBoard: BoardType;
  submitMove: (gameId: number, username: string, i: number, j: number) => void;
  isPlayerTurn: boolean;
};

export function Playing({
  room,
  playerBoard,
  username,
  opponentBoard,
  submitMove,
  isPlayerTurn,
}: Props) {
  function handleCellClick(i: number, j: number) {
    if (!isPlayerTurn || !canMakeMove(opponentBoard, i, j)) return;
    submitMove(room.id, username, i, j);
  }

  return (
    <BaseComponent room={room}>
      <div className="p-4 mb-4 border border-dashed border-border rounded-lg text-center space-y-4">
        <h1 className="text-2xl font-bold grow">
          {isPlayerTurn
            ? 'Your turn! Make a move.'
            : "Opponent's turn. Please wait..."}
        </h1>
      </div>
      <div className="flex justify-center gap-64">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-center">Your fleet</h1>
          <Board board={playerBoard} allowClick={false} onClick={() => {}} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-center">Opponent's waters</h1>
          <Board
            board={opponentBoard}
            allowClick={isPlayerTurn}
            onClick={handleCellClick}
          />
        </div>
      </div>
    </BaseComponent>
  );
}

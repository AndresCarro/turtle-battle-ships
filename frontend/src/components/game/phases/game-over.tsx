import { Button } from '@/components/ui/button';
import { Board } from '../board';
import { BaseComponent } from './base';
import type { Board as BoardType, GameRoom } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import { useMainStore } from '@/store/main-store';
import { useGameWebSocket } from '@/hooks/use-game-websocket';

type Props = {
  room: GameRoom;
  playerBoard: BoardType;
  opponentBoard: BoardType;
  playerWon: boolean;
};

export function GameOver({
  room,
  playerBoard,
  opponentBoard,
  playerWon,
}: Props) {
  const navigate = useNavigate();
  const setGameRoomInStore = useMainStore((state) => state.setGameRoom);
  const { disconnect } = useGameWebSocket();

  function handleBackToLobby() {
    setGameRoomInStore(null);
    disconnect();
    navigate({ to: '/lobby' });
  }

  return (
    <BaseComponent room={room}>
      <div className="p-4 mb-4 border border-dashed border-border rounded-lg text-center space-y-4">
        <h1 className="text-2xl font-bold grow">
          {playerWon ? 'Congratulations! You won!' : 'Game Over! You lost.'}
        </h1>
        <Button onClick={handleBackToLobby}>Back to Lobby</Button>
      </div>
      <div className="flex justify-center gap-64">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-center">Your fleet</h1>
          <Board board={playerBoard} allowClick={false} onClick={() => {}} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-center">Opponent's waters</h1>
          <Board board={opponentBoard} allowClick={false} onClick={() => {}} />
        </div>
      </div>
    </BaseComponent>
  );
}

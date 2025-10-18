import { GameOver } from '@/components/game/phases/game-over';
import { PlacingShips } from '@/components/game/phases/placing-ships';
import { Playing } from '@/components/game/phases/playing';
import { WaitingOpponentPlacingShips } from '@/components/game/phases/waiting-opponent-placing-ships';
import { Card, CardContent } from '@/components/ui/card';
import { GameRoomStatuses, GRID_SIZE, maxAmountOfShips } from '@/constants';
import { boardsAreUpToDate, placeShotsOnBoard } from '@/domain/playing';
import { useGameWebSocket } from '@/hooks/use-game-websocket';
import { useMainStore } from '@/store/main-store';
import type { Board as BoardType } from '@/types';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/game')({
  beforeLoad: () => {
    const mainStore = useMainStore.getState();
    if (mainStore.gameRoom === null) {
      throw redirect({ to: '/lobby' });
    }
    if (mainStore.player === null) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const gameRoom = useMainStore((state) => state.gameRoom)!;
  const player = useMainStore((state) => state.player)!;
  const [playerBoard, setPlayerBoard] = useState<BoardType>(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(''))
  );
  const [opponentBoard, setOpponentBoard] = useState<BoardType>(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(''))
  );

  const { gameState, postFleet, makeShot } = useGameWebSocket({
    gameId: gameRoom.id,
    username: player.name,
    autoConnect: true,
  });

  if (player === null) {
    throw redirect({ to: '/' });
  }

  if (!gameState) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center gap-5 justify-center">
          <LoaderCircle className="size-9 animate-spin" />
          <h1 className="text-4xl font-bold">Loading...</h1>
        </CardContent>
      </Card>
    );
  }

  const phase = gameState.status;

  if (
    phase === GameRoomStatuses.IN_PROGRESS &&
    !boardsAreUpToDate(
      playerBoard,
      opponentBoard,
      gameState.shots?.filter((shot) => shot.player === player.name) ?? [],
      gameState.shots?.filter((shot) => shot.player !== player.name) ?? []
    )
  ) {
    if (gameState.currentTurn === player.name) {
      const opponentShots =
        gameState.shots?.filter((shot) => shot.player !== player.name) ?? [];
      setPlayerBoard(placeShotsOnBoard(playerBoard, opponentShots));
    } else {
      const playerShots =
        gameState.shots?.filter((shot) => shot.player === player.name) ?? [];
      setOpponentBoard(placeShotsOnBoard(opponentBoard, playerShots));
    }
  }

  if (phase === GameRoomStatuses.WAITING_FOR_PLAYER) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center gap-5 justify-center">
          <LoaderCircle className="size-9 animate-spin" />
          <h1 className="text-4xl font-bold">Waiting for another player...</h1>
        </CardContent>
      </Card>
    );
  }

  if (
    phase === GameRoomStatuses.SHIPS_SETUP &&
    gameState.ships?.length !== maxAmountOfShips
  ) {
    return (
      <PlacingShips
        room={gameRoom}
        board={playerBoard}
        setBoard={setPlayerBoard}
        submitFleet={postFleet}
        player={player}
      />
    );
  }

  if (phase === GameRoomStatuses.SHIPS_SETUP) {
    return <WaitingOpponentPlacingShips room={gameRoom} board={playerBoard} />;
  }

  if (phase === GameRoomStatuses.IN_PROGRESS) {
    return (
      <Playing
        room={gameRoom}
        playerBoard={playerBoard}
        opponentBoard={opponentBoard}
        username={player.name}
        submitMove={makeShot}
        isPlayerTurn={player.name == gameState.currentTurn}
      />
    );
  }

  if (phase === GameRoomStatuses.FINISHED) {
    return (
      <GameOver
        room={gameRoom}
        playerBoard={playerBoard}
        opponentBoard={opponentBoard}
        playerWon={gameState.winner === player.name}
      />
    );
  }

  return <></>;
}

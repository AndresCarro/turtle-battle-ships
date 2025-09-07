import { useParams, useSearch } from '@tanstack/react-router'
import { BattleshipGame } from '@/components/battleship-game'
import { useEffect, useState } from 'react';
import type { Game } from '@/models/models';
import { GameRoomService } from '@/services/game-room-service';
import { Card } from '@/components/ui/card';

const PageBorder = ({children}:{children: React.ReactNode}) => (
  <main className="p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">Turtle Battleship</h1>
          <p className="text-blue-700 dark:text-blue-300">Sink all enemy ships to win!</p>
        </div>
        {children}
      </div>
    </main>
);

export function GamePage() {
  const [gameRoom, setGameRoom] = useState<Game>();
  const params = useParams({ strict: false }) as { id: string };
  const { username } = useSearch({ from: '/game/$id' });
  const id = params.id;

  useEffect(() => {
    const getGameRoom = async () => {
      setGameRoom(await GameRoomService.getGameRoom(id));
    };

    getGameRoom();
    
    const interval = setInterval(() => {
      getGameRoom();
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  if (!gameRoom) {
    return (
      <PageBorder>
        <Card>
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
            Loading...
          </h2>
        </Card>
      </PageBorder>
    );
  }

  if (!gameRoom?.player2) {
    return (
      <PageBorder>
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
              {gameRoom.name}
          </h2>
          <h6 className='text-white'>Waiting for another player...</h6>
        </Card>
      </PageBorder>
    );
  }
  
  return (
    <PageBorder>
      <BattleshipGame gameRoom={gameRoom} currentUsername={username}/>
    </PageBorder>
  )
};

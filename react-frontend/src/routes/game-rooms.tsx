import { useRouter, useSearch } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { GameRoomService } from '@/services/game-room-service';
import { CreateGameRoomDialog } from '@/components/create-game-room-dialog';
import { RefreshCw } from 'lucide-react';
import type { Game } from '@/models/models';

const GameRoomTableHeader = () => (
  <TableHeader>
    <TableRow>
      <TableHead className="text-blue-900 dark:text-blue-100">
        Room Name
      </TableHead>
      <TableHead className="text-blue-900 dark:text-blue-100">
        Room ID
      </TableHead>
    </TableRow>
    </TableHeader>);

const GameRoomTableRow = ({gameRoom, onClick}:{gameRoom: Game; onClick: () => void;}) => 
    <TableRow key={gameRoom.id} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={onClick}>
        <TableCell className="font-medium text-blue-800 dark:text-blue-200">{gameRoom.name}</TableCell>
        <TableCell className="text-blue-600 dark:text-blue-300">{gameRoom.id}</TableCell>
        {gameRoom.player1 && gameRoom.player2 ? <TableCell className="text-white">Game room is full</TableCell> : <></>}
    </TableRow>

const EmptyGameRoomTable = () =>
    <TableRow className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
        <TableCell className="font-medium text-blue-800 dark:text-blue-200">There are no game rooms available, create one!</TableCell>
    </TableRow>;

export function GameRoomsPage() {
  const [gameRooms, setGameRooms] = useState<Game[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { username } = useSearch({ from: '/game-rooms' });
  const router = useRouter();

  const getGameRooms = async () => {
    setGameRooms(await GameRoomService.getGameRooms());
  }

  const handleCreateRoom = async (roomName: string) => {
    const gameRoom = await GameRoomService.createGameRoom(roomName, username);
    if (!gameRoom) {
        return false;
    }
    router.navigate({
      to: `/game/${gameRoom.id}`,
      search: { username: username.trim() }
    });
    return true;
  };
  useEffect(() => {
    getGameRooms();
  }, []);

  return (
    <main className="p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Turtle Battleship
          </h1>
          <p className="text-blue-700 dark:text-blue-300">
            Welcome, {username}! Pick a game room to play!
          </p>
        </div>
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
              Available Game Rooms
            </h2>
            <div className="flex gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={getGameRooms}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                Create game room
              </Button>
            </div>
          </div>
          <Table>
            <GameRoomTableHeader />
            <TableBody>
              {gameRooms.length === 0 ? <EmptyGameRoomTable />
              : gameRooms.map((gameRoom) => (
                <GameRoomTableRow gameRoom={gameRoom} onClick={async() => {
                    const joinedGameRoom = await GameRoomService.joinGameRoom(gameRoom.id, username);
                    if (!joinedGameRoom) {
                        alert("Could not join game room, try again or choose another game room.");
                        return;
                    }
                    router.navigate({ 
                        to: `/game/${gameRoom.id}`,
                        search: { username: username.trim() }
                    });
                }} key={gameRoom.id}/>
              ))}
            </TableBody>
          </Table>
        </Card>
        <CreateGameRoomDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateRoom={handleCreateRoom}
        />
      </div>
    </main>
  );
}

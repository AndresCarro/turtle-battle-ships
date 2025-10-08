import { FriendEntry } from '@/components/lobby/friend-entry';
import { GameRoomEntry } from '@/components/lobby/game-room-entry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameRoomService } from '@/services/game-room-service';
import { useMainStore } from '@/store/main-store';
import type { GameRoom, Player } from '@/types';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Ban, ChartLine, Crown, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/lobby')({
  beforeLoad: () => {
    const mainStore = useMainStore.getState();
    if (mainStore.player === null) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const setGameRoomInStore = useMainStore((state) => state.setGameRoom);
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);

  const player = useMainStore((state) => state.player)!;

  useEffect(() => {
    const fetchGameRooms = async () => {
      setGameRooms(await GameRoomService.getGameRooms());
    };

    fetchGameRooms();
  }, []);

  const friends: Player[] = [
    { id: '1', name: 'Friend 1', totalWins: 10, totalGames: 20 },
    { id: '2', name: 'Friend 2', totalWins: 5, totalGames: 15 },
    { id: '3', name: 'Friend 3', totalWins: 8, totalGames: 12 },
  ];
  const [gameRoom, setGameRoom] = useState('');

  async function handleCreateRoom() {
    const gameRoomResult = await GameRoomService.createGameRoom(
      gameRoom,
      player.name
    );
    if (!gameRoomResult) {
      alert('Failed to create game room. Please try again.');
      return;
    }
    setGameRoomInStore({
      id: gameRoomResult.id,
      name: gameRoomResult.name,
      status: gameRoomResult.status,
      creationTimestamp: gameRoomResult.creationTimestamp,
      player1: gameRoomResult.player1,
      player2: gameRoomResult.player2,
      currentTurn: gameRoomResult.currentTurn,
      winner: gameRoomResult.winner,
    });
    navigate({ to: '/game' });
  }

  return (
    <div className="grid grid-cols-3 gap-6 w-full overflow-hidden">
      <Card className="w-full col-span-2 overflow-y-auto">
        <CardHeader className="flex justify-start gap-4">
          <h1 className="text-2xl font-bold grow">🐢 Turtle Battleships</h1>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Plus className="size-4" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Name your new game room</DialogTitle>
              </DialogHeader>
              <Input
                value={gameRoom}
                onChange={(e) => setGameRoom(e.target.value)}
                type="text"
                placeholder="Mini Turtle Room"
                required
              />
              <DialogFooter>
                <Button
                  className="cursor-pointer"
                  disabled={gameRoom.trim() === ''}
                  onClick={handleCreateRoom}
                >
                  Create Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-2 @container">
            {gameRooms.map((room) => (
              <GameRoomEntry key={room.id} room={room} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="w-full overflow-y-auto">
        <CardHeader className="flex flex-col justify-start">
          <h1 className="text-2xl font-bold grow">😉 Welcome, {player.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Crown className="size-4" />
              <span className="font-medium">{player.totalWins} wins</span>
            </Badge>
            <Badge variant="secondary">
              <Ban className="size-4" />
              <span className="font-medium">
                {player.totalGames - player.totalWins} loses
              </span>
            </Badge>
            <Badge variant="secondary">
              <ChartLine className="size-4" />
              <span className="font-medium">
                Ratio: {(player.totalWins / player.totalGames).toFixed(2)}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="friends">
            <TabsList className="w-full">
              <TabsTrigger value="friends" className="cursor-pointer">
                Friends
              </TabsTrigger>
              <TabsTrigger value="pastGames" className="cursor-pointer">
                Past Games
              </TabsTrigger>
            </TabsList>
            <TabsContent value="friends">
              <div className="flex flex-col gap-y-2">
                {friends.map((friend, idx) => (
                  <FriendEntry
                    key={friend.id}
                    friend={friend}
                    isConnected={idx % 2 === 0}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="pastGames">
              <div className="flex flex-col gap-y-2 @container">
                {gameRooms.map((room) => (
                  <GameRoomEntry key={room.id} room={room} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

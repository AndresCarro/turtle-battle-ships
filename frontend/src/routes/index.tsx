import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserService } from '@/services/user-service';
import { useMainStore } from '@/store/main-store';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [username, setUsername] = useState('');
  const setPlayerInStore = useMainStore((state) => state.setPlayer);
  const navigate = useNavigate();

  async function handleSubmit() {
    const currentUser = await UserService.createUser(username.trim());
    if (!currentUser) {
      alert('Failed to create user. Please try again.');
      return;
    }
    setPlayerInStore({
      id: currentUser.id,
      name: currentUser.name,
      totalGames: currentUser.totalGames,
      totalWins: currentUser.totalWins,
    });
    navigate({ to: '/lobby' });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="text-4xl font-bold text-center pb-4">
          🐢 Turtle Battleships
        </h1>
        <CardTitle>Welcome!</CardTitle>
        <CardDescription>
          Enter your name below to enter the game lobby.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="John Doe"
          required
        />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full cursor-pointer"
          onClick={handleSubmit}
          disabled={username.trim() === ''}
        >
          Start playing!
        </Button>
      </CardFooter>
    </Card>
  );
}

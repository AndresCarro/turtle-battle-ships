import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/utils/ui';
import { MessageCircleMore, MessageCircleOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Chat } from '../chat';
import type { GameRoom, Message } from '@/types';
import { useMainStore } from '@/store/main-store';

export function BaseComponent({
  room,
  children,
}: {
  room: GameRoom;
  children: React.ReactNode;
}) {
  const [showChat, setShowChat] = useState(false);

  const playerUsername = useMainStore((state) => state.player!.name);
  const [player, opponent] = useMemo(() => {
    if (room.player1?.name === playerUsername) {
      return [room.player1, room.player2];
    }
    return [room.player2, room.player1];
  }, [room]);

  // TODO
  const messages: Message[] = [
    { id: '1', sender: 'alejo', content: 'Hello!', timestamp: new Date() },
    { id: '2', sender: 'andy', content: 'Hi there!', timestamp: new Date() },
    {
      id: '3',
      sender: 'alejo',
      content: 'How are you?',
      timestamp: new Date(),
    },
    {
      id: '4',
      sender: 'andy',
      content: "I'm good, thanks! And you?",
      timestamp: new Date(),
    },
    {
      id: '5',
      sender: 'alejo',
      content: 'Doing well, just excited to play!',
      timestamp: new Date(),
    },
    {
      id: '6',
      sender: 'andy',
      content: "Same here! Let's have a great game.",
      timestamp: new Date(),
    },
    {
      id: '7',
      sender: 'alejo',
      content: 'Absolutely! May the best turtle win! 🐢',
      timestamp: new Date(),
    },
    {
      id: '8',
      sender: 'andy',
      content: 'Haha, may the best turtle win! 🐢',
      timestamp: new Date(),
    },
  ];

  function handleSendMessage(message: string) {
    // TODO
    console.log('Send message:', message);
  }

  return (
    <div
      className={cn(
        'grid gap-6 w-full overflow-hidden',
        showChat ? 'grid-cols-3' : 'grid-cols-2'
      )}
    >
      <Card className="w-full col-span-2 overflow-y-auto">
        <CardHeader className="flex justify-start gap-4">
          <h1 className="text-2xl font-bold grow">🐢 Turtle Battleships</h1>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? (
              <MessageCircleOff className="size-4" />
            ) : (
              <MessageCircleMore className="size-4" />
            )}
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </Button>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {showChat && player && opponent && (
        <Card className="w-full py-0 gap-0 overflow-y-auto">
          <Chat
            messages={messages}
            playerUsername={player.name}
            opponentUsername={opponent.name}
            handleSendMessage={handleSendMessage}
          />
        </Card>
      )}
    </div>
  );
}

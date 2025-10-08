import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/utils/ui';
import { MessageCircleMore, MessageCircleOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Chat } from '../chat';
import type { GameRoom } from '@/types';
import { useMainStore } from '@/store/main-store';
import { useGameWebSocket } from '@/hooks/use-game-websocket';

export function BaseComponent({
  room,
  children,
}: {
  room: GameRoom;
  children: React.ReactNode;
}) {
  const [showChat, setShowChat] = useState(false);
  const { messages, sendMessage } = useGameWebSocket();
  const playerUsername = useMainStore((state) => state.player!.name);
  const [player, opponent] = useMemo(() => {
    if (room.player1?.name === playerUsername) {
      return [room.player1, room.player2];
    }
    return [room.player2, room.player1];
  }, [room]);

  async function handleSendMessage(message: string) {
    sendMessage(message);
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

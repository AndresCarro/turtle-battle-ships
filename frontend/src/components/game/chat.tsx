import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime } from '@/utils/date';
import { cn } from '@/utils/ui';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Message } from '@/types';
import { useState } from 'react';

type Props = {
  messages: Message[];
  playerUsername: string;
  opponentUsername: string;
  handleSendMessage: (message: string) => void;
};

export function Chat({
  messages,
  playerUsername,
  opponentUsername,
  handleSendMessage,
}: Props) {
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <Avatar className="size-10">
          <AvatarFallback className="bg-primary text-primary-foreground capitalize">
            {opponentUsername.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-card-foreground">
            {opponentUsername}
          </h2>
          <Badge variant="success">Online</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 message-enter',
              message.sender === playerUsername
                ? 'flex-row-reverse'
                : 'flex-row'
            )}
          >
            {message.sender !== playerUsername && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs capitalize">
                  {message.sender.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-xs px-4 py-3 rounded-2xl text-pretty',
                message.sender === playerUsername
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-secondary text-secondary-foreground rounded-bl-md'
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p
                className={cn(
                  'text-xs mt-1 opacity-70',
                  message.sender === playerUsername
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 border-t border-border">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
          </div>
          <Button
            onClick={() => {
              handleSendMessage(newMessage);
              setNewMessage('');
            }}
            disabled={newMessage.trim() === ''}
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateGameRoomDialog({ isOpen, onClose, onCreateRoom }: 
    {   
        isOpen: boolean;
        onClose: () => void;
        onCreateRoom: (roomName: string) => Promise<boolean>;
    }) {
  const [roomName, setRoomName] = useState("");

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    const gameRoomCreated = await onCreateRoom(roomName.trim());
    if (!gameRoomCreated) {
        alert("Could not create game room");
        setRoomName("");
        return;
    }
    
    setRoomName("");
    onClose();
  };

  const handleCancel = () => {
    setRoomName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-100 dark:bg-blue-900">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Game Room</DialogTitle>
          <DialogDescription className="text-white">
            Enter a name for your new game room.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full text-white placeholder:text-gray-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateRoom();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
          className='text-white'
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRoom}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!roomName.trim()}
          >
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

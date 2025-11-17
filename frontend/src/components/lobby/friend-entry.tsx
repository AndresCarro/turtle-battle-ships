import type { Player } from '@/types';
import { Badge } from '../ui/badge';
import { Ban, ChartLine, Crown, UserMinus } from 'lucide-react';
import { Button } from '../ui/button';
import { FriendService } from '@/services/friend-service';
import { useMainStore } from '@/store/main-store';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

export function FriendEntry({
  friend,
}: {
  friend: Player;
}) {
  const player = useMainStore((state) => state.player)!;

  const handleDeleteUser = async () => {
    try {
      await FriendService.deleteFriend(player.name, friend.name);
      toast.success(`You are not friends with ${friend.name} anymore`);
    } catch (error) {
      toast.error('Error deleting friend', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    }
  }

  return (
    <div className="p-4 border rounded-lg hover:bg-muted flex justify-between gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold m-0">{friend.name}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            <Crown className="size-4" />
            <span className="font-medium">{friend.totalWins} wins</span>
          </Badge>
          <Badge variant="secondary">
            <Ban className="size-4" />
            <span className="font-medium">
              {friend.totalGames - friend.totalWins} loses
            </span>
          </Badge>
          <Badge variant="secondary">
            <ChartLine className="size-4" />
            <span className="font-medium">
              Ratio: {(friend.totalWins / friend.totalGames).toFixed(2)}
            </span>
          </Badge>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <UserMinus />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this user from your friends list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

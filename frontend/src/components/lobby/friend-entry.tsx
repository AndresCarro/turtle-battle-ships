import type { Player } from "@/types";
import { Badge } from "../ui/badge";
import { Ban, ChartLine, Crown } from "lucide-react";

export function FriendEntry({ friend, isConnected = false }: { friend: Player, isConnected?: boolean }) {
    return (
        <div className="p-4 border rounded-lg hover:bg-muted flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <h2 className="font-semibold m-0">{friend.username}</h2>
                {isConnected && <Badge variant="success">Online</Badge>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                    <Crown className="size-4" />
                    <span className="font-medium">{friend.wins} wins</span>
                </Badge>
                <Badge variant="secondary">
                    <Ban className="size-4" />
                    <span className="font-medium">{friend.totalGames - friend.wins} loses</span>
                </Badge>
                <Badge variant="secondary">
                    <ChartLine className="size-4" />
                    <span className="font-medium">Ratio: {(friend.wins / friend.totalGames).toFixed(2)}</span>
                </Badge>
            </div>
        </div>
    )
}
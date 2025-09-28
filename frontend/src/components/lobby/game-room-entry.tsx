import type { GameRoom } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { GameRoomStatuses } from "@/constants";
import { Clapperboard, Rocket } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMainStore } from "@/store/main-store";

export function GameRoomEntry({ room }: { room: GameRoom }) {
    const navigate = useNavigate();
    const setGameRoomInStore = useMainStore((state) => state.setGameRoom);
    const player = useMainStore((state) => state.player)!;

    function handleJoinRoom() {
        // TODO: Connect to backend to join room
        setGameRoomInStore({ ...room, players: [...room.players, player] });
        navigate({ to: "/game" });
    }

    return (
        <div className="p-4 border rounded-lg hover:bg-muted flex flex-col @md:flex-row @md:items-center justify-between gap-4">
            <div className="grow flex flex-col gap-1">
                <h2 className="font-semibold m-0">{room.name}</h2>
                <span className="text-sm text-muted-foreground">Created at: {room.createdAt.toLocaleString()}</span>
                <div className="flex items-center gap-2 pt-0.5">
                    <Badge variant="secondary">{room.players[0]?.username ?? "???"}</Badge>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <Badge variant="secondary">{room.players[1]?.username ?? "???"}</Badge>
                </div>
            </div>
            {room.status === GameRoomStatuses.WAITING && (
                <Button size="sm" className="cursor-pointer w-full @md:w-auto" onClick={handleJoinRoom}>
                    <Rocket className="size-4" />
                    Join Room
                </Button>
            )}
            {room.status === GameRoomStatuses.FINISHED && (
                <Button size="sm" variant="outline" className="cursor-pointer w-full @md:w-auto">
                    <Clapperboard className="size-4" />
                    See Replay
                </Button>
            )}
        </div>
    )
}
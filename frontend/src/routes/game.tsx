import { GameOver } from "@/components/game/phases/game-over";
import { PlacingShips } from "@/components/game/phases/placing-ships";
import { Playing } from "@/components/game/phases/playing";
import { WaitingOpponentPlacingShips } from "@/components/game/phases/waiting-opponent-placing-ships";
import { Card, CardContent } from "@/components/ui/card";
import { GRID_SIZE } from "@/constants";
import { useMainStore } from "@/store/main-store";
import type { Board as BoardType } from "@/types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/game")({
    beforeLoad: () => {
        const mainStore = useMainStore.getState();
        if (mainStore.gameRoom === null) {
            throw redirect({ to: "/lobby" });
        }
    },
    component: RouteComponent,
});

enum GamePhases {
    WAITING_FOR_OPPONENT = "WAITING_FOR_OPPONENT",
    PLACING_SHIPS = "PLACING_SHIPS",
    WAITING_OPPONENT_PLACING_SHIPS = "WAITING_OPPONENT_PLACING_SHIPS",
    PLAYERS_TURN = "PLAYERS_TURN",
    OPPONENTS_TURN = "OPPONENTS_TURN",
    GAME_OVER = "GAME_OVER",
}

function RouteComponent() {
    const gameRoom = useMainStore((state) => state.gameRoom)!;
    const [playerBoard, setPlayerBoard] = useState<BoardType>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("")));
    const [opponentBoard, setOpponentBoard] = useState<BoardType>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("")));

    // TODO: Connect with websockets to get real phase and updates on board
    const phase = GamePhases.GAME_OVER;

    if (phase === GamePhases.WAITING_FOR_OPPONENT) {
        return (
            <Card className="w-full max-w-4xl">
                <CardContent className="flex items-center gap-5 justify-center">
                    <LoaderCircle className="size-9 animate-spin" />
                    <h1 className="text-4xl font-bold">
                        Waiting for another player...
                    </h1>
                </CardContent>
            </Card >
        )
    }
    if (phase === GamePhases.PLACING_SHIPS) {
        return <PlacingShips room={gameRoom} board={playerBoard} setBoard={setPlayerBoard} submitFleet={console.log} />
    }
    if (phase === GamePhases.WAITING_OPPONENT_PLACING_SHIPS) {
        return <WaitingOpponentPlacingShips room={gameRoom} board={playerBoard} />
    }
    if (phase === GamePhases.PLAYERS_TURN || phase === GamePhases.OPPONENTS_TURN) {
        return (
            <Playing
                room={gameRoom}
                playerBoard={playerBoard}
                opponentBoard={opponentBoard}
                submitMove={console.log}
                isPlayerTurn={phase === GamePhases.PLAYERS_TURN}
            />
        );
    }
    if (phase === GamePhases.GAME_OVER) {
        return <GameOver room={gameRoom} playerBoard={playerBoard} opponentBoard={opponentBoard} playerWon={true} />
    }

    return (<></>)
}

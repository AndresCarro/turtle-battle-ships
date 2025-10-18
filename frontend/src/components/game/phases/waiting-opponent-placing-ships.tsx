import { Board } from "../board";
import { BaseComponent } from "./base";
import type { Board as BoardType, GameRoom, Message } from "@/types";

export function WaitingOpponentPlacingShips({ board, gameState, messages }: { board: BoardType, gameState: GameRoom | null, messages: Message[] }) {
    return (
        <BaseComponent gameState={gameState} messages={messages}>
            <div className="p-4 mb-4 border border-dashed border-border rounded-lg text-center space-y-4">
                <h1 className="text-2xl font-bold grow">Waiting for the opponent...</h1>
            </div>
            <div className="flex justify-center">
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-center">Your fleet</h1>
                    <Board board={board} allowClick={false} onClick={() => { }} />
                </div>
            </div>
        </BaseComponent>
    )
}
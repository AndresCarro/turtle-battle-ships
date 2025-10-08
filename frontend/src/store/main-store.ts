import type { GameRoom, Player } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum GamePhases {
    WAITING_FOR_OPPONENT = "WAITING_FOR_OPPONENT",
    PLACING_SHIPS = "PLACING_SHIPS", 
    WAITING_OPPONENT_PLACING_SHIPS = "WAITING_OPPONENT_PLACING_SHIPS",
    PLAYERS_TURN = "PLAYERS_TURN",
    OPPONENTS_TURN = "OPPONENTS_TURN",
    GAME_OVER = "GAME_OVER",
}

type State = {
    player: Player | null;
    gameRoom: GameRoom | null;
    currentGameState: any | null;
    gamePhase: GamePhases;
    isConnectedToWebSocket: boolean;
    webSocketError: string | null;
}

type Actions = {
    setPlayer: (player: Player | null) => void;
    setGameRoom: (room: GameRoom | null) => void;
    setCurrentGameState: (state: any) => void;
    setGamePhase: (phase: GamePhases) => void;
    setWebSocketConnection: (connected: boolean) => void;
    setWebSocketError: (error: string | null) => void;
    clear: () => void;
}

export const useMainStore = create<State & Actions>()(
    persist(
        (set) => ({
            player: null,
            gameRoom: null,
            currentGameState: null,
            gamePhase: GamePhases.WAITING_FOR_OPPONENT,
            isConnectedToWebSocket: false,
            webSocketError: null,
            setPlayer: (player) => set({ player }),
            setGameRoom: (gameRoom) => set({ gameRoom }),
            setCurrentGameState: (currentGameState) => set({ currentGameState }),
            setGamePhase: (gamePhase) => set({ gamePhase }),
            setWebSocketConnection: (isConnectedToWebSocket) => set({ isConnectedToWebSocket }),
            setWebSocketError: (webSocketError) => set({ webSocketError }),
            clear: () => set({ 
                player: null, 
                gameRoom: null, 
                currentGameState: null,
                gamePhase: GamePhases.WAITING_FOR_OPPONENT,
                isConnectedToWebSocket: false,
                webSocketError: null
            }),
        }),
        {
            name: "main-store",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

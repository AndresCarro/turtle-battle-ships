import type { GameRoom, Player } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
    player: Player | null;
    gameRoom: GameRoom | null;
}

type Actions = {
    setPlayer: (player: Player | null) => void;
    setGameRoom: (room: GameRoom | null) => void;
    clear: () => void;
}

export const useMainStore = create<State & Actions>()(
    persist(
        (set) => ({
            player: null,
            gameRoom: null,
            setPlayer: (player) => set({ player }),
            setGameRoom: (gameRoom) => set({ gameRoom }),
            clear: () => set({ player: null, gameRoom: null }),
        }),
        {
            name: "main-store",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

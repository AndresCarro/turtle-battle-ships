import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
    token: string | null
    setToken: (token: string | null) => void
    clearToken: () => void
    isAuthenticated: () => boolean
}

/**
 * Auth store using zustand with persistence (localStorage).
 * Stores only the token.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            setToken: (token) => set({ token }),
            clearToken: () => set({ token: null }),
            isAuthenticated: () => Boolean(get().token),
        }),
        {
            name: "auth-store",
            storage: createJSONStorage(() => localStorage)
        }
    )
)
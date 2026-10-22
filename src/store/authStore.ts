
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoUser } from "../types";

interface AuthState {
  user: DemoUser | null;
  isAuthenticated: boolean;
  setUser: (user: DemoUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "pmt-auth-session",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

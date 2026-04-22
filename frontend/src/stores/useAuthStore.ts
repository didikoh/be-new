import { create } from "zustand";
import { authService } from "../api/services/authService";

interface AuthState {
  user: any;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  /** Re-fetches the user profile (call on mount and after mutations). */
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: async () => {
    await authService.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await authService.check();
      set({ user: res.profile ?? null });
    } catch {
      set({ user: null });
    }
  },
}));

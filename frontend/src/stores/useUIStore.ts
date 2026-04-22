import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface PromptMessage {
  message?: string;
  type?: ToastType;
}

interface UIState {
  /** Global loading spinner — starts `true` until initial auth check finishes. */
  loading: boolean;
  setLoading: (loading: boolean) => void;
  promptMessage: PromptMessage | null;
  setPromptMessage: (msg: PromptMessage | null) => void;
  selectedPage: string;
  setSelectedPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: true,
  setLoading: (loading) => set({ loading }),

  promptMessage: null,
  setPromptMessage: (msg) => set({ promptMessage: msg }),

  selectedPage: "home",
  setSelectedPage: (page) => set({ selectedPage: page }),
}));

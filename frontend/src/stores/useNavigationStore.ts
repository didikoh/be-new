import { create } from "zustand";

interface NavigationState {
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number | null) => void;
  selectedEvent: any;
  setSelectedEvent: (event: any) => void;
  prevPage: string;
  setPrevPage: (page: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  selectedCourseId: null,
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),

  selectedEvent: null,
  setSelectedEvent: (event) => set({ selectedEvent: event }),

  prevPage: "/home",
  setPrevPage: (page) => set({ prevPage: page }),
}));

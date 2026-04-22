import { create } from "zustand";
import { courseService } from "../api/services/courseService";
import { bookingService } from "../api/services/bookingService";
import { studentService } from "../api/services/studentService";

interface DataState {
  courses: any[];
  setCourses: (courses: any[]) => void;
  allBookings: any[];
  setAllBookings: (bookings: any[]) => void;
  cards: any[];
  setCards: (cards: any[]) => void;
  /**
   * Fetches courses, bookings, and cards based on the current user's role.
   * Mirrors the data-loading logic that was previously in UserContext.
   */
  fetchUserData: (user: any) => void;
}

export const useDataStore = create<DataState>((set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),

  allBookings: [],
  setAllBookings: (bookings) => set({ allBookings: bookings }),

  cards: [],
  setCards: (cards) => set({ cards }),

  fetchUserData: (user) => {
    if (user?.role === "admin") return;

    courseService
      .getAll()
      .then((data) => set({ courses: data }))
      .catch((err) => console.error("获取课程失败", err));

    if (user && user.role !== "admin") {
      bookingService
        .getAll()
        .then((data) => set({ allBookings: data }))
        .catch((err) => console.error("获取预约失败", err));
    }

    if (user?.role === "student") {
      studentService
        .getCards(user.id)
        .then((data) => set({ cards: data }))
        .catch((err) => console.error("获取卡片失败", err));
    }
  },
}));

import apiClient from "../client";
import { BOOKINGS } from "../endpoints";
import { useAuthStore } from "../../stores/useAuthStore";
import type { Booking, CreateBookingRequest } from "../types/booking";

interface BookingPayload {
  student_id: number;
  course_id: number;
  head_count: number;
}

function buildPayload(data: CreateBookingRequest): BookingPayload {
  const user = useAuthStore.getState().user;
  const payload: BookingPayload = {
    student_id: user?.id ?? 0,
    course_id: data.course_id,
    head_count: data.head_count,
  };

  if (import.meta.env.DEV) {
    console.log("[bookingService] booking payload →", payload);
  }

  return payload;
}

export const bookingService = {
  getAll(): Promise<Booking[]> {
    return apiClient.get(BOOKINGS.LIST).then((r) => r.data.data?.bookings ?? []);
  },

  create(data: CreateBookingRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(BOOKINGS.CREATE, buildPayload(data)).then((r) => r.data);
  },

  createFrozen(data: CreateBookingRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(BOOKINGS.FROZEN, buildPayload(data)).then((r) => r.data);
  },
};

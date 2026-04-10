import apiClient from "../client";
import { BOOKINGS } from "../endpoints";
import type { Booking, CreateBookingRequest } from "../types/booking";

export const bookingService = {
  getAll(): Promise<Booking[]> {
    return apiClient.get(BOOKINGS.LIST).then((r) => r.data.data?.bookings ?? []);
  },

  create(data: CreateBookingRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(BOOKINGS.CREATE, data).then((r) => r.data);
  },

  createFrozen(data: CreateBookingRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(BOOKINGS.FROZEN, data).then((r) => r.data);
  },
};

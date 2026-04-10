export interface Booking {
  id: number;
  course_id: number;
  student_id: number;
  student_name: string;
  student_phone: string;
  head_count: number;
  status: "booked" | "attended" | "cancelled";
}

export interface CreateBookingRequest {
  course_id: number;
  head_count: number;
}

export interface CreateFrozenBookingRequest {
  course_id: number;
  head_count: number;
}

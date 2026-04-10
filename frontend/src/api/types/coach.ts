import type { Course } from "./course";
import type { Booking } from "./booking";

export interface CoachOverview {
  classCountThisMonth: number;
  studentCountThisMonth: number;
}

export interface CoachCourseDetailResponse {
  course: Course;
  bookings: Booking[];
}

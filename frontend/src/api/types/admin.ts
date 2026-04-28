import type { Course } from "./course";

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminListParams {
  page?: number;
  per_page?: number;
  search?: string;
  search_by?: string;
  [key: string]: string | number | undefined;
}

export interface AdminHomeData {
  user_count: number;
  member_count: number;
  booking_count: number;
  total_amount: number;
}

export interface AdminCourse extends Course {
  booking_count?: number;
  coach?: string;
}

export interface CreateCourseRequest {
  name: string;
  course_pic?: string;
  price: number;
  price_m: number;
  min_book: number;
  coach_id: string | number;
  start_time: string;
  location: string;
  duration: number;
}

export interface UpdateCourseRequest extends CreateCourseRequest {
  id: number;
}

export interface AdminStudent {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  birthday?: string;
  is_member: number;
  point?: number;
  balance?: number;
  frozen_balance?: number;
  valid_to?: string;
  valid_balance_to?: string;
  join_date?: string;
}

export interface AdminCoach {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  birthday?: string;
  month_student_count?: number;
  month_course_count?: number;
  join_date?: string;
}

export interface CoachCourse {
  id: number;
  name: string;
  start_time: string;
  student_count: number;
}

export interface Transaction {
  transaction_id: number;
  student_name: string;
  type: string;
  payment: number;
  amount: number;
  point?: number;
  head_count?: number;
  course_id?: number;
  course_name?: string;
  start_time?: string;
  description?: string;
  time: string;
}

export interface TopupRequest {
  id: number;
  amount: number;
  valid_balance_to: string;
  package: number;
  payment: number;
}

export interface WalkInRequest {
  course_id: number;
  head_count: number;
}

export interface BookByPhoneRequest {
  phone: string;
  course_id: number;
  head_count: number;
}

export interface StudentLookupRequest {
  phone: string;
}

export interface PurchaseRequest {
  phone: string;
  payment: number;
  description: string;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  birthday: string;
  role: string;
  password?: string;
}

export interface UpdateUserRequest {
  name: string;
  phone: string;
  birthday: string;
  role: string;
  user_id: number;
}

export interface UpdateTransactionPaymentRequest {
  payment: number;
}

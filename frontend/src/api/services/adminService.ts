import apiClient from "../client";
import { ADMIN } from "../endpoints";
import type {
  AdminHomeData,
  AdminCourse,
  AdminStudent,
  AdminCoach,
  CoachCourse,
  Transaction,
  TopupRequest,
  WalkInRequest,
  BookByPhoneRequest,
  StudentLookupRequest,
  PurchaseRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateTransactionPaymentRequest,
} from "../types/admin";
import type { CourseType } from "../types/course";

export const adminService = {
  // Dashboard
  getHomeData(): Promise<AdminHomeData> {
    return apiClient.get(ADMIN.HOME).then((r) => r.data.data);
  },

  // Courses
  getCourses(): Promise<AdminCourse[]> {
    return apiClient.get(ADMIN.COURSES).then((r) => r.data.data?.courses ?? []);
  },

  getCourseTypes(): Promise<CourseType[]> {
    return apiClient.get(ADMIN.COURSE_TYPES).then((r) => r.data.data?.course_types ?? []);
  },

  createCourse(data: CreateCourseRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.COURSES, data).then((r) => r.data);
  },

  updateCourse(id: number, data: UpdateCourseRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.put(ADMIN.COURSE(id), data).then((r) => r.data);
  },

  deleteCourse(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(ADMIN.COURSE(id)).then((r) => r.data);
  },

  startCourse(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.START_COURSE(id)).then((r) => r.data);
  },

  cancelCourse(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.CANCEL_COURSE(id)).then((r) => r.data);
  },

  saveCourse(data: CourseType): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.SAVE_COURSE, data).then((r) => r.data);
  },

  // Coaches
  getCoaches(): Promise<AdminCoach[]> {
    return apiClient.get(ADMIN.COACHES).then((r) => r.data.data ?? []);
  },

  getCoachCourses(
    coachId: number,
    params: { year: number; month: number }
  ): Promise<{ courses: CoachCourse[] }> {
    return apiClient
      .get(ADMIN.COACH_COURSES(coachId), { params })
      .then((r) => r.data.data);
  },

  // Students
  getStudents(): Promise<AdminStudent[]> {
    return apiClient.get(ADMIN.STUDENTS).then((r) => r.data.data ?? []);
  },

  lookupStudent(data: StudentLookupRequest): Promise<{ success: boolean; name?: string; message?: string }> {
    return apiClient.post(ADMIN.STUDENT_LOOKUP, data).then((r) => ({
      success: r.data.success,
      name: r.data.data?.name,
      message: r.data.message,
    }));
  },

  // Transactions
  queryTransactions(params: { type: string }): Promise<Transaction[]> {
    return apiClient.post(ADMIN.TRANSACTIONS_QUERY, params).then((r) => r.data.data ?? []);
  },

  updateTransactionPayment(
    id: number,
    data: UpdateTransactionPaymentRequest
  ): Promise<{ success: boolean; message?: string }> {
    return apiClient.put(ADMIN.TRANSACTION_PAYMENT(id), data).then((r) => r.data);
  },

  getInvoiceUrl(id: number): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
    return `${baseURL}${ADMIN.INVOICE(id)}`;
  },

  // Top-up & Purchase
  topup(data: TopupRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.TOPUP, data).then((r) => r.data);
  },

  purchase(data: PurchaseRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.PURCHASE, data).then((r) => r.data);
  },

  // Bookings
  bookByPhone(data: BookByPhoneRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.BOOK_BY_PHONE, data).then((r) => r.data);
  },

  walkIn(data: WalkInRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.WALK_IN, data).then((r) => r.data);
  },

  cancelBooking(bookingId: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.CANCEL_BOOKING(bookingId)).then((r) => r.data);
  },

  // Users
  createUser(data: CreateUserRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(ADMIN.CREATE_USER, data).then((r) => r.data);
  },

  updateUser(id: number, data: UpdateUserRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.put(ADMIN.USER(id), data).then((r) => r.data);
  },

  deleteUser(id: number, role?: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(ADMIN.USER(id), { params: role ? { role } : undefined }).then((r) => r.data);
  },
};

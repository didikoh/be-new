export const AUTH = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  REGISTER: "/api/auth/register",
  CHECK: "/api/auth/check",
} as const;

export const COURSES = {
  LIST: "/api/courses",
  DETAIL: (id: number) => `/api/courses/${id}`,
} as const;

export const BOOKINGS = {
  LIST: "/api/bookings",
  CREATE: "/api/bookings",
  FROZEN: "/api/bookings/frozen",
} as const;

export const PROFILE = {
  UPDATE: "/api/profile",
  CHANGE_PASSWORD: "/api/profile/password",
  ADMIN_CHANGE_PASSWORD: "/api/profile/password/admin",
} as const;

export const STUDENTS = {
  CARDS: (id: number) => `/api/students/${id}/cards`,
} as const;

export const ADMIN = {
  HOME: "/api/admin/home",

  COURSES: "/api/admin/courses",
  COURSE: (id: number) => `/api/admin/courses/${id}`,
  SAVE_COURSE: "/api/admin/courses/save",
  START_COURSE: (id: number) => `/api/admin/courses/${id}/start`,
  CANCEL_COURSE: (id: number) => `/api/admin/courses/${id}/cancel`,
  COURSE_TYPES: "/api/admin/course-types",

  COACHES: "/api/admin/coaches",
  COACH_COURSES: (id: number) => `/api/admin/coaches/${id}/courses`,

  STUDENTS: "/api/admin/students",
  STUDENT_LOOKUP: "/api/admin/students/lookup",

  TRANSACTIONS: "/api/admin/transactions",
  TRANSACTIONS_QUERY: "/api/admin/transactions/query",
  TRANSACTION_PAYMENT: (id: number) => `/api/admin/transactions/${id}/payment`,

  TOPUP: "/api/admin/topup",
  PURCHASE: "/api/admin/purchase",

  BOOK_BY_PHONE: "/api/admin/bookings/by-phone",
  WALK_IN: "/api/admin/bookings/walk-in",
  CANCEL_BOOKING: (id: number) => `/api/admin/bookings/${id}/cancel`,

  CREATE_USER: "/api/admin/users",
  SAVE_USER: "/api/admin/users/save",
  USER: (id: number) => `/api/admin/users/${id}`,

  INVOICE: (id: number) => `/api/admin/invoices/${id}`,
} as const;

export const COACH = {
  OVERVIEW: (id: number) => `/api/coach/${id}/overview`,
  COURSE_DETAIL: (id: number) => `/api/coach/courses/${id}`,
} as const;

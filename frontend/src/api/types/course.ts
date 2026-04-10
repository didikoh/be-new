export interface Course {
  id: number;
  name: string;
  coach_id: number;
  coach_name: string;
  coach_pic?: string;
  start_time: string;
  duration: number;
  min_book: number;
  price: number;
  price_m: number;
  location?: string;
  course_pic?: string;
  state: number;
}

export interface CourseDetailResponse {
  course: Course;
  is_booked?: { status: string };
  head_count?: number;
}

export interface CourseType {
  id: number;
  name: string;
  course_pic?: string;
  price: number;
  price_m: number;
  min_book: number;
  coach_id: number;
  duration: number;
}

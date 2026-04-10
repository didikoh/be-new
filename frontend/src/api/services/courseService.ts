import apiClient from "../client";
import { COURSES } from "../endpoints";
import type { Course, CourseDetailResponse } from "../types/course";

export const courseService = {
  getAll(): Promise<Course[]> {
    return apiClient.get(COURSES.LIST).then((r) => r.data.data?.courses ?? []);
  },

  getDetail(courseId: number): Promise<CourseDetailResponse> {
    return apiClient.get(COURSES.DETAIL(courseId)).then((r) => r.data.data);
  },
};

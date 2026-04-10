import apiClient from "../client";
import { COACH } from "../endpoints";
import type { CoachOverview, CoachCourseDetailResponse } from "../types/coach";

export const coachService = {
  getOverview(coachId: number): Promise<CoachOverview> {
    return apiClient.get(COACH.OVERVIEW(coachId)).then((r) => r.data.data);
  },

  getCourseDetail(courseId: number): Promise<CoachCourseDetailResponse> {
    return apiClient.get(COACH.COURSE_DETAIL(courseId)).then((r) => r.data.data);
  },
};

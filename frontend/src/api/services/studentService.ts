import apiClient from "../client";
import { STUDENTS } from "../endpoints";
import type { Card } from "../types/student";

export const studentService = {
  getCards(studentId: number): Promise<Card[]> {
    return apiClient
      .get(STUDENTS.CARDS(studentId))
      .then((r) => r.data.data?.cards ?? []);
  },
};

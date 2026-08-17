import { ApiClient } from './api';

export interface ClassTimetableSlot {
  id: number;
  grade: number;
  classNo: number;
  day: string;
  period: number;
  label: string;
  tag: string | null;
  courseId: number | null;
}

export const classTimetableService = {
  async getMine(): Promise<ClassTimetableSlot[]> {
    return ApiClient.get<ClassTimetableSlot[]>('/class-timetables/me');
  },
};

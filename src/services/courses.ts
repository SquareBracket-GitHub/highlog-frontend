import { ApiClient } from './api';

export interface DaySchedule {
  day: string;
  period: number | string;
}

export interface Course {
  id: number;
  title: string;
  classroom: string;
  days: DaySchedule[];
  tag: string | null;
  grade: number;
  classNo: number | null;
  day: string;
  period: number;
  color: string;
  isClassWide: boolean;
}

export interface CreateCourseInput {
  title: string;
  classroom: string;
  tag: string | null;
  grade: number;
  classNo: number | null;
  schedules: { day: string; period: number }[];
  color: string;
  isClassWide: boolean;
}

export const courseService = {
  // 모든 과목 조회
  async getAll(): Promise<Course[]> {
    return ApiClient.get<Course[]>('/courses');
  },

  // 특정 과목 조회
  async getById(id: number): Promise<Course> {
    return ApiClient.get<Course>(`/courses/${id}`);
  },

  // 과목 생성
  async create(data: CreateCourseInput): Promise<Course> {
    return ApiClient.post<Course>('/courses', data);
  },

  // 과목 정보 수정
  async update(id: number, data: CreateCourseInput): Promise<Course> {
    return ApiClient.put<Course>(`/courses/${id}`, data);
  },

  // 과목 삭제
  async delete(id: number): Promise<{ id: number }> {
    return ApiClient.delete<{ id: number }>(`/courses/${id}`);
  },
};

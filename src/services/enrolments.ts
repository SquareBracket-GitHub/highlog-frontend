import { ApiClient } from './api';

export interface Enrolment {
  studentId: number;
  courseId: number;
}

export const enrolmentService = {
  // 모든 등록 조회
  async getAll(): Promise<Enrolment[]> {
    return ApiClient.get<Enrolment[]>('/enrolments');
  },

  // 학생별 등록 조회
  async getByStudent(studentId: number): Promise<Enrolment[]> {
    return ApiClient.get<Enrolment[]>(`/enrolments/student/${studentId}`);
  },

  // 과목별 등록 조회
  async getByCourse(courseId: number): Promise<Enrolment[]> {
    return ApiClient.get<Enrolment[]>(`/enrolments/course/${courseId}`);
  },

  // 등록 생성
  async create(studentId: number, courseId: number): Promise<Enrolment> {
    return ApiClient.post<Enrolment>('/enrolments', {
      studentId,
      courseId,
    });
  },

  // 등록 수정
  async update(
    studentId: number,
    courseId: number,
    newStudentId: number,
    newCourseId: number
  ): Promise<Enrolment> {
    return ApiClient.put<Enrolment>(
      `/enrolments/student/${studentId}/course/${courseId}`,
      {
        studentId: newStudentId,
        courseId: newCourseId,
      }
    );
  },

  // 학생의 모든 등록 삭제
  async deleteByStudent(studentId: number): Promise<{ studentId: number }> {
    return ApiClient.delete<{ studentId: number }>(`/enrolments/student/${studentId}`);
  },

  // 과목의 모든 등록 삭제
  async deleteByCourse(courseId: number): Promise<{ courseId: number }> {
    return ApiClient.delete<{ courseId: number }>(`/enrolments/course/${courseId}`);
  },

  // 특정 등록 삭제
  async delete(studentId: number, courseId: number): Promise<Enrolment> {
    return ApiClient.delete<Enrolment>(
      `/enrolments/student/${studentId}/course/${courseId}`
    );
  },
};

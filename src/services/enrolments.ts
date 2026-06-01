import { ApiClient } from './api';

export interface Enrolment {
  student_id: number;
  course_id: number;
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
      student_id: studentId,
      course_id: courseId,
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
        student_id: newStudentId,
        course_id: newCourseId,
      }
    );
  },

  // 학생의 모든 등록 삭제
  async deleteByStudent(studentId: number): Promise<{ student_id: number }> {
    return ApiClient.delete<{ student_id: number }>(`/enrolments/student/${studentId}`);
  },

  // 과목의 모든 등록 삭제
  async deleteByCourse(courseId: number): Promise<{ course_id: number }> {
    return ApiClient.delete<{ course_id: number }>(`/enrolments/course/${courseId}`);
  },

  // 특정 등록 삭제
  async delete(studentId: number, courseId: number): Promise<Enrolment> {
    return ApiClient.delete<Enrolment>(
      `/enrolments/student/${studentId}/course/${courseId}`
    );
  },
};

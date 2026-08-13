import { ApiClient } from './api';

export interface Student {
  id: number;
  username: string;
  loginId: string;
  grade: number;
  classNo: number;
  schoolNumber: number;
}

export interface CreateStudentInput {
  username: string;
  loginId: string;
  password: string;
  grade: number;
  classNo: number;
  schoolNumber: number;
}

export interface AuthSession {
  student: Student;
  token: string;
}

export const studentService = {
  // 모든 학생 조회
  async getAll(): Promise<Student[]> {
    return ApiClient.get<Student[]>('/students');
  },

  // 특정 학생 조회
  async getById(id: number): Promise<Student> {
    return ApiClient.get<Student>(`/students/${id}`);
  },

  // 학생 생성
  async create(data: CreateStudentInput): Promise<AuthSession> {
    return ApiClient.post<AuthSession>('/auth/register', data);
  },

  // 학생 정보 수정
  async update(id: number, data: Partial<CreateStudentInput>): Promise<Student> {
    return ApiClient.put<Student>(`/students/${id}`, data);
  },

  // 학생 삭제
  async delete(id: number): Promise<{ id: number }> {
    return ApiClient.delete<{ id: number }>(`/students/${id}`);
  },
};

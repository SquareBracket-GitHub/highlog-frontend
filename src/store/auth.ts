import type { Student } from '../services/students';

// 현재 로그인한 학생 정보 저장
export let currentStudent: Student | null = null;
let authToken: string | null = null;

export function setCurrentStudent(student: Student | null, token?: string) {
  currentStudent = student;
  if (token !== undefined) authToken = token;
}

export function getCurrentStudent(): Student | null {
  return currentStudent;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearCurrentStudent() {
  currentStudent = null;
  authToken = null;
}

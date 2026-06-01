export type StudentInfo = {
  id: number;
  username: string;
  login_id: string;
  grade: number;
  class_no: number;
  school_number: number;
};

// 현재 로그인한 학생 정보 저장
export let currentStudent: StudentInfo | null = null;

export function setCurrentStudent(student: StudentInfo | null) {
  currentStudent = student;
}

export function getCurrentStudent(): StudentInfo | null {
  return currentStudent;
}

export function clearCurrentStudent() {
  currentStudent = null;
}

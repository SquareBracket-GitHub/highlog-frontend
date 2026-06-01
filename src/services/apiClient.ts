import { apiFetch } from '../utils/api';

// ============ 학생 관련 API ============

/**
 * 모든 학생 조회
 */
export async function getStudents() {
  return apiFetch('/students', { method: 'GET' });
}

/**
 * 특정 학생 조회
 */
export async function getStudent(studentId: number) {
  return apiFetch(`/students/${studentId}`, { method: 'GET' });
}

/**
 * 학생 생성 (회원가입)
 */
export async function createStudent(data: {
  username: string;
  login_id: string;
  password: string;
  grade: number;
  class_no: number;
  school_number: number;
}) {
  return apiFetch('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 학생 정보 수정
 */
export async function updateStudent(
  studentId: number,
  data: {
    username?: string;
    login_id?: string;
    password?: string;
    grade?: number;
    class_no?: number;
    school_number?: number;
  }
) {
  return apiFetch(`/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 학생 삭제
 */
export async function deleteStudent(studentId: number) {
  return apiFetch(`/students/${studentId}`, { method: 'DELETE' });
}

/**
 * 로그인: login_id와 password로 학생 조회
 * 주의: 백엔드에 /auth/login 엔드포인트가 없으므로
 * 이 함수는 모든 학생을 조회한 후 클라이언트에서 필터링합니다.
 */
export async function loginStudent(loginId: string, password: string) {
  const response = await getStudents();
  const student = response.data?.find(
    (s: any) => s.login_id === loginId && s.password === password
  );
  
  if (!student) {
    throw { status: 401, data: { message: '아이디 또는 비밀번호가 올바르지 않습니다.' } };
  }
  
  return { result: 'SUCCESS', data: student };
}

// ============ 과목 관련 API ============

/**
 * 모든 과목 조회
 */
export async function getCourses() {
  return apiFetch('/courses', { method: 'GET' });
}

/**
 * 특정 과목 조회
 */
export async function getCourse(courseId: number) {
  return apiFetch(`/courses/${courseId}`, { method: 'GET' });
}

/**
 * 과목 생성
 */
export async function createCourse(data: {
  title: string;
  classroom: string;
  days: Array<{ day: string; period: number }>;
}) {
  return apiFetch('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 과목 정보 수정
 */
export async function updateCourse(
  courseId: number,
  data: {
    title?: string;
    classroom?: string;
    days?: Array<{ day: string; period: number }>;
  }
) {
  return apiFetch(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 과목 삭제
 */
export async function deleteCourse(courseId: number) {
  return apiFetch(`/courses/${courseId}`, { method: 'DELETE' });
}

// ============ 선택 과목 (수강신청) 관련 API ============

/**
 * 모든 수강신청 조회
 */
export async function getEnrolments() {
  return apiFetch('/enrolments', { method: 'GET' });
}

/**
 * 특정 학생의 수강신청 조회
 */
export async function getEnrolmentsByStudent(studentId: number) {
  return apiFetch(`/enrolments/student/${studentId}`, { method: 'GET' });
}

/**
 * 특정 과목의 수강신청 조회
 */
export async function getEnrolmentsByCourse(courseId: number) {
  return apiFetch(`/enrolments/course/${courseId}`, { method: 'GET' });
}

/**
 * 수강신청 생성
 */
export async function createEnrolment(data: {
  student_id: number;
  course_id: number;
}) {
  return apiFetch('/enrolments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 수강신청 수정
 */
export async function updateEnrolment(
  studentId: number,
  courseId: number,
  newData: {
    student_id: number;
    course_id: number;
  }
) {
  return apiFetch(`/enrolments/student/${studentId}/course/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(newData),
  });
}

/**
 * 특정 학생의 모든 수강신청 삭제
 */
export async function deleteEnrolmentsByStudent(studentId: number) {
  return apiFetch(`/enrolments/student/${studentId}`, {
    method: 'DELETE',
  });
}

/**
 * 특정 과목의 모든 수강신청 삭제
 */
export async function deleteEnrolmentsByCourse(courseId: number) {
  return apiFetch(`/enrolments/course/${courseId}`, {
    method: 'DELETE',
  });
}

/**
 * 특정 수강신청 삭제
 */
export async function deleteEnrolment(studentId: number, courseId: number) {
  return apiFetch(`/enrolments/student/${studentId}/course/${courseId}`, {
    method: 'DELETE',
  });
}

// ============ 시간표 생성 유틸리티 ============

/**
 * 학생의 선택 과목으로 시간표 생성
 */
export async function generateStudentSchedule(studentId: number) {
  // 1. 학생의 수강신청 조회
  const enrolmentsRes = await getEnrolmentsByStudent(studentId);
  const enrolments = enrolmentsRes.data || [];
  
  // 2. 모든 과목 조회
  const coursesRes = await getCourses();
  const allCourses = coursesRes.data || [];
  
  // 3. 시간표 생성
  // 7교시 x 5일(월~금) 시간표 초기화
  const timetable: string[][] = Array(7)
    .fill(null)
    .map(() => Array(5).fill(''));
  
  // 4. 수강신청한 과목들을 시간표에 배치
  enrolments.forEach((enrolment: any) => {
    const course = allCourses.find((c: any) => c.id === enrolment.course_id);
    if (!course) return;
    
    const days = JSON.parse(course.days);
    days.forEach((schedule: any) => {
      const dayIndex = getDayIndex(schedule.day);
      const periodIndex = schedule.period - 1; // 0-indexed
      
      if (dayIndex >= 0 && periodIndex >= 0 && periodIndex < 7) {
        timetable[periodIndex][dayIndex] = course.title;
      }
    });
  });
  
  return timetable;
}

/**
 * 요일명을 인덱스로 변환
 */
function getDayIndex(day: string): number {
  const dayMap: { [key: string]: number } = {
    '월요일': 0,
    '월': 0,
    '화요일': 1,
    '화': 1,
    '수요일': 2,
    '수': 2,
    '목요일': 3,
    '목': 3,
    '금요일': 4,
    '금': 4,
  };
  return dayMap[day] ?? -1;
}

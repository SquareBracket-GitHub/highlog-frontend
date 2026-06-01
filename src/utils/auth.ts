import AsyncStorage from '@react-native-async-storage/async-storage';

const STUDENT_ID_KEY = 'student_id';
const STUDENT_INFO_KEY = 'student_info';

export interface StudentInfo {
  id: number;
  username: string;
  login_id: string;
  grade: number;
  class_no: number;
  school_number: number;
}

/**
 * 학생 정보 저장
 */
export async function saveStudentInfo(studentInfo: StudentInfo) {
  try {
    await AsyncStorage.setItem(STUDENT_ID_KEY, String(studentInfo.id));
    await AsyncStorage.setItem(STUDENT_INFO_KEY, JSON.stringify(studentInfo));
  } catch (error) {
    console.error('Failed to save student info:', error);
  }
}

/**
 * 저장된 학생 정보 조회
 */
export async function getStudentInfo(): Promise<StudentInfo | null> {
  try {
    const data = await AsyncStorage.getItem(STUDENT_INFO_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get student info:', error);
    return null;
  }
}

/**
 * 저장된 학생 ID 조회
 */
export async function getStudentId(): Promise<number | null> {
  try {
    const id = await AsyncStorage.getItem(STUDENT_ID_KEY);
    return id ? parseInt(id, 10) : null;
  } catch (error) {
    console.error('Failed to get student ID:', error);
    return null;
  }
}

/**
 * 로그아웃 - 저장된 정보 삭제
 */
export async function logout() {
  try {
    await AsyncStorage.removeItem(STUDENT_ID_KEY);
    await AsyncStorage.removeItem(STUDENT_INFO_KEY);
  } catch (error) {
    console.error('Failed to logout:', error);
  }
}

/**
 * 로그인 여부 확인
 */
export async function isLoggedIn(): Promise<boolean> {
  try {
    const id = await AsyncStorage.getItem(STUDENT_ID_KEY);
    return id !== null;
  } catch (error) {
    console.error('Failed to check login status:', error);
    return false;
  }
}

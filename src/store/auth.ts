import * as SecureStore from 'expo-secure-store';

import type { Student } from '../services/students';

const SESSION_KEY = 'highlog.session';
export let currentStudent: Student | null = null;
let authToken: string | null = null;

async function persistSession() {
  if (!currentStudent || !authToken) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ student: currentStudent, token: authToken }));
}

export function setCurrentStudent(student: Student | null, token?: string) {
  currentStudent = student;
  if (token !== undefined) authToken = token;
  void persistSession();
}

export async function restoreSession(): Promise<boolean> {
  try {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    if (!stored) return false;
    const session = JSON.parse(stored) as { student?: Student; token?: string };
    if (!session.student || !session.token) return false;
    currentStudent = session.student;
    authToken = session.token;
    return true;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return false;
  }
}

export function getCurrentStudent() { return currentStudent; }
export function getAuthToken() { return authToken; }

export function clearCurrentStudent() {
  currentStudent = null;
  authToken = null;
  void SecureStore.deleteItemAsync(SESSION_KEY);
}

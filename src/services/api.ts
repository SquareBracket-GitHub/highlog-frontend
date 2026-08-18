import { router } from 'expo-router';

import { clearCurrentStudent, getAuthToken } from '../store/auth';

// API 기본 설정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  result: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
    public readonly issues: { path?: PropertyKey[]; message?: string }[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return '알 수 없는 오류가 발생했습니다.';
  if (error.code === 'NETWORK_ERROR') return '네트워크 연결을 확인한 후 다시 시도하세요.';
  if (error.code === 'TIMEOUT') return '요청 시간이 초과되었습니다. 다시 시도하세요.';
  if (error.status >= 500) return '서버에 문제가 발생했습니다. 잠시 후 다시 시도하세요.';
  return error.message;
}

export class ApiClient {
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'AbortError';
      throw new ApiError(0, timedOut ? 'TIMEOUT' : 'NETWORK_ERROR', timedOut ? 'Request timed out' : 'Network request failed');
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 && token) {
      clearCurrentStudent();
      router.replace('/login');
      throw new ApiError(401, 'SESSION_EXPIRED', '로그인이 만료되었습니다. 다시 로그인하세요.');
    }

    if (!response.ok) {
      const text = await response.text();
      let code: string | undefined;
      let message = text || response.statusText;
      let issues: { path?: PropertyKey[]; message?: string }[] = [];

      try {
        const errorBody = JSON.parse(text);
        code = errorBody.code;
        if (Array.isArray(errorBody.error)) {
          issues = errorBody.error;
          message = '입력값을 확인하세요.';
        } else {
          message = errorBody.error || message;
        }
      } catch {
        // JSON이 아닌 오류 응답은 원문을 유지합니다.
      }

      throw new ApiError(response.status, code, message, issues);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  static get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

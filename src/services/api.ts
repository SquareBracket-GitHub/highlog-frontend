import { getAuthToken } from '../store/auth';

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

export class ApiClient {
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

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

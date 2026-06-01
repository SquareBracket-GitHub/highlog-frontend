import { API_BASE_URL } from '../config/api';

type FetchOptions = RequestInit & { params?: Record<string, any> };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const init: RequestInit = {
    ...options,
    headers
  };

  const res = await fetch(url, init);
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, data };
    return data;
  } catch (e) {
    if (e instanceof SyntaxError) {
      if (!res.ok) throw { status: res.status, data: text };
      return text;
    }
    throw e;
  }
}

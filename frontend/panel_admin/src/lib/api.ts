import { ADMIN_CONFIG, AUTH_TOKEN_STORAGE_KEY } from '@/config/site';

interface ApiErrorPayload {
  detail?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!ADMIN_CONFIG.apiUrl) throw new Error('VITE_API_URL no está configurada.');
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${ADMIN_CONFIG.apiUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload.detail) message = payload.detail;
    } catch {
      // La respuesta no contiene JSON.
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

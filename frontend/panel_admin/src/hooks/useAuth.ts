import { useCallback, useState } from 'react';
import { ADMIN_CONFIG, AUTH_SESSION_STORAGE_KEY, AUTH_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/config/site';
import type { AdminSection, UsuarioRol } from '@/types';

export interface LoginCredentials {
  email: string;
  usuario: string;
  password: string;
  remember: boolean;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export interface AuthSession {
  id: string;
  email: string;
  usuario: string;
  nombre: string;
  rol: UsuarioRol;
  telefono: string;
  modulos: AdminSection[];
  superAdmin: boolean;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthSession;
}

const EMPTY_SESSION: AuthSession = {
  id: '',
  email: '',
  usuario: '',
  nombre: '',
  rol: 'Administrador',
  telefono: '',
  modulos: [],
  superAdmin: false,
};

function readSession(): AuthSession {
  try {
    const stored = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthSession) : EMPTY_SESSION;
  } catch {
    return EMPTY_SESSION;
  }
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession>(readSession);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(readSession().id && window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)),
  );

  const authenticate = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    const { email, usuario, password, remember } = credentials;
    if (!email.trim() || !usuario.trim() || !password) {
      return { ok: false, error: 'Todos los campos son obligatorios.' };
    }
    if (!ADMIN_CONFIG.apiUrl) {
      return { ok: false, error: 'La URL del backend no está configurada (VITE_API_URL).' };
    }

    try {
      const response = await fetch(`${ADMIN_CONFIG.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), usuario: usuario.trim(), password }),
      });
      const payload = (await response.json()) as AuthResponse & { detail?: string };
      if (!response.ok) return { ok: false, error: payload.detail ?? 'Credenciales inválidas.' };

      setSession(payload.user);
      setIsAuthenticated(true);
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(payload.user));
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, payload.accessToken);
      if (remember) window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);
      else window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      return { ok: true };
    } catch {
      return { ok: false, error: 'No se pudo conectar con el servidor. Verifica que la API esté disponible.' };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setSession(EMPTY_SESSION);
    for (const key of [AUTH_STORAGE_KEY, AUTH_SESSION_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY]) {
      window.localStorage.removeItem(key);
    }
  }, []);

  return { isAuthenticated, session, authenticate, logout };
}

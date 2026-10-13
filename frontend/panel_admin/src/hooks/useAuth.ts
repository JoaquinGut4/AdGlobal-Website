import { useCallback, useState } from 'react';
import { AUTH_STORAGE_KEY } from '@/config/site';

/** Credenciales de demostración (se reemplazarán por autenticación JWT del backend). */
export const CREDENCIALES_DEMO = {
  email: 'admin@adglobalperu.com',
  usuario: 'adglobal_admin',
  password: 'admin2025',
} as const;

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
  email: string;
  usuario: string;
}

const AUTH_DELAY_MS = 600;

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [session, setSession] = useState<AuthSession>({
    email: CREDENCIALES_DEMO.email,
    usuario: CREDENCIALES_DEMO.usuario,
  });

  const authenticate = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    const { email, usuario, password, remember } = credentials;

    if (!email.trim() || !usuario.trim() || !password.trim()) {
      return {
        ok: false,
        error: 'Todos los campos son obligatorios: Email corporativo, Usuario y Contraseña.',
      };
    }

    if (!email.includes('@') || !email.includes('.')) {
      return {
        ok: false,
        error: 'Por favor ingrese un email corporativo válido (ej. admin@adglobalperu.com).',
      };
    }

    // Simula la validación contra el backend.
    await new Promise((resolve) => setTimeout(resolve, AUTH_DELAY_MS));

    if (password.length < 4) {
      return { ok: false, error: `Credenciales inválidas. (Demo: ${CREDENCIALES_DEMO.password})` };
    }

    setSession({ email: email.trim(), usuario: usuario.trim() });
    setIsAuthenticated(true);

    try {
      if (remember) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      /* Almacenamiento no disponible */
    }

    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* Almacenamiento no disponible */
    }
  }, []);

  return { isAuthenticated, session, authenticate, logout };
}

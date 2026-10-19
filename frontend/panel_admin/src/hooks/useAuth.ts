import { useCallback, useState } from 'react';
import { AUTH_SESSION_STORAGE_KEY, AUTH_STORAGE_KEY, STORAGE_KEYS } from '@/config/site';
import { NAV_ITEMS } from '@/config/navigation';
import type { AdminSection, UsuarioAdministrador } from '@/types';

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
  nombre: string;
  modulos: AdminSection[];
  superAdmin: boolean;
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

  const [session, setSession] = useState<AuthSession>(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as AuthSession;
    } catch {
      /* Sesión persistida no disponible */
    }
    return {
      email: CREDENCIALES_DEMO.email,
      usuario: CREDENCIALES_DEMO.usuario,
      nombre: 'Administrador principal',
      modulos: NAV_ITEMS.map((item) => item.id),
      superAdmin: true,
    };
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

    let nextSession: AuthSession | null = null;
    if (
      email.trim().toLowerCase() === CREDENCIALES_DEMO.email.toLowerCase() &&
      usuario.trim().toLowerCase() === CREDENCIALES_DEMO.usuario.toLowerCase() &&
      password === CREDENCIALES_DEMO.password
    ) {
      nextSession = {
        email: CREDENCIALES_DEMO.email,
        usuario: CREDENCIALES_DEMO.usuario,
        nombre: 'Administrador principal',
        modulos: NAV_ITEMS.map((item) => item.id),
        superAdmin: true,
      };
    } else {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.usuarios);
        const users = raw ? (JSON.parse(raw) as UsuarioAdministrador[]) : [];
        const account = users.find(
          (item) =>
            item.email.toLowerCase() === email.trim().toLowerCase() &&
            item.usuario.toLowerCase() === usuario.trim().toLowerCase() &&
            item.password === password,
        );
        if (account?.activo) {
          nextSession = {
            email: account.email,
            usuario: account.usuario,
            nombre: account.nombre,
            modulos: account.modulos,
            superAdmin: false,
          };
        } else if (account && !account.activo) {
          return { ok: false, error: 'Esta cuenta se encuentra desactivada.' };
        }
      } catch {
        nextSession = null;
      }
    }

    if (!nextSession) {
      return { ok: false, error: `Credenciales inválidas. (Demo: ${CREDENCIALES_DEMO.password})` };
    }

    setSession(nextSession);
    setIsAuthenticated(true);

    try {
      if (remember) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
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
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
      /* Almacenamiento no disponible */
    }
  }, []);

  return { isAuthenticated, session, authenticate, logout };
}

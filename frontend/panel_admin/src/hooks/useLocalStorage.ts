import { useEffect, useState } from 'react';

/**
 * Estado persistido en localStorage.
 * Si el valor guardado no existe o está corrupto, se usa `initialValue`.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Almacenamiento no disponible (modo privado, cuota, etc.) */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

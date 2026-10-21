import { useEffect, useState } from 'react';

let storageWarningEmitted = false;

/**
 * Estado persistido en localStorage.
 * Si el valor guardado no existe o está corrupto, se usa `initialValue`.
 * `enabled` permite no escribir en disco mientras no hay una sesión iniciada.
 */
export function useLocalStorage<T>(key: string, initialValue: T, enabled = true) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!enabled) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Almacenamiento no disponible (modo privado, cuota, etc.). */
      if (!storageWarningEmitted) {
        storageWarningEmitted = true;
        window.dispatchEvent(new Event('adglobal:storage-error'));
      }
    }
  }, [enabled, key, value]);

  return [value, setValue] as const;
}

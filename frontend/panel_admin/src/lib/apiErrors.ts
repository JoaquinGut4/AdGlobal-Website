interface ApiErrorDetail {
  msg?: string;
  loc?: Array<string | number>;
}

interface ApiErrorPayload {
  detail?: string | ApiErrorDetail[];
}

/** Convierte cualquier `detail` del backend (texto o lista de Pydantic) en un mensaje legible. */
export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) return fallback;
  const detail = (payload as ApiErrorPayload).detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (!Array.isArray(detail)) return fallback;

  const messages = detail
    .map((item) => {
      if (typeof item !== 'object' || item === null) return '';
      const message = typeof item.msg === 'string' ? item.msg.trim() : '';
      if (!message) return '';
      const location = Array.isArray(item.loc)
        ? item.loc.filter((part) => part !== 'body').join('.')
        : '';
      return location ? `${location}: ${message}` : message;
    })
    .filter(Boolean);

  return messages.length > 0 ? messages.join(' ') : fallback;
}

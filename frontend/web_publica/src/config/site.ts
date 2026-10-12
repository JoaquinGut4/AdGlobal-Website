/**
 * Configuración central del sitio público.
 * Los valores se leen de variables de entorno (Vite) con fallbacks seguros.
 * Todas las variables deben empezar con VITE_ para estar disponibles en el cliente.
 */

export const SITE = {
  name: 'AD GLOBAL',
  url: import.meta.env.VITE_SITE_URL ?? 'https://adglobalperu.com',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '51908838291',
  phoneDisplay: import.meta.env.VITE_CONTACT_PHONE_DISPLAY ?? '+51 908 838 291',
  email: import.meta.env.VITE_CONTACT_EMAIL ?? 'atencionalcliente@adglobalperu.com',
  /** URL base del backend (fase 2). Vacío = no se usa todavía. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
} as const;

/**
 * Resuelve la ruta de un recurso estático del directorio `public/`.
 * Respeta el `base` configurado en Vite para funcionar en subdirectorios.
 */
export const asset = (path: string): string => {
  const base = import.meta.env.BASE_URL || './';
  const clean = path.replace(/^\/+/, '');
  return `${base}${clean}`.replace(/([^:]\/)\/+/, '$1');
};

/** Construye un enlace de WhatsApp con un mensaje pre-cargado. */
export const whatsappLink = (message: string, phone: string = SITE.whatsappNumber): string => {
  // WhatsApp requiere SOLO dígitos con código de país: sin "+", espacios ni guiones.
  const onlyDigits = phone.replace(/\D+/g, '');
  return `https://wa.me/${onlyDigits}?text=${encodeURIComponent(message)}`;
};

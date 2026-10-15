/**
 * Configuración central del panel administrativo.
 * Los valores se leen de variables de entorno (Vite) con fallbacks seguros.
 * Todas las variables deben empezar con VITE_ para estar disponibles en el cliente.
 */

export const ADMIN_CONFIG = {
  name: import.meta.env.VITE_ADMIN_NAME ?? 'AD GLOBAL PERÚ',
  /** URL de la web pública (botón "Volver a la web"). */
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL ?? 'https://adglobalperu.com',
  /** URL base del backend (fase 2). Vacío = se usan datos locales. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  maxAuthAttempts: Number(import.meta.env.VITE_AUTH_MAX_ATTEMPTS ?? '5'),
} as const;

/** Clave de persistencia de la sesión administrativa. */
export const AUTH_STORAGE_KEY = 'adglobal_admin_auth';

/** Claves de persistencia de datos operativos. */
export const STORAGE_KEYS = {
  cotizaciones: 'adglobal_quotes',
  tickets: 'adglobal_tickets',
  inventario: 'adglobal_inventory',
  inventarioCategorias: 'adglobal_inventory_categories',
} as const;

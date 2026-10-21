/**
 * Configuración central del panel administrativo.
 * Los valores se leen de variables de entorno (Vite) con fallbacks seguros.
 * Todas las variables deben empezar con VITE_ para estar disponibles en el cliente.
 */

export const ADMIN_CONFIG = {
  name: import.meta.env.VITE_ADMIN_NAME ?? 'AD GLOBAL PERÚ',
  /** URL de la web pública (botón "Volver a la web"). */
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL ?? 'https://adglobalperu.com',
  /** URL base versionada del backend. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
} as const;

/** Clave de persistencia de la sesión administrativa. */
export const AUTH_STORAGE_KEY = 'adglobal_admin_auth';
export const AUTH_SESSION_STORAGE_KEY = 'adglobal_admin_session';
export const AUTH_TOKEN_STORAGE_KEY = 'adglobal_admin_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'adglobal_admin_refresh_token';

/** Claves de persistencia de datos operativos. */
export const STORAGE_KEYS = {
  tickets: 'adglobal_tickets_v2',
  inventario: 'adglobal_inventory_v2',
  inventarioCategorias: 'adglobal_inventory_categories',
  inventarioEstados: 'adglobal_inventory_statuses',
  inventarioEstadosV2: 'adglobal_inventory_states_v2',
  pedidos: 'adglobal_orders_v8',
  movimientos: 'adglobal_movements',
} as const;

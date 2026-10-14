/**
 * Logos reales de clientes entregados por la empresa.
 * Se detectan solos desde `src/assets/servicios/Logo empresas clientes/`.
 * El orden es alfabético natural (1, 2, 3 … 25).
 */
const LOGO_MODULES = import.meta.glob(
  '../assets/servicios/Logo empresas clientes/*.{svg,png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>;

export const CLIENT_LOGOS: string[] = Object.entries(LOGO_MODULES)
  .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }))
  .map(([, url]) => url);

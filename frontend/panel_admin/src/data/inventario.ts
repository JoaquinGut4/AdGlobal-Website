import type { InventarioRegistro } from '@/types';

/**
 * Inventario operativo.
 * Se deja vacío para iniciar el módulo sin equipos de demostración.
 * Las categorías base siguen disponibles para registrar activos reales.
 */
export const INVENTARIO_REGISTROS: InventarioRegistro[] = [];

/** Cantidad de categorías base definidas en el módulo de inventario. */
export const CATEGORIAS_BASE_TOTAL = 7;

/** Estados iniciales disponibles para los activos. */
export const ESTADOS_INVENTARIO_BASE = [
  'Almacén 1',
  'Oficina',
  'Alquiler',
  'Reparación',
  'Taller',
  'Mantenimiento',
  'Venta',
];

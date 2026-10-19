import type { InventarioItem, InventarioRegistro } from '@/types';

/**
 * Datos operativos del inventario.
 * Se dejan vacíos para iniciar el módulo sin equipos de demostración.
 * Las categorías base siguen disponibles para registrar activos reales.
 */
export const INVENTARIO_DATA: InventarioItem[] = [];
export const INVENTARIO_REGISTROS: InventarioRegistro[] = [];

/** Cantidad de categorías base definidas en el módulo de inventario. */
export const CATEGORIAS_BASE_TOTAL = 7;

/** Totales de flota calculados a partir del inventario (fuente única de verdad). */
export const FLOTA_RESUMEN = INVENTARIO_DATA.reduce(
  (acc, item) => ({
    total: acc.total + item.total,
    alquiler: acc.alquiler + item.alquiler,
    oficina: acc.oficina + item.oficina,
    taller: acc.taller + item.taller,
  }),
  { total: 0, alquiler: 0, oficina: 0, taller: 0 }
);

export const porcentajeFlota = (valor: number): number =>
  FLOTA_RESUMEN.total === 0 ? 0 : (valor / FLOTA_RESUMEN.total) * 100;

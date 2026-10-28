import type { InventarioRegistro } from '@/types';

export interface FlotaResumen {
  total: number;
  alquiler: number;
  oficina: number;
  taller: number;
}

function normalizarEstado(estado: string): string {
  return estado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Agrupa los activos del inventario en la distribución operativa de la flota.
 * Se usan las mismas reglas que los filtros del módulo de inventario:
 * - Alquiler: estado que contiene "alquiler".
 * - Oficina: ubicación en cualquiera de los almacenes.
 * - Taller: ubicación Taller o estado técnico.
 * Los estados fuera de la flota operativa (por ejemplo "Venta") no suman al total.
 */
export function resumirFlota(registros: InventarioRegistro[]): FlotaResumen {
  const resumen: FlotaResumen = { total: 0, alquiler: 0, oficina: 0, taller: 0 };

  for (const registro of registros) {
    const estado = normalizarEstado(registro.estado ?? '');
    const ubicacion = normalizarEstado(registro.ubicacion ?? '');
    if (estado.includes('alquiler')) {
      resumen.alquiler += 1;
    } else if (
      ubicacion.includes('taller') ||
      estado.includes('taller') ||
      estado.includes('diagnostico') ||
      estado.includes('reemplazo') ||
      estado.includes('reparacion') ||
      estado.includes('mantenimiento')
    ) {
      resumen.taller += 1;
    } else if (
      ubicacion.includes('almacen') ||
      estado.includes('oficina') ||
      estado.includes('almacen')
    ) {
      resumen.oficina += 1;
    }
  }

  resumen.total = resumen.alquiler + resumen.oficina + resumen.taller;
  return resumen;
}

/** Porcentaje de una categoría sobre el total de la flota. */
export function porcentajeFlota(valor: number, total: number): number {
  return total === 0 ? 0 : (valor / total) * 100;
}

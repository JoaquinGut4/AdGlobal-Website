import type { MovimientoAuditoria } from '@/types';

/** Fecha de calendario local, igual a la mostrada en el historial. */
export function diaLocal(fecha: string): string | null {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Día de calendario local actual en formato YYYY-MM-DD; cadena vacía si el reloj no es válido. */
export function hoyLocal(): string {
  return diaLocal(new Date().toISOString()) ?? '';
}

/** Consulta inclusiva por fecha, ordenada de más reciente a más antigua. */
export function movimientosPorFecha(
  movimientos: MovimientoAuditoria[],
  desde: string,
  hasta: string,
): MovimientoAuditoria[] {
  if (desde && hasta && desde > hasta) return [];
  return movimientos
    .filter((movimiento) => {
      if (!desde && !hasta) return true;
      const dia = diaLocal(movimiento.fecha);
      return dia !== null && (!desde || dia >= desde) && (!hasta || dia <= hasta);
    })
    .sort((a, b) => {
      const aTime = new Date(a.fecha).getTime();
      const bTime = new Date(b.fecha).getTime();
      return (Number.isNaN(bTime) ? -Infinity : bTime) - (Number.isNaN(aTime) ? -Infinity : aTime);
    });
}

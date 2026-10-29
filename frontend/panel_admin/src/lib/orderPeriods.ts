import type { PedidoRegistro } from '@/types';

/** Un pedido sigue vigente hasta que se cierra o anula. */
export function esPedidoActivo(pedido: PedidoRegistro): boolean {
  if (pedido.estadoPedido === 'Finalizado') return false;
  return !['Cerrado', 'Anulado'].includes(pedido.estadoFlujo ?? 'Borrador');
}

/** Fecha local a partir de un ISO YYYY-MM-DD, sin desfase de zona horaria. */
export function fechaLocal(value?: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Período operativo del pedido: inicia con la entrega y termina con la fecha
 * de fin del alquiler. Si no hay fin, se considera un solo día.
 */
export function rangoPedido(pedido: PedidoRegistro): { inicio: Date; fin: Date } | null {
  const inicio = fechaLocal(pedido.fechaInicio || pedido.fechaEntrega || pedido.fechaEmision);
  if (!inicio) return null;
  const fin = fechaLocal(pedido.fechaFin) ?? inicio;
  return fin < inicio ? { inicio, fin: inicio } : { inicio, fin };
}

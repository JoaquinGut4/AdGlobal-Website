import type { SupportTicket } from '@/types';

/** Flujo de etapas de un ticket de soporte. */
export const TICKET_ESTADOS: SupportTicket['estado'][] = [
  'Abierto',
  'En Diagnóstico',
  'En Reparación',
  'Resuelto',
];

/** Devuelve la siguiente etapa del ticket (ciclo). */
export const siguienteEstadoTicket = (estado: SupportTicket['estado']): SupportTicket['estado'] => {
  const index = TICKET_ESTADOS.indexOf(estado);
  return TICKET_ESTADOS[(index + 1) % TICKET_ESTADOS.length];
};

/** Próximo código de ticket consecutivo. */
export const siguienteCodigoTicket = (total: number): string =>
  `TKT-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`;

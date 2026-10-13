import type { SupportTicket } from '@/types';

/** Tickets de soporte de ejemplo (semilla). */
export const TICKETS_SEED: SupportTicket[] = [
  {
    id: 'tkt-01',
    codigo: 'TKT-2025-014',
    area: 'Reparación Taller',
    equipo: 'Laptop ThinkPad T14 (Serie: TP-2024-883)',
    cliente: 'Banco de Crédito BCP',
    prioridad: 'Alta',
    estado: 'En Diagnóstico',
    descripcion:
      'Falla en conector USB-C Thunderbolt tras evento en auditorio. Requiere prueba de placa y cambio de módulo.',
    tecnico: 'Ing. Carlos Mendoza (Taller Central)',
    fecha: 'Hoy, 10:15 AM',
  },
  {
    id: 'tkt-02',
    codigo: 'TKT-2025-015',
    area: 'Soporte In-Situ',
    equipo: 'Pantalla LED P2.6 Módulo C3',
    cliente: 'Corporación Minera del Sur',
    prioridad: 'Urgente',
    estado: 'Abierto',
    descripcion:
      'Píxel muerto en módulo central C3 para convención minera. Despacho de técnico con repuesto de recambio express.',
    tecnico: 'Téc. Miguel Alva (Soporte Campo)',
    fecha: 'Hoy, 09:30 AM',
  },
  {
    id: 'tkt-03',
    codigo: 'TKT-2025-016',
    area: 'Mantenimiento Preventivo',
    equipo: 'Sistema Line Array RCF (2 Subwoofers)',
    cliente: 'Productora Live Events SAC',
    prioridad: 'Media',
    estado: 'En Reparación',
    descripcion: 'Calibración acústica de crossovers y limpieza de filtros tras festival.',
    tecnico: 'Téc. Fernando Ruiz (Audio LAB)',
    fecha: 'Ayer, 16:45 PM',
  },
];

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
  `TKT-2025-${String(total + 15).padStart(3, '0')}`;

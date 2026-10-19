import type { MovimientoAuditoria } from '@/types';

export const MOVIMIENTOS_SEED: MovimientoAuditoria[] = [
  {
    id: 'mov-demo-001',
    fecha: '2026-10-19T09:30:00.000Z',
    usuario: 'adglobal_admin',
    modulo: 'Pedidos',
    accion: 'Creó',
    elemento: 'PED-2026-006',
    detalle: 'Aperturó un pedido para Inversiones Hoteleras SAC.',
  },
  {
    id: 'mov-demo-002',
    fecha: '2026-10-19T09:10:00.000Z',
    usuario: 'adglobal_admin',
    modulo: 'Inventario',
    accion: 'Modificó',
    elemento: 'LAP-0002',
    detalle: 'Actualizó la ficha del producto Lenovo ThinkPad T14 Gen 2.',
  },
  {
    id: 'mov-demo-003',
    fecha: '2026-10-19T08:45:00.000Z',
    usuario: 'adglobal_admin',
    modulo: 'Tickets',
    accion: 'Creó',
    elemento: 'TKT-003',
    detalle: 'Creó un ticket de soporte para Reparación Taller.',
  },
];

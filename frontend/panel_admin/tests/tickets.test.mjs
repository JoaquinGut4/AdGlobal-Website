import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeServerTickets, toSupportTicket } from '../src/lib/tickets.ts';

const formatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const row = {
  id: 't1',
  codigo: 'TKT-2026-001',
  area: null,
  equipo: 'LAP-0001 — Laptop',
  cliente: 'Empresa Prueba',
  prioridad: 'Alta',
  estado: 'Abierto',
  descripcion: 'No enciende',
  numeroPedidoEstado: 'PED-2026-001',
  tipoTicket: 'pedido',
  numeroPedido: 'PED-2026-001',
  telefonoContacto: '999888777',
  direccionPedido: 'Av. Principal 123',
  estadoEquipo: '',
  tecnico: 'Soporte de Prueba',
  tecnicoTelefono: '988777666',
  fecha: '2026-10-21T15:00:00+00:00',
};

test('convierte la respuesta del servidor y conserva el vínculo local', () => {
  const ticket = toSupportTicket(row, {
    equiposIds: ['asset-1'],
    estadosAnteriores: { 'asset-1': 'Almacén 1' },
  });

  assert.equal(ticket.fecha, formatter.format(new Date(row.fecha)));
  assert.deepEqual(ticket.equiposIds, ['asset-1']);
  assert.deepEqual(ticket.estadosAnteriores, { 'asset-1': 'Almacén 1' });
  assert.equal(ticket.tipoTicket, 'pedido');
  assert.equal(ticket.area, undefined);
});

test('el servidor manda en los datos y se conserva el vínculo local por id', () => {
  const local = toSupportTicket(row);
  const merged = mergeServerTickets(
    [{ ...row, estado: 'Resuelto' }],
    [{ ...local, estadosAnteriores: { 'asset-1': 'Taller' } }],
    new Set(['t1']),
  );

  assert.equal(merged.length, 1);
  assert.equal(merged[0].estado, 'Resuelto');
  assert.deepEqual(merged[0].estadosAnteriores, { 'asset-1': 'Taller' });
});

test('mantiene un ticket creado mientras la lista estaba en vuelo', () => {
  const pending = toSupportTicket({ ...row, id: 't2', codigo: 'TKT-2026-002' });
  const merged = mergeServerTickets([row], [pending], new Set());

  assert.deepEqual(merged.map((ticket) => ticket.id), ['t2', 't1']);
});

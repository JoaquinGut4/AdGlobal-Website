import assert from 'node:assert/strict';
import { test } from 'node:test';
import { occupiedByTicket, rebaseTicketsAfterOrderRelease, restoreAssetsFromTicket, sendAssetsToWorkshop } from '../src/lib/ticketWorkflow.ts';

const inventory = [
  { id: 'lap', sku: 'LAP-0003', estado: 'Alquiler' },
  { id: 'tv', sku: 'TV-0002', estado: 'Almacén 1' },
  { id: 'other', sku: 'PC-0001', estado: 'Oficina' },
];

test('crear ticket mueve solo sus equipos a Taller y guarda los estados anteriores', () => {
  const result = sendAssetsToWorkshop(['lap', 'tv'], inventory);
  assert.deepEqual(result.inventory.map((asset) => asset.estado), ['Taller', 'Taller', 'Oficina']);
  assert.deepEqual(result.previousStates, { lap: 'Alquiler', tv: 'Almacén 1' });
  assert.equal(result.changed, 2);
  assert.equal(inventory[0].estado, 'Alquiler');
});

test('completar o eliminar ticket activo restaura, sin revertir cambios manuales ni dos veces', () => {
  const assigned = sendAssetsToWorkshop(['lap', 'tv'], inventory);
  const ticket = { estado: 'Abierto', equiposIds: ['lap', 'tv'], estadosAnteriores: assigned.previousStates };
  assert.deepEqual(restoreAssetsFromTicket(ticket, assigned.inventory).inventory, inventory);
  const changed = assigned.inventory.map((asset) => asset.id === 'tv' ? { ...asset, estado: 'Reparación' } : asset);
  const result = restoreAssetsFromTicket(ticket, changed);
  assert.equal(result.restored, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.inventory[1].estado, 'Reparación');
  assert.equal(restoreAssetsFromTicket({ ...ticket, estado: 'Resuelto' }, assigned.inventory).restored, 0);
});

test('un equipo con ticket activo no puede asignarse a otro ticket', () => {
  const ticket = { codigo: 'TKT-1', estado: 'Abierto', equiposIds: ['lap'] };
  assert.equal(occupiedByTicket(['lap'], [ticket]), ticket);
  assert.equal(occupiedByTicket(['tv'], [ticket]), undefined);
  assert.equal(occupiedByTicket(['lap'], [{ ...ticket, estado: 'Resuelto' }]), undefined);
});

test('finalizar alquiler mientras está en Taller cambia el estado al que regresará', () => {
  const order = { motivoTraslado: 'Alquiler', estadosAnteriores: { lap: 'Almacén 1' } };
  const ticket = { estado: 'Abierto', estadosAnteriores: { lap: 'Alquiler', tv: 'Almacén 1' } };
  const [rebased] = rebaseTicketsAfterOrderRelease(order, [ticket]);
  assert.deepEqual(rebased.estadosAnteriores, { lap: 'Almacén 1', tv: 'Almacén 1' });
  const workshop = sendAssetsToWorkshop(['lap'], inventory);
  assert.equal(restoreAssetsFromTicket(rebased, workshop.inventory).inventory[0].estado, 'Almacén 1');
});

test('eliminar una venta mientras el activo está en Taller restaura el estado pre-venta', () => {
  const order = { motivoTraslado: 'Venta', estadosAnteriores: { tv: 'Oficina' } };
  const ticket = { estado: 'Abierto', equiposIds: ['tv'], estadosAnteriores: { tv: 'Venta' } };
  const [rebased] = rebaseTicketsAfterOrderRelease(order, [ticket]);
  assert.deepEqual(rebased.estadosAnteriores, { tv: 'Oficina' });
  const result = restoreAssetsFromTicket(rebased, [{ id: 'tv', sku: 'TV-0002', estado: 'Taller' }]);
  assert.equal(result.inventory[0].estado, 'Oficina');
});

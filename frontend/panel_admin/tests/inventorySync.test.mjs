import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assetsForOrder, orderSkusFromDescription, restoreInventoryForOrder, syncInventoryForOrder } from '../src/lib/inventorySync.ts';

const inventory = [
  { id: '1', sku: 'LAP-0003', estado: 'Almacén 1' },
  { id: '2', sku: 'LAP-00030', estado: 'Oficina' },
  { id: '3', sku: 'TV-0001', estado: 'Almacén 1' },
];

test('calcula una unidad por SKU distinto, aunque se repita en la descripción', () => {
  assert.deepEqual(orderSkusFromDescription('LAP-0003 · Laptop', inventory), ['LAP-0003']);
  assert.deepEqual(
    orderSkusFromDescription('LAP-0003 · Laptop\nTV-0001 · TV\nLAP-0003', inventory),
    ['LAP-0003', 'TV-0001'],
  );
  assert.deepEqual(orderSkusFromDescription('LAP-00030', inventory), ['LAP-00030']);
});

test('el buscador del ticket por pedido no muestra activos de otros pedidos', () => {
  const order = { descripcionProductos: 'LAP-0003 · Laptop', skus: ['LAP-0003'] };
  assert.deepEqual(assetsForOrder(order, inventory).map((item) => item.sku), ['LAP-0003']);
  assert.deepEqual(assetsForOrder({ descripcionProductos: 'LAP-00030', skus: [] }, inventory).map((item) => item.sku), ['LAP-00030']);
});

test('alquilar actualiza solo el producto seleccionado', () => {
  const result = syncInventoryForOrder(
    { motivoTraslado: 'Alquiler', descripcionProductos: 'LAP-0003 · Laptop', skus: ['LAP-0003'] },
    inventory,
  );
  assert.deepEqual(result.inventory.map((item) => item.estado), ['Alquiler', 'Oficina', 'Almacén 1']);
  assert.equal(result.matched, 1);
  assert.equal(result.updated, 1);
  assert.equal(inventory[0].estado, 'Almacén 1');
});

test('ventas cambian el equipo a Venta, incluso con SKU escrito manualmente', () => {
  const result = syncInventoryForOrder(
    { motivoTraslado: 'Venta con entrega a terceros', descripcionProductos: 'TV-0001 · Televisor' },
    inventory,
  );
  assert.deepEqual(result.inventory.map((item) => item.estado), ['Almacén 1', 'Oficina', 'Venta']);
});

test('no confunde un SKU con el prefijo de otro', () => {
  const result = syncInventoryForOrder(
    { motivoTraslado: 'Alquiler', descripcionProductos: 'LAP-00030 · Laptop' },
    inventory,
  );
  assert.equal(result.matched, 1);
  assert.equal(result.inventory[0].estado, 'Almacén 1');
  assert.equal(result.inventory[1].estado, 'Alquiler');
});

test('un pedido sin equipos coincidentes no modifica inventario', () => {
  const result = syncInventoryForOrder(
    { motivoTraslado: 'Alquiler', descripcionProductos: 'SKU-INEXISTENTE' },
    inventory,
  );
  assert.equal(result.matched, 0);
  assert.equal(result.updated, 0);
  assert.deepEqual(result.inventory, inventory);
});

test('un pedido con varios SKU actualiza solo sus productos', () => {
  const result = syncInventoryForOrder(
    { motivoTraslado: 'Alquiler', descripcionProductos: 'LAP-0003 · Laptop\nTV-0001 · Televisor', skus: ['LAP-0003', 'TV-0001'] },
    inventory,
  );
  assert.equal(result.matched, 2);
  assert.equal(result.updated, 2);
  assert.deepEqual(result.inventory.map((item) => item.estado), ['Alquiler', 'Oficina', 'Alquiler']);
});

test('compra y devoluciones no cambian estados al crear el pedido', () => {
  for (const motivoTraslado of ['Compra', 'Devolución']) {
    const result = syncInventoryForOrder({ motivoTraslado, descripcionProductos: 'LAP-0003' }, inventory);
    assert.equal(result.targetState, null);
    assert.strictEqual(result.inventory, inventory);
  }
});

test('finalizar alquiler devuelve cada equipo a su estado inicial', () => {
  const order = { motivoTraslado: 'Alquiler', descripcionProductos: 'LAP-0003 y TV-0001' };
  const assigned = syncInventoryForOrder(order, inventory);
  const result = restoreInventoryForOrder(
    { ...order, estadosAnteriores: assigned.previousStates }, assigned.inventory, 'finish',
  );
  assert.equal(result.restored, 2);
  assert.deepEqual(result.inventory, inventory);
});

test('finalizar venta conserva Venta; eliminarla restaura su estado inicial', () => {
  const order = { motivoTraslado: 'Venta', descripcionProductos: 'TV-0001' };
  const assigned = syncInventoryForOrder(order, inventory);
  const saved = { ...order, estadosAnteriores: assigned.previousStates };
  const finished = restoreInventoryForOrder(saved, assigned.inventory, 'finish');
  assert.equal(finished.restored, 0);
  assert.equal(finished.inventory[2].estado, 'Venta');
  const deleted = restoreInventoryForOrder({ ...saved, estadoPedido: 'Finalizado' }, finished.inventory, 'delete');
  assert.equal(deleted.restored, 1);
  assert.deepEqual(deleted.inventory, inventory);
});

test('eliminar alquiler activo restaura estados y un alquiler finalizado no restaura dos veces', () => {
  const order = { motivoTraslado: 'Alquiler', descripcionProductos: 'LAP-0003' };
  const assigned = syncInventoryForOrder(order, inventory);
  const saved = { ...order, estadosAnteriores: assigned.previousStates };
  assert.deepEqual(restoreInventoryForOrder(saved, assigned.inventory, 'delete').inventory, inventory);
  assert.equal(restoreInventoryForOrder({ ...saved, estadoPedido: 'Finalizado' }, inventory, 'delete').restored, 0);
});

test('no pisa cambios manuales posteriores ni modifica pedidos antiguos sin instantánea', () => {
  const order = { motivoTraslado: 'Alquiler', descripcionProductos: 'LAP-0003' };
  const assigned = syncInventoryForOrder(order, inventory);
  const modified = assigned.inventory.map((item) => item.id === '1' ? { ...item, estado: 'Taller' } : item);
  const result = restoreInventoryForOrder({ ...order, estadosAnteriores: assigned.previousStates }, modified, 'delete');
  assert.equal(result.restored, 0);
  assert.equal(result.skipped, 1);
  assert.equal(result.inventory[0].estado, 'Taller');
  assert.equal(restoreInventoryForOrder(order, assigned.inventory, 'finish').restored, 0);
});

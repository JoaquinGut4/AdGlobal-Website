import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diaLocal, movimientosPorFecha } from '../src/lib/movementDates.ts';

const movimientos = [
  { id: 'older', fecha: '2026-10-19T10:00:00', modulo: 'Inventario' },
  { id: 'late', fecha: '2026-10-20T23:59:00', modulo: 'Pedidos' },
  { id: 'early', fecha: '2026-10-20T00:01:00', modulo: 'Tickets' },
];

test('el día mostrado coincide con el calendario local', () => {
  assert.equal(diaLocal('2026-10-20T23:59:00'), '2026-10-20');
  assert.equal(diaLocal('fecha inválida'), null);
});

test('filtra por día completo y ordena de más reciente a más antiguo sin alterar la fuente', () => {
  assert.deepEqual(
    movimientosPorFecha(movimientos, '2026-10-20', '2026-10-20').map((item) => item.id),
    ['late', 'early'],
  );
  assert.deepEqual(
    movimientosPorFecha(movimientos, '2026-10-19', '2026-10-20').map((item) => item.id),
    ['late', 'early', 'older'],
  );
  assert.equal(movimientos[0].id, 'older');
});

test('permite filtrar solo desde o hasta, y rechaza un rango invertido', () => {
  assert.deepEqual(movimientosPorFecha(movimientos, '2026-10-20', '').map((item) => item.id), ['late', 'early']);
  assert.deepEqual(movimientosPorFecha(movimientos, '', '2026-10-19').map((item) => item.id), ['older']);
  assert.deepEqual(movimientosPorFecha(movimientos, '2026-10-21', '2026-10-19'), []);
});

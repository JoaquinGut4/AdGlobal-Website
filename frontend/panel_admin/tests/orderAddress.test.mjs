import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDireccionLlegada } from '../src/lib/utils.ts';

test('la dirección del ticket se compone del destino del pedido sin el nombre del cliente', () => {
  assert.equal(
    formatDireccionLlegada('Empresa: Cliente SAC · Dirección: Av. Principal 123 · Distrito: Miraflores · Provincia: Lima · Departamento: Lima'),
    'Av. Principal 123, Miraflores, Lima, Lima',
  );
});

test('los destinos antiguos sin campos se conservan y los incompletos piden corrección', () => {
  assert.equal(formatDireccionLlegada('Calle Central 456'), 'Calle Central 456');
  assert.equal(formatDireccionLlegada('Empresa: Cliente SAC · Distrito: Lima'), '');
});

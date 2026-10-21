import assert from 'node:assert/strict';
import { test } from 'node:test';
import { porcentajeFlota, resumirFlota } from '../src/lib/inventorySummary.ts';

const registros = [
  { estado: 'Alquiler' },
  { estado: 'En alquiler' },
  { estado: 'Oficina' },
  { estado: 'Almacén 1' },
  { estado: 'Taller' },
  { estado: 'En reparación' },
  { estado: 'Mantenimiento' },
  { estado: 'Reparacion' },
  { estado: 'Venta' },
];

test('agrupa la flota con las mismas reglas que los filtros de inventario', () => {
  assert.deepEqual(resumirFlota(registros), {
    alquiler: 2,
    oficina: 2,
    taller: 4,
    total: 8,
  });
});

test('ignora estados fuera de la flota operativa y tolera tildes', () => {
  assert.deepEqual(resumirFlota([{ estado: 'Venta' }, { estado: 'En tránsito' }]), {
    alquiler: 0,
    oficina: 0,
    taller: 0,
    total: 0,
  });

  assert.deepEqual(resumirFlota([{ estado: 'ALMACEN 2' }, { estado: 'REPARACION' }]), {
    alquiler: 0,
    oficina: 1,
    taller: 1,
    total: 2,
  });
});

test('calcula porcentajes seguros cuando no hay flota', () => {
  assert.equal(porcentajeFlota(2, 8), 25);
  assert.equal(porcentajeFlota(1, 0), 0);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asegurarEstadosInventario, esEstadoInmutable, normalizarEstadoInventario, normalizarEstadosAnteriores } from '../src/lib/inventoryStates.ts';

test('los estados operativos protegidos permanecen presentes incluso en catálogos vacíos', () => {
  assert.deepEqual(asegurarEstadosInventario([]), ['Disponible', 'Alquiler', 'Taller', 'Venta', 'Diagnóstico', 'Reparación', 'Reemplazo requerido', 'Reservado para reemplazo', 'Baja']);
  for (const estado of ['Disponible', 'Alquiler', 'Taller', 'Venta', 'venta', 'Vendido', 'Diagnóstico', 'Reparación', 'Reemplazo requerido', 'Reservado para reemplazo', 'Baja']) {
    assert.equal(esEstadoInmutable(estado), true);
  }
  assert.equal(esEstadoInmutable('Oficina'), false);
});

test('el catálogo anterior migra Vendido a Venta sin duplicar estados ni perder estados propios', () => {
  assert.deepEqual(
    asegurarEstadosInventario(['Almacén 1', 'Vendido', 'Venta', 'Taller', 'alquiler', 'En tránsito']),
    ['Almacén 1', 'Venta', 'Taller', 'Alquiler', 'En tránsito', 'Disponible', 'Diagnóstico', 'Reparación', 'Reemplazo requerido', 'Reservado para reemplazo', 'Baja'],
  );
  assert.equal(normalizarEstadoInventario('Vendido'), 'Venta');
  assert.deepEqual(normalizarEstadosAnteriores({ lap: 'Almacén 1', tv: 'Vendido' }),
    { lap: 'Almacén 1', tv: 'Venta' });
});

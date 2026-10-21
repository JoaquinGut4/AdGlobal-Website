import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CAMPOS_BASE_OPCIONALES_KEYS,
  camposBaseHabilitados,
  esCategoriaPrincipal,
} from '../src/lib/inventoryCategoryFields.ts';

test('una categoría sin configuración conserva todos los campos por defecto', () => {
  assert.deepEqual(camposBaseHabilitados(undefined), CAMPOS_BASE_OPCIONALES_KEYS);
  assert.deepEqual(camposBaseHabilitados({ id: 'custom-x', label: 'X', codigo: 9 }), CAMPOS_BASE_OPCIONALES_KEYS);
});

test('devuelve solo los campos habilitados y mantiene su orden', () => {
  const categoria = {
    id: 'custom-x',
    label: 'X',
    codigo: 9,
    camposBase: ['estado', 'marca', 'precio'],
  };
  assert.deepEqual(camposBaseHabilitados(categoria), ['marca', 'precio', 'estado']);
});

test('una lista vacía significa que la categoría no usa campos comunes', () => {
  const categoria = { id: 'custom-x', label: 'X', codigo: 9, camposBase: [] };
  assert.deepEqual(camposBaseHabilitados(categoria), []);
});

test('protege las categorías principales de la eliminación', () => {
  for (const id of ['laptops', 'computadoras', 'monitores', 'tablets', 'televisores', 'impresoras', 'proyectores']) {
    assert.equal(esCategoriaPrincipal(id), true);
  }
  assert.equal(esCategoriaPrincipal('custom-licencias-de-software-1'), false);
});

test('ignora claves desconocidas guardadas en la categoría', () => {
  const categoria = {
    id: 'custom-x',
    label: 'X',
    codigo: 9,
    camposBase: ['marca', 'campo-inventado'],
  };
  assert.deepEqual(camposBaseHabilitados(categoria), ['marca']);
});

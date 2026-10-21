import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractApiErrorMessage } from '../src/lib/apiErrors.ts';

test('usa el detail de texto que devuelve el backend', () => {
  assert.equal(
    extractApiErrorMessage({ detail: 'Credenciales inválidas' }, 'Error'),
    'Credenciales inválidas',
  );
});

test('convierte la lista de errores de validación en un mensaje legible', () => {
  const payload = {
    detail: [
      { msg: 'String should have at least 8 characters', loc: ['body', 'password'] },
      { msg: 'String should have at least 2 characters', loc: ['body', 'usuario'] },
    ],
  };
  assert.equal(
    extractApiErrorMessage(payload, 'Error'),
    'password: String should have at least 8 characters usuario: String should have at least 2 characters',
  );
});

test('usa el mensaje alternativo cuando no hay detail útil', () => {
  assert.equal(extractApiErrorMessage(null, 'Error 500'), 'Error 500');
  assert.equal(extractApiErrorMessage({}, 'Error 500'), 'Error 500');
  assert.equal(extractApiErrorMessage({ detail: [] }, 'Error 500'), 'Error 500');
});

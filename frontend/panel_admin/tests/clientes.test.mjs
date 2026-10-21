import assert from 'node:assert/strict';
import { test } from 'node:test';
import { derivarClientes, filtrarClientes } from '../src/lib/clientes.ts';

const DIRECCION = (destinatario, distrito, provincia, departamento) =>
  `${destinatario} · Dirección: Av. Principal 123 · Distrito: ${distrito} · Provincia: ${provincia} · Departamento: ${departamento}`;

const pedido = (overrides) => ({
  id: 'pedido',
  numeroPedido: 'PED-000',
  fechaEmision: '2026-10-10',
  direccionPartida: 'Av. Húsares de Junín 527, Jesús María, Lima',
  direccionLlegada: DIRECCION('Empresa: Cliente Demo', 'Lima', 'Lima', 'Lima'),
  telefonoContacto: '',
  descripcionProductos: '',
  cantidadProductos: 1,
  unidadMedida: 'UND',
  motivoTraslado: 'Alquiler',
  observaciones: '',
  ...overrides,
});

const pedidos = [
  pedido({
    id: 'a1',
    numeroPedido: 'PED-2026-001',
    fechaEmision: '2026-10-01',
    direccionLlegada: DIRECCION('Empresa: Compañía Minera Antamina', 'San Marcos', 'Huari', 'Áncash'),
    telefonoContacto: '999 111 222',
  }),
  pedido({
    id: 'a2',
    numeroPedido: 'PED-2026-002',
    fechaEmision: '2026-10-15',
    estadoPedido: 'Finalizado',
    direccionLlegada: DIRECCION('Empresa: Compañía Minera Antamina', 'San Marcos', 'Huari', 'Áncash'),
    telefonoContacto: '988 777 666',
  }),
  pedido({
    id: 'c1',
    numeroPedido: 'PED-2026-003',
    fechaEmision: '2026-10-05',
    estadoPedido: 'Finalizado',
    direccionLlegada: DIRECCION('Persona natural: Camila Ríos', 'San Borja', 'Lima', 'Lima'),
    telefonoContacto: '977 555 444',
  }),
  pedido({
    id: 'b1',
    numeroPedido: 'PED-2026-004',
    fechaEmision: '2026-10-11',
    direccionLlegada: DIRECCION('Empresa: Alicorp S.A.A.', 'Carmen de la Legua', 'Callao', 'Callao'),
    telefonoContacto: '966 333 222',
  }),
];

test('agrupa los pedidos por destinatario y calcula la actividad del cliente', () => {
  const clientes = derivarClientes(pedidos);

  assert.equal(clientes.length, 3);
  const antamina = clientes.find((cliente) => cliente.nombre === 'Compañía Minera Antamina');
  assert.ok(antamina);
  assert.equal(antamina.tipo, 'Empresa');
  assert.equal(antamina.pedidos, 2);
  assert.equal(antamina.pedidosVigentes, 1);
  assert.equal(antamina.estado, 'Activo');
  assert.equal(antamina.ultimaActividad, '2026-10-15');
  assert.equal(antamina.telefono, '988 777 666');
  assert.equal(antamina.ubicacion, 'San Marcos, Huari, Áncash');
  assert.deepEqual(antamina.numerosPedido, ['PED-2026-001', 'PED-2026-002']);
});

test('un cliente sin pedidos vigentes queda inactivo y conserva su tipo', () => {
  const camila = derivarClientes(pedidos).find((cliente) => cliente.nombre === 'Camila Ríos');

  assert.ok(camila);
  assert.equal(camila.tipo, 'Persona natural');
  assert.equal(camila.pedidos, 1);
  assert.equal(camila.pedidosVigentes, 0);
  assert.equal(camila.estado, 'Inactivo');
});

test('ordena por última actividad y no genera identificadores repetidos', () => {
  const clientes = derivarClientes(pedidos);

  assert.deepEqual(
    clientes.map((cliente) => cliente.nombre),
    ['Compañía Minera Antamina', 'Alicorp S.A.A.', 'Camila Ríos'],
  );

  const repetidos = derivarClientes([
    pedido({ id: '1', numeroPedido: 'PED-1', direccionLlegada: DIRECCION('Empresa: A/B', 'Lima', 'Lima', 'Lima') }),
    pedido({ id: '2', numeroPedido: 'PED-2', direccionLlegada: DIRECCION('Empresa: A B', 'Lima', 'Lima', 'Lima') }),
  ]);
  assert.equal(new Set(repetidos.map((cliente) => cliente.id)).size, repetidos.length);
});

test('busca por nombre, ubicación, teléfono y número de pedido sin exigir tildes', () => {
  const clientes = derivarClientes(pedidos);

  assert.deepEqual(filtrarClientes(clientes, 'antamina').map((cliente) => cliente.nombre), [
    'Compañía Minera Antamina',
  ]);
  assert.deepEqual(filtrarClientes(clientes, 'ancash').map((cliente) => cliente.nombre), [
    'Compañía Minera Antamina',
  ]);
  assert.deepEqual(filtrarClientes(clientes, '988777666').map((cliente) => cliente.nombre), [
    'Compañía Minera Antamina',
  ]);
  assert.deepEqual(filtrarClientes(clientes, 'PED-2026-004').map((cliente) => cliente.nombre), [
    'Alicorp S.A.A.',
  ]);
  assert.deepEqual(filtrarClientes(clientes, 'camila rios').map((cliente) => cliente.nombre), [
    'Camila Ríos',
  ]);
  assert.deepEqual(filtrarClientes(clientes, 'inactivo').map((cliente) => cliente.nombre), [
    'Camila Ríos',
  ]);
  assert.deepEqual(filtrarClientes(clientes, 'zzz'), []);
});

test('sin pedidos no hay clientes y la búsqueda vacía devuelve la relación completa', () => {
  assert.deepEqual(derivarClientes([]), []);
  const clientes = derivarClientes(pedidos);
  assert.deepEqual(filtrarClientes(clientes, '   '), clientes);
});

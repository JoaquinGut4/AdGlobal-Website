import assert from 'node:assert/strict';
import { test } from 'node:test';
import { construirAnaliticaPedidos } from '../src/lib/orderAnalytics.ts';

const REFERENCIA = new Date(2026, 9, 21); // 21/10/2026, hora local

const pedido = (numeroPedido, fechaEmision, motivoTraslado, cantidadProductos) => ({
  id: numeroPedido,
  numeroPedido,
  fechaEmision,
  direccionPartida: '',
  direccionLlegada: '',
  descripcionProductos: '',
  cantidadProductos,
  unidadMedida: 'UND',
  motivoTraslado,
  observaciones: '',
});

const pedidos = [
  pedido('PED-1', '2026-10-01', 'Alquiler', 60),
  pedido('PED-2', '2026-10-14', 'Venta con entrega a terceros', 35),
  pedido('PED-3', '2026-10-08', 'Devolución', 10),
  pedido('PED-4', '2026-09-20', 'Alquiler', 5),
  pedido('PED-5', '2026-11-02', 'Alquiler', 7),
  pedido('PED-6', '2026-01-15', 'Alquiler', 100),
  pedido('PED-7', '2023-05-01', 'Venta', 3),
  pedido('PED-8', '2026-10-15', 'Venta', 0),
];

test('agrupa por mes las unidades de alquiler y venta desde los pedidos', () => {
  const data = construirAnaliticaPedidos(pedidos, 'mes', REFERENCIA);

  assert.equal(data.items.length, 6);
  assert.deepEqual(data.items.map((item) => item.label), ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct']);
  assert.deepEqual(data.items.map((item) => item.sublabel), Array(6).fill('2026'));

  const septiembre = data.items.find((item) => item.label === 'Sep');
  const octubre = data.items.find((item) => item.label === 'Oct');
  assert.deepEqual(
    { alquiler: septiembre?.alquiler, ventas: septiembre?.ventas },
    { alquiler: 5, ventas: 0 },
  );
  assert.deepEqual(
    { alquiler: octubre?.alquiler, ventas: octubre?.ventas },
    { alquiler: 60, ventas: 35 },
  );

  assert.equal(data.resumen.totalAlquiler, 65);
  assert.equal(data.resumen.totalVentas, 35);
  assert.equal(data.resumen.promedioAlquiler, 11);
  assert.equal(data.resumen.promedioVentas, 6);
  assert.equal(data.maxVal, 60);
  assert.match(data.subtitle, /^3 pedidos considerados/);
});

test('muestra la semana actual de lunes a domingo y agrupa cada día', () => {
  const pedidosSemana = [
    pedido('PED-LUN', '2026-10-19', 'Alquiler', 4),
    pedido('PED-MIE', '2026-10-21', 'Venta', 2),
    pedido('PED-DOM', '2026-10-25', 'Alquiler', 3),
    pedido('PED-FUERA', '2026-10-26', 'Venta', 9),
  ];
  const data = construirAnaliticaPedidos(pedidosSemana, 'semana', REFERENCIA);

  assert.equal(data.items.length, 7);
  assert.deepEqual(data.items.map((item) => item.label), ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
  assert.deepEqual(data.items.map((item) => item.sublabel), ['19/10', '20/10', '21/10', '22/10', '23/10', '24/10', '25/10']);
  assert.deepEqual(
    {
      lunes: data.items[0].alquiler,
      miercoles: data.items[2].ventas,
      domingo: data.items[6].alquiler,
    },
    { lunes: 4, miercoles: 2, domingo: 3 },
  );
  assert.equal(data.resumen.totalAlquiler, 7);
  assert.equal(data.resumen.totalVentas, 2);
});

test('agrupa por año y excluye devoluciones, pedidos sin cantidad y fechas inválidas', () => {
  const data = construirAnaliticaPedidos(
    [...pedidos, pedido('PED-9', 'sin-fecha', 'Alquiler', 50)],
    'año',
    REFERENCIA,
  );

  assert.equal(data.items.length, 5);
  assert.deepEqual(data.items.map((item) => item.label), ['2022', '2023', '2024', '2025', '2026']);
  assert.deepEqual(
    { alquiler: data.items.at(-1)?.alquiler, ventas: data.items.at(-1)?.ventas },
    { alquiler: 172, ventas: 35 },
  );
  assert.equal(data.items.find((item) => item.label === '2023')?.ventas, 3);
  assert.equal(data.resumen.totalVentas, 38);
});

test('sin pedidos devuelve periodos vacíos y un máximo seguro', () => {
  const data = construirAnaliticaPedidos([], 'mes', REFERENCIA);

  assert.equal(data.items.length, 6);
  assert.equal(data.resumen.totalAlquiler, 0);
  assert.equal(data.resumen.totalVentas, 0);
  assert.equal(data.resumen.promedioAlquiler, 0);
  assert.equal(data.maxVal, 1);
  assert.equal(data.subtitle, 'Sin movimientos registrados en el periodo');
});

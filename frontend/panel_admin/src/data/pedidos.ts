import type { PedidoRegistro } from '@/types';

const PARTIDA = 'Av. Húsares de Junín 527, Jesús María, Lima, Lima';

export const PEDIDOS_SEED: PedidoRegistro[] = [
  {
    id: 'ped-001', numeroPedido: 'PED-2026-001', fechaEmision: '2026-10-15',
    direccionPartida: PARTIDA,
    direccionLlegada: 'Empresa: Compañía Minera Antamina · Dirección: Campamento Yanacancha · Distrito: San Marcos · Provincia: Huari · Departamento: Áncash',
    descripcionProductos: 'LAP-0002 · Laptops · Lenovo ThinkPad T14 Gen 2',
    cantidadProductos: 60, unidadMedida: 'UND', motivoTraslado: 'Alquiler',
    observaciones: 'Requiere configuración de dominio y soporte en campo.',
  },
  {
    id: 'ped-002', numeroPedido: 'PED-2026-002', fechaEmision: '2026-10-14',
    direccionPartida: PARTIDA,
    direccionLlegada: 'Empresa: Universidad de Lima · Dirección: Av. Javier Prado Este 4600 · Distrito: Santiago de Surco · Provincia: Lima · Departamento: Lima',
    descripcionProductos: 'MON-0001 · Monitores · LG Monitor IPS Full HD 24"',
    cantidadProductos: 35, unidadMedida: 'UND', motivoTraslado: 'Venta',
    observaciones: 'Solicitan garantía extendida a 24 meses.',
  },
  {
    id: 'ped-003', numeroPedido: 'PED-2026-003', fechaEmision: '2026-10-13',
    direccionPartida: PARTIDA,
    direccionLlegada: 'Persona natural: Camila Ríos · Dirección: Centro de Convenciones de Lima · Distrito: San Borja · Provincia: Lima · Departamento: Lima',
    descripcionProductos: 'TAB-0001 · Tablets · Apple iPad 10.ª generación',
    cantidadProductos: 25, unidadMedida: 'UND', motivoTraslado: 'Alquiler',
    observaciones: 'Incluye atriles antirrobo y configuración MDM.',
  },
  {
    id: 'ped-004', numeroPedido: 'PED-2026-004', fechaEmision: '2026-10-11',
    direccionPartida: PARTIDA,
    direccionLlegada: 'Empresa: Alicorp S.A.A. · Dirección: Av. Argentina 4793 · Distrito: Carmen de la Legua · Provincia: Callao · Departamento: Callao',
    descripcionProductos: 'PC-0001 · Computadoras · Dell OptiPlex 7090 SFF',
    cantidadProductos: 18, unidadMedida: 'UND', motivoTraslado: 'Venta con entrega a terceros',
    observaciones: 'Instalación de imagen corporativa completada.',
  },
  {
    id: 'ped-005', numeroPedido: 'PED-2026-005', fechaEmision: '2026-10-08',
    direccionPartida: PARTIDA,
    direccionLlegada: 'Persona natural: Daniela Vargas · Dirección: Av. Juan de Arona 830 · Distrito: San Isidro · Provincia: Lima · Departamento: Lima',
    descripcionProductos: 'TV-0002 · Televisores · LG Smart TV NanoCell 65"',
    cantidadProductos: 10, unidadMedida: 'UND', motivoTraslado: 'Devolución',
    observaciones: 'Recojo coordinado al finalizar el evento.',
  },
  {
    id: 'ped-006', numeroPedido: 'PED-2026-006', fechaEmision: '2026-10-01',
    direccionPartida: PARTIDA,
    direccionLlegada: 'Empresa: Inversiones Hoteleras SAC · Dirección: Calle Plateros 334 · Distrito: Cusco · Provincia: Cusco · Departamento: Cusco',
    descripcionProductos: 'IMP-0001 · Impresoras · Ricoh IM C3000',
    cantidadProductos: 6, unidadMedida: 'UND', motivoTraslado: 'Venta sujeta a confirmación del cliente',
    observaciones: 'Entrega pendiente de confirmación final.',
  },
];

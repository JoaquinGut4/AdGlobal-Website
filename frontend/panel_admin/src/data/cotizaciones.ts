import type { Cotizacion } from '@/types';

/** Solicitudes de ejemplo (semilla) usadas mientras el backend no esté conectado. */
export const COTIZACIONES_SEED: Cotizacion[] = [
  {
    id: 'cot-101',
    nombre: 'Valeria Salas',
    empresa: 'Corporación Minera del Sur',
    correo: 'vsalas@minsurcorp.pe',
    telefono: '+51 987 112 345',
    servicioId: 'pantallas-led',
    fechas: '18 al 22 de Noviembre',
    ciudad: 'Arequipa',
    mensaje:
      'Requerimos 2 muros LED P2.6 de 6x3.5m con procesadores Novastar 4K y soporte técnico residente para asamblea anual.',
    createdAt: 'Hoy, 09:42 AM',
    status: 'pendiente',
  },
  {
    id: 'cot-102',
    nombre: 'Jorge Benavides',
    empresa: 'Banco de Crédito BCP',
    correo: 'jbenavides@bcp.com.pe',
    telefono: '+51 993 456 789',
    servicioId: 'laptops-computadores',
    fechas: '01 al 15 de Diciembre',
    ciudad: 'Lima - San Isidro',
    mensaje:
      'Lote de 45 laptops Core i7 con 32GB RAM y Windows 11 Enterprise para capacitación nacional de analistas de riesgo.',
    createdAt: 'Hoy, 08:15 AM',
    status: 'atendido',
  },
  {
    id: 'cot-103',
    nombre: 'Lucía Montenegro',
    empresa: 'Productora Live Events SAC',
    correo: 'lucia@liveevents.pe',
    telefono: '+51 912 345 678',
    servicioId: 'tablets',
    fechas: '25 de Noviembre',
    ciudad: 'Lima - Jockey Plaza',
    mensaje:
      '30 tablets iPad 10.9" con atriles metálicos de piso y cerradura antirrobo para acreditación y check-in QR en feria comercial.',
    createdAt: 'Ayer, 04:30 PM',
    status: 'pendiente',
  },
];

import type { AlquilerRegistro } from '@/types';

export const ALQUILERES_SEED: AlquilerRegistro[] = [
  {
    id: 'alq-001', contrato: 'ALQ-2026-001', cliente: 'Corporación Minera del Sur',
    ruc: '20518472631', proyecto: 'Convención anual minera', categoria: 'Laptops',
    equipo: 'Lenovo ThinkPad T14 Gen 2', sku: 'LAP-0002', numeroSerial: 'PF3K91LM',
    cantidad: 45, fechaInicio: '2026-10-08', fechaFin: '2026-10-20', ubicacion: 'Arequipa',
    responsable: 'Andrea Salazar', telefono: '+51 987 321 450', tarifa: 13500, deposito: 4000,
    estado: 'Activo', observaciones: 'Incluye configuración, transporte y soporte en sitio.',
  },
  {
    id: 'alq-002', contrato: 'ALQ-2026-002', cliente: 'Banco de Crédito BCP',
    ruc: '20100047218', proyecto: 'Capacitación nacional', categoria: 'Tablets',
    equipo: 'Apple iPad 10.ª generación', sku: 'TAB-0001', numeroSerial: 'LOTE-TAB-040',
    cantidad: 40, fechaInicio: '2026-10-12', fechaFin: '2026-10-18', ubicacion: 'Lima - San Isidro',
    responsable: 'Luis Mendoza', telefono: '+51 944 120 831', tarifa: 9200, deposito: 2800,
    estado: 'Por vencer', observaciones: 'Incluye atriles antirrobo y perfil MDM.',
  },
  {
    id: 'alq-003', contrato: 'ALQ-2026-003', cliente: 'Productora Live Events SAC',
    ruc: '20607193452', proyecto: 'Feria comercial de tecnología', categoria: 'Televisores',
    equipo: 'Samsung Smart TV Crystal UHD 55"', sku: 'TV-0001', numeroSerial: 'LOTE-TV-012',
    cantidad: 12, fechaInicio: '2026-10-20', fechaFin: '2026-10-24', ubicacion: 'Lima - Jockey Plaza',
    responsable: 'María Paredes', telefono: '+51 955 742 116', tarifa: 7800, deposito: 2400,
    estado: 'Reservado', observaciones: 'Instalación programada un día antes del evento.',
  },
  {
    id: 'alq-004', contrato: 'ALQ-2026-004', cliente: 'Universidad del Pacífico',
    ruc: '20109705129', proyecto: 'Semana de innovación', categoria: 'Proyectores',
    equipo: 'Epson EB-L630U', sku: 'PRO-0001', numeroSerial: 'LOTE-PRO-006',
    cantidad: 6, fechaInicio: '2026-09-28', fechaFin: '2026-10-10', ubicacion: 'Lima - Jesús María',
    responsable: 'Carlos Neyra', telefono: '+51 981 605 422', tarifa: 10800, deposito: 3200,
    estado: 'Vencido', observaciones: 'Pendiente coordinación de recojo con el cliente.',
  },
  {
    id: 'alq-005', contrato: 'ALQ-2026-005', cliente: 'Estudio Miranda & Amado',
    ruc: '20512370215', proyecto: 'Oficina temporal', categoria: 'Computadoras',
    equipo: 'Dell OptiPlex 7090 SFF', sku: 'PC-0001', numeroSerial: 'LOTE-PC-025',
    cantidad: 25, fechaInicio: '2026-08-01', fechaFin: '2026-09-30', ubicacion: 'Lima - Miraflores',
    responsable: 'Fernanda Ruiz', telefono: '+51 963 225 900', tarifa: 18500, deposito: 5500,
    estado: 'Devuelto', observaciones: 'Equipos devueltos y conformidad firmada.',
  },
  {
    id: 'alq-006', contrato: 'ALQ-2026-006', cliente: 'Clínica Internacional',
    ruc: '20100054184', proyecto: 'Registro de pacientes', categoria: 'Impresoras',
    equipo: 'HP LaserJet Enterprise M507dn', sku: 'IMP-0002', numeroSerial: 'LOTE-IMP-008',
    cantidad: 8, fechaInicio: '2026-10-05', fechaFin: '2026-11-05', ubicacion: 'Lima - Cercado',
    responsable: 'Raúl Cabrera', telefono: '+51 976 840 211', tarifa: 6400, deposito: 1900,
    estado: 'Activo', observaciones: 'Mantenimiento y tóner incluidos durante el contrato.',
  },
];

import type { ClienteCorporativo } from '@/types';

/** Directorio de clientes corporativos recurrentes. */
export const CLIENTES_DATA: ClienteCorporativo[] = [
  {
    id: 'cli-01', name: 'Banco de Crédito BCP', ruc: '20100047218',
    sector: 'Banca y Finanzas', contacto: 'Luis Mendoza', email: 'lmendoza@bcp.com.pe',
    telefono: '+51 944 120 831', eventos: 12, rating: 'VIP', ultimaActividad: '14/10/2026', estado: 'Activo',
  },
  {
    id: 'cli-02', name: 'Corporación Minera del Sur', ruc: '20518472631',
    sector: 'Minería', contacto: 'Andrea Salazar', email: 'asalazar@minerasur.pe',
    telefono: '+51 987 321 450', eventos: 8, rating: 'A+', ultimaActividad: '12/10/2026', estado: 'Activo',
  },
  {
    id: 'cli-03', name: 'Productora Live Events SAC', ruc: '20607193452',
    sector: 'Entretenimiento', contacto: 'María Paredes', email: 'maria@liveevents.pe',
    telefono: '+51 955 742 116', eventos: 24, rating: 'VIP', ultimaActividad: '10/10/2026', estado: 'Activo',
  },
  {
    id: 'cli-04', name: 'Claro Telecomunicaciones', ruc: '20467534026',
    sector: 'Telecomunicaciones', contacto: 'Carlos Herrera', email: 'cherrera@claro.com.pe',
    telefono: '+51 961 205 774', eventos: 15, rating: 'VIP', ultimaActividad: '06/10/2026', estado: 'Activo',
  },
  {
    id: 'cli-05', name: 'Universidad Tecnológica UTP', ruc: '20462509236',
    sector: 'Educación', contacto: 'Patricia León', email: 'pleon@utp.edu.pe',
    telefono: '+51 972 418 605', eventos: 9, rating: 'A+', ultimaActividad: '18/04/2026', estado: 'Inactivo',
  },
  {
    id: 'cli-06', name: 'Ministerio de Transportes MTC', ruc: '20131379944',
    sector: 'Gobierno', contacto: 'Roberto Chávez', email: 'rchavez@mtc.gob.pe',
    telefono: '+51 933 710 482', eventos: 5, rating: 'Estándar', ultimaActividad: '22/01/2026', estado: 'Inactivo',
  },
];

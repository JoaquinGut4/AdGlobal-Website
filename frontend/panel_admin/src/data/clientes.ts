import type { ClienteCorporativo } from '@/types';

/** Directorio de clientes corporativos recurrentes. */
export const CLIENTES_DATA: ClienteCorporativo[] = [
  { id: 'cli-01', name: 'Banco de Crédito BCP', sector: 'Banca y Finanzas', eventos: 12, rating: 'VIP' },
  { id: 'cli-02', name: 'Corporación Minera del Sur', sector: 'Minería', eventos: 8, rating: 'A+' },
  { id: 'cli-03', name: 'Productora Live Events SAC', sector: 'Entretenimiento', eventos: 24, rating: 'VIP' },
  { id: 'cli-04', name: 'Claro Telecomunicaciones', sector: 'Telecomunicaciones', eventos: 15, rating: 'VIP' },
  { id: 'cli-05', name: 'Universidad Tecnológica UTP', sector: 'Educación', eventos: 9, rating: 'A+' },
  { id: 'cli-06', name: 'Ministerio de Transportes MTC', sector: 'Gobierno', eventos: 5, rating: 'Estándar' },
];

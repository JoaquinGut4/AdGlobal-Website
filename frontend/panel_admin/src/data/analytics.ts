import type { ChartPeriod, StatsPeriodo } from '@/types';

/**
 * Comparativo "Equipos en Alquiler vs Ventas".
 * Se mantiene vacío hasta que existan movimientos reales que alimenten la analítica.
 */
const emptyPeriod = (title: string, periodLabel: string): ChartPeriod => ({
  title,
  subtitle: 'Sin movimientos registrados en el periodo',
  periodLabel,
  maxVal: 1,
  items: [],
  resumen: {
    totalAlquiler: 0,
    totalVentas: 0,
    promedioAlquiler: 0,
    promedioVentas: 0,
  },
});

export const ANALYTICS_BY_PERIOD: Record<StatsPeriodo, ChartPeriod> = {
  semana: emptyPeriod('Equipos en Alquiler vs Ventas por Semana', 'Semana'),
  mes: emptyPeriod('Equipos en Alquiler vs Ventas por Mes', 'Mes'),
  año: emptyPeriod('Equipos en Alquiler vs Ventas por Año', 'Año'),
};

/** Estados del parque informático mostrados en el dashboard. */
export const ESTADO_ALMACEN = [
  { id: 'led', label: 'Módulos LED Novastar 4K', percent: 0, value: '0%', color: 'emerald' },
  { id: 'laptops', label: 'Laptops Core i7 / ThinkPad', percent: 0, value: '0%', color: 'sky' },
  { id: 'tablets', label: 'Tablets & Atriles de Piso', percent: 0, value: '0%', color: 'purple' },
] as const;

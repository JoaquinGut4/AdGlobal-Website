import type { PresupuestoMetric } from '@/types';

/** Métricas del generador de presupuestos y proformas. */
export const PRESUPUESTOS_METRICS: PresupuestoMetric[] = [
  {
    id: 'proformas',
    label: 'Proformas Emitidas Mes',
    value: '34',
    detail: '+18% respecto al mes anterior',
    tone: 'positive',
  },
  {
    id: 'monto',
    label: 'Monto Total Cotizado',
    value: '$56.800 USD',
    detail: 'Promedio $1.670 por evento',
    tone: 'neutral',
  },
  {
    id: 'cierre',
    label: 'Tasa de Cierre',
    value: '68.5%',
    detail: 'Excelente conversión',
    tone: 'positive',
  },
];

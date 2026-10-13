import type { ChartPeriod, StatsPeriodo } from '@/types';

/**
 * Datos del comparativo "Equipos en Alquiler vs Ventas" por periodo.
 * Fuente temporal mientras el backend no exponga analítica real.
 */
export const ANALYTICS_BY_PERIOD: Record<StatsPeriodo, ChartPeriod> = {
  semana: {
    title: 'Equipos en Alquiler vs Ventas por Semana',
    subtitle: 'Flujo operativo semanal (últimas 6 semanas activas)',
    periodLabel: 'Semana',
    maxVal: 150,
    items: [
      {
        label: 'Sem 36',
        sublabel: '01-07 Sep',
        alquiler: 82,
        ventas: 18,
        equiposAlquiler: '52 Laptops, 18 Pantallas LED, 12 Tablets',
        equiposVenta: '12 Laptops reacond., 6 Monitores',
      },
      {
        label: 'Sem 37',
        sublabel: '08-14 Sep',
        alquiler: 98,
        ventas: 24,
        equiposAlquiler: '64 Laptops, 22 Pantallas LED, 12 Proyectores',
        equiposVenta: '15 Laptops, 9 Accesorios de red',
      },
      {
        label: 'Sem 38',
        sublabel: '15-21 Sep',
        alquiler: 114,
        ventas: 29,
        equiposAlquiler: '75 Laptops, 25 Pantallas LED, 14 Tablets',
        equiposVenta: '18 Laptops, 11 Monitores',
      },
      {
        label: 'Sem 39',
        sublabel: '22-28 Sep',
        alquiler: 105,
        ventas: 22,
        equiposAlquiler: '70 Laptops, 20 Pantallas LED, 15 Racks',
        equiposVenta: '14 Laptops, 8 Impresoras',
      },
      {
        label: 'Sem 40',
        sublabel: '29 Sep - 05 Oct',
        alquiler: 128,
        ventas: 35,
        equiposAlquiler: '84 Laptops, 28 Pantallas LED, 16 Tablets',
        equiposVenta: '22 Laptops, 13 Monitores & Accesorios',
      },
      {
        label: 'Sem 41',
        sublabel: '06-12 Oct (Actual)',
        alquiler: 142,
        ventas: 41,
        equiposAlquiler: '96 Laptops, 32 Pantallas LED, 14 Tablets',
        equiposVenta: '26 Laptops, 15 Monitores & Redes',
      },
    ],
    resumen: {
      totalAlquiler: 669,
      totalVentas: 169,
      promedioAlquiler: 111,
      promedioVentas: 28,
    },
  },
  mes: {
    title: 'Equipos en Alquiler vs Ventas por Mes',
    subtitle: 'Comportamiento mensual del año en curso (2025)',
    periodLabel: 'Mes',
    maxVal: 380,
    items: [
      {
        label: 'Mayo',
        sublabel: '2025',
        alquiler: 245,
        ventas: 62,
        equiposAlquiler: '160 Laptops, 55 Pantallas, 30 Tablets',
        equiposVenta: '40 Laptops, 22 Monitores',
      },
      {
        label: 'Junio',
        sublabel: '2025',
        alquiler: 278,
        ventas: 74,
        equiposAlquiler: '185 Laptops, 60 Pantallas, 33 Tablets',
        equiposVenta: '48 Laptops, 26 Equipos Red',
      },
      {
        label: 'Julio',
        sublabel: '2025',
        alquiler: 310,
        ventas: 88,
        equiposAlquiler: '205 Laptops, 70 Pantallas, 35 Audio/Video',
        equiposVenta: '58 Laptops, 30 Monitores',
      },
      {
        label: 'Agosto',
        sublabel: '2025',
        alquiler: 295,
        ventas: 79,
        equiposAlquiler: '195 Laptops, 68 Pantallas, 32 Tablets',
        equiposVenta: '50 Laptops, 29 Periféricos',
      },
      {
        label: 'Setiembre',
        sublabel: '2025',
        alquiler: 348,
        ventas: 95,
        equiposAlquiler: '230 Laptops, 78 Pantallas, 40 Tablets',
        equiposVenta: '62 Laptops, 33 Redes & Servidores',
      },
      {
        label: 'Octubre',
        sublabel: '2025 (En curso)',
        alquiler: 362,
        ventas: 108,
        equiposAlquiler: '240 Laptops, 82 Pantallas, 40 Equipos Audio',
        equiposVenta: '70 Laptops, 38 Monitores & Switches',
      },
    ],
    resumen: {
      totalAlquiler: 1838,
      totalVentas: 506,
      promedioAlquiler: 306,
      promedioVentas: 84,
    },
  },
  año: {
    title: 'Equipos en Alquiler vs Ventas por Año',
    subtitle: 'Histórico consolidado multianual de AD GLOBAL PERÚ',
    periodLabel: 'Año',
    maxVal: 4200,
    items: [
      {
        label: '2021',
        sublabel: 'Post-Pandemia',
        alquiler: 1420,
        ventas: 340,
        equiposAlquiler: '920 Laptops, 300 Pantallas, 200 Tablets',
        equiposVenta: '220 Laptops, 120 Periféricos',
      },
      {
        label: '2022',
        sublabel: 'Crecimiento Corp.',
        alquiler: 2150,
        ventas: 510,
        equiposAlquiler: '1410 Laptops, 460 Pantallas, 280 Tablets',
        equiposVenta: '340 Laptops, 170 Monitores',
      },
      {
        label: '2023',
        sublabel: 'Expansión Eventos',
        alquiler: 2890,
        ventas: 720,
        equiposAlquiler: '1880 Laptops, 640 Pantallas, 370 Tablets',
        equiposVenta: '480 Laptops, 240 Redes/Servidores',
      },
      {
        label: '2024',
        sublabel: 'Consolidación',
        alquiler: 3480,
        ventas: 940,
        equiposAlquiler: '2280 Laptops, 780 Pantallas, 420 Audio/Video',
        equiposVenta: '620 Laptops, 320 Monitores',
      },
      {
        label: '2025',
        sublabel: 'Proyección Anual',
        alquiler: 3950,
        ventas: 1180,
        equiposAlquiler: '2600 Laptops, 890 Pantallas, 460 Tablets/Redes',
        equiposVenta: '780 Laptops, 400 Monitores & Equipos',
      },
    ],
    resumen: {
      totalAlquiler: 13890,
      totalVentas: 3690,
      promedioAlquiler: 2778,
      promedioVentas: 738,
    },
  },
};

/** Estados del parque informático mostrados en el dashboard. */
export const ESTADO_ALMACEN = [
  { id: 'led', label: 'Módulos LED Novastar 4K', percent: 95, value: '95% (120m²)', color: 'emerald' },
  { id: 'laptops', label: 'Laptops Core i7 / ThinkPad', percent: 88, value: '88% (450 uds)', color: 'sky' },
  { id: 'tablets', label: 'Tablets & Atriles de Piso', percent: 92, value: '92% (180 uds)', color: 'purple' },
] as const;

import type { ChartItem, ChartPeriod, PedidoRegistro, StatsPeriodo } from '@/types';

type TipoOperacion = 'alquiler' | 'ventas';

interface PeriodoInfo {
  key: string;
  label: string;
  sublabel?: string;
  inicio: Date;
  fin: Date;
}

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PERIODOS_POR_VISTA: Record<StatsPeriodo, number> = { semana: 7, mes: 6, año: 5 };
const ETIQUETA_PERIODO: Record<StatsPeriodo, string> = { semana: 'Semana', mes: 'Mes', año: 'Año' };

/** Clasifica el pedido según su motivo de traslado. Devoluciones y otros no suman. */
function tipoOperacion(pedido: PedidoRegistro): TipoOperacion | null {
  if (pedido.motivoTraslado === 'Alquiler') return 'alquiler';
  if (pedido.motivoTraslado.startsWith('Venta')) return 'ventas';
  return null;
}

/** Fecha local a medianoche a partir de una fecha ISO (YYYY-MM-DD). */
function fechaLocal(fecha: string): Date | null {
  const [year, month, day] = (fecha ?? '').slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inicioSemana(fecha: Date): Date {
  const date = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const offset = (date.getDay() + 6) % 7; // lunes = 0
  date.setDate(date.getDate() - offset);
  return date;
}

function diaCorto(fecha: Date): string {
  return `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

function generarPeriodos(periodo: StatsPeriodo, referencia: Date): PeriodoInfo[] {
  const cantidad = PERIODOS_POR_VISTA[periodo];

  if (periodo === 'semana') {
    const semanaActual = inicioSemana(referencia);
    return Array.from({ length: cantidad }, (_, index) => {
      const inicio = new Date(semanaActual);
      inicio.setDate(inicio.getDate() + index);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 1);
      return {
        key: `dia-${inicio.getFullYear()}-${inicio.getMonth()}-${inicio.getDate()}`,
        label: DIAS_CORTOS[index],
        sublabel: diaCorto(inicio),
        inicio,
        fin,
      };
    });
  }

  if (periodo === 'mes') {
    return Array.from({ length: cantidad }, (_, index) => {
      const inicio = new Date(referencia.getFullYear(), referencia.getMonth() - (cantidad - 1 - index), 1);
      const fin = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 1);
      return {
        key: `mes-${inicio.getFullYear()}-${inicio.getMonth()}`,
        label: MESES_CORTOS[inicio.getMonth()],
        sublabel: String(inicio.getFullYear()),
        inicio,
        fin,
      };
    });
  }

  return Array.from({ length: cantidad }, (_, index) => {
    const year = referencia.getFullYear() - (cantidad - 1 - index);
    return {
      key: `anio-${year}`,
      label: String(year),
      inicio: new Date(year, 0, 1),
      fin: new Date(year + 1, 0, 1),
    };
  });
}

/**
 * Construye el comparativo de equipos en alquiler vs ventas a partir de los pedidos.
 * Cada barra agrupa las unidades de los pedidos cuya fecha de emisión cae en el periodo.
 */
export function construirAnaliticaPedidos(
  pedidos: PedidoRegistro[],
  periodo: StatsPeriodo,
  referencia: Date = new Date(),
): ChartPeriod {
  const periodos = generarPeriodos(periodo, referencia);
  const acumulado = new Map(periodos.map((item) => [item.key, { alquiler: 0, ventas: 0 }]));
  let pedidosContados = 0;

  for (const pedido of pedidos) {
    const tipo = tipoOperacion(pedido);
    if (!tipo) continue;

    const fecha = fechaLocal(pedido.fechaEmision);
    if (!fecha) continue;

    const cantidad = Number(pedido.cantidadProductos);
    if (!Number.isFinite(cantidad) || cantidad <= 0) continue;

    const destino = periodos.find(
      (item) => fecha.getTime() >= item.inicio.getTime() && fecha.getTime() < item.fin.getTime(),
    );
    if (!destino) continue;

    const valores = acumulado.get(destino.key);
    if (!valores) continue;
    valores[tipo] += cantidad;
    pedidosContados += 1;
  }

  const items: ChartItem[] = periodos.map((item) => {
    const valores = acumulado.get(item.key) ?? { alquiler: 0, ventas: 0 };
    return {
      label: item.label,
      sublabel: item.sublabel,
      alquiler: valores.alquiler,
      ventas: valores.ventas,
      equiposAlquiler: `${valores.alquiler} uds`,
      equiposVenta: `${valores.ventas} uds`,
    };
  });

  const totalAlquiler = items.reduce((total, item) => total + item.alquiler, 0);
  const totalVentas = items.reduce((total, item) => total + item.ventas, 0);
  const maxVal = Math.max(1, ...items.map((item) => Math.max(item.alquiler, item.ventas)));
  const periodLabel = ETIQUETA_PERIODO[periodo];

  return {
    title: `Equipos en Alquiler vs Ventas por ${periodLabel}`,
    subtitle:
      pedidosContados === 0
        ? 'Sin movimientos registrados en el periodo'
        : `${pedidosContados} ${pedidosContados === 1 ? 'pedido considerado' : 'pedidos considerados'} en el periodo`,
    periodLabel,
    maxVal,
    items,
    resumen: {
      totalAlquiler,
      totalVentas,
      promedioAlquiler: Math.round(totalAlquiler / periodos.length),
      promedioVentas: Math.round(totalVentas / periodos.length),
    },
  };
}

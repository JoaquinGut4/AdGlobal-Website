/**
 * Tipos compartidos del panel administrativo de AD GLOBAL.
 */

/** Secciones navegables del menú principal del panel. */
export type AdminSection =
  | 'dashboard'
  | 'inventario'
  | 'alquileres'
  | 'ventas'
  | 'cotizaciones'
  | 'pedidos'
  | 'clientes'
  | 'movimientos'
  | 'tickets'
  | 'gestion-web'
  | 'reportes'
  | 'configuracion';

export type CotizacionStatus = 'pendiente' | 'atendido';

/** Solicitud de cotización recibida desde la web pública o registrada internamente. */
export interface Cotizacion {
  id: string;
  nombre: string;
  empresa: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fechas: string;
  ciudad: string;
  mensaje: string;
  createdAt: string;
  status: CotizacionStatus;
}

export type TicketArea =
  | 'Soporte In-Situ'
  | 'Reparación Taller'
  | 'Mantenimiento Preventivo'
  | 'Cambio Express';

export type TicketPrioridad = 'Urgente' | 'Alta' | 'Media' | 'Baja';

export type TicketEstado = 'Abierto' | 'En Diagnóstico' | 'En Reparación' | 'Resuelto';

/** Ticket de soporte técnico / reparación de equipos. */
export interface SupportTicket {
  id: string;
  codigo: string;
  area: TicketArea;
  equipo: string;
  cliente: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  descripcion: string;
  tecnico: string;
  fecha: string;
}

export type InventarioIcon = 'laptop' | 'monitor' | 'tablet' | 'volume' | 'printer' | 'package';

/** Fila del control de inventario. */
export interface InventarioItem {
  id: string;
  name: string;
  category: string;
  iconName: InventarioIcon;
  specs: string;
  total: number;
  unit: string;
  alquiler: number;
  oficina: number;
  taller: number;
  dispPercent: number;
  statusText: string;
  ubicacionOficina: string;
  proyectosAlquiler: string;
  diagnosticoTaller: string;
}

/** Cliente corporativo del directorio. */
export interface ClienteCorporativo {
  id: string;
  name: string;
  sector: string;
  eventos: number;
  rating: 'VIP' | 'A+' | 'Estándar';
}

export interface PresupuestoMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: 'neutral' | 'positive' | 'brand';
}

/** Filtros rápidos del inventario. */
export type InventarioFiltro = 'all' | 'alquiler' | 'oficina' | 'taller';

/** Periodo del gráfico comparativo de flota. */
export type StatsPeriodo = 'semana' | 'mes' | 'año';

/** Filtro de tipo del gráfico. */
export type ChartTypeFilter = 'todos' | 'alquiler' | 'ventas';

export interface ChartItem {
  label: string;
  sublabel?: string;
  alquiler: number;
  ventas: number;
  equiposAlquiler: string;
  equiposVenta: string;
}

export interface ChartPeriod {
  title: string;
  subtitle: string;
  periodLabel: string;
  maxVal: number;
  items: ChartItem[];
  resumen: {
    totalAlquiler: number;
    totalVentas: number;
    promedioAlquiler: number;
    promedioVentas: number;
  };
}

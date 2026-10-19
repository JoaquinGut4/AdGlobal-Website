/**
 * Tipos compartidos del panel administrativo de AD GLOBAL.
 */

/** Secciones navegables del menú principal del panel. */
export type AdminSection =
  | 'dashboard'
  | 'inventario'
  | 'pedidos'
  | 'clientes'
  | 'movimientos'
  | 'tickets'
  | 'gestion-web'
  | 'configuracion';

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
  area?: TicketArea;
  equipo: string;
  cliente: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  descripcion: string;
  tecnico: string;
  tecnicoTelefono?: string;
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

export type InventarioCategoriaBaseId =
  | 'laptops'
  | 'computadoras'
  | 'monitores'
  | 'tablets'
  | 'televisores'
  | 'impresoras'
  | 'proyectores';

export type InventarioCategoriaId = InventarioCategoriaBaseId | `custom-${string}`;

export interface InventarioCampoPersonalizado {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date';
}

export interface InventarioCategoria {
  id: InventarioCategoriaId;
  label: string;
  codigo: number;
  camposPersonalizados?: InventarioCampoPersonalizado[];
}

/** Registro individual de un activo. Los campos opcionales dependen de su categoría. */
export interface InventarioRegistro {
  id: string;
  categoriaId: InventarioCategoriaId;
  sku: string;
  qr: string;
  foto: string;
  categoria: number;
  item?: string;
  marca: string;
  descripcion: string;
  numeroSerial: string;
  procesador?: string;
  ghz?: string;
  generacion?: string;
  pantalla?: string;
  memoriaRam?: string;
  memoriaInterna?: string;
  tipoMemoriaInterna?: string;
  modelo?: string;
  fechaCompra: string;
  facturaGuiaCompra: string;
  precio: number;
  proveedor: string;
  alquiler?: string;
  estado: string;
  observaciones: string;
  especificacionesPersonalizadas?: Record<string, string>;
}

export type MotivoTraslado =
  | 'Venta'
  | 'Venta con entrega a terceros'
  | 'Venta sujeta a confirmación del cliente'
  | 'Compra'
  | 'Alquiler'
  | 'Devolución'
  | 'Traslado entre establecimientos de una misma empresa'
  | 'Reemplazo de bienes'
  | 'Transformación'
  | 'Recojo de bienes transformados'
  | 'Traslado por emisor itinerante de comprobantes de pago'
  | 'Traslado a zona primaria'
  | 'Importación'
  | 'Exportación';

export interface PedidoRegistro {
  id: string;
  numeroPedido: string;
  fechaEmision: string;
  direccionPartida: string;
  direccionLlegada: string;
  descripcionProductos: string;
  cantidadProductos: number;
  unidadMedida: 'UND';
  motivoTraslado: MotivoTraslado;
  observaciones: string;
}

export type MovimientoModulo = 'Pedidos' | 'Inventario' | 'Tickets';
export type MovimientoAccion = 'Creó' | 'Editó' | 'Eliminó' | 'Agregó' | 'Modificó';

export interface MovimientoAuditoria {
  id: string;
  fecha: string;
  usuario: string;
  modulo: MovimientoModulo;
  accion: MovimientoAccion;
  elemento: string;
  detalle: string;
}

export type WebImageSection = 'hero' | 'servicio' | 'faq';

export interface WebImageAsset {
  id: string;
  section: WebImageSection;
  serviceId?: string;
  name: string;
  dataUrl: string;
  createdAt: string;
}

export interface UsuarioAdministrador {
  id: string;
  nombre: string;
  email: string;
  usuario: string;
  password: string;
  activo: boolean;
  modulos: AdminSection[];
  createdAt: string;
}

/** Cliente corporativo del directorio. */
export interface ClienteCorporativo {
  id: string;
  name: string;
  ruc: string;
  sector: string;
  contacto: string;
  email: string;
  telefono: string;
  eventos: number;
  rating: 'VIP' | 'A+' | 'Estándar';
  ultimaActividad: string;
  estado: 'Activo' | 'Inactivo';
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

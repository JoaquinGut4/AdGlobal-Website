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

export type TicketEstado = 'Abierto' | 'En Diagnóstico' | 'En Reparación' | 'En Reemplazo' | 'Resuelto';
export type TicketTipo = 'pedido' | 'general';

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
  numeroPedidoEstado?: string;
  tipoTicket?: TicketTipo;
  numeroPedido?: string;
  telefonoContacto?: string;
  direccionPedido?: string;
  estadoEquipo?: string;
  equiposIds?: string[];
  /** Estado de cada activo antes de enviarlo a Taller; clave = id del activo. */
  estadosAnteriores?: Record<string, string>;
  reparable?: boolean | null;
  flujo?: 'Pendiente' | 'Reparación' | 'Reemplazo' | 'General';
  equiposReemplazoIds?: string[];
  evidencias?: string[];
  descripcionSolucion?: string;
  fechaResolucion?: string;
  tecnico: string;
  tecnicoTelefono?: string;
  fecha: string;
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
  /** Claves de los campos comunes habilitados. Si se omite, se usan todos. */
  camposBase?: string[];
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
  /** Estado operativo del pedido (independiente del estado de cada activo). */
  estadoPedido?: 'Activo' | 'Finalizado';
  fechaFinalizacion?: string;
  /** Estado de cada equipo antes de asignarlo a este pedido; clave = id del activo. */
  estadosAnteriores?: Record<string, string>;
  fechaEmision: string;
  direccionPartida: string;
  direccionLlegada: string;
  /** Vacío en pedidos creados antes de incorporar el número de contacto. */
  telefonoContacto?: string;
  descripcionProductos: string;
  skus?: string[];
  cantidadProductos: number;
  unidadMedida: 'UND';
  motivoTraslado: MotivoTraslado;
  observaciones: string;
}

export type MovimientoModulo = 'Pedidos' | 'Inventario' | 'Tickets';
export type MovimientoAccion = 'Creó' | 'Editó' | 'Eliminó' | 'Agregó' | 'Modificó' | 'Guardó';

export interface MovimientoAuditoria {
  id: string;
  fecha: string;
  usuario: string;
  modulo: MovimientoModulo;
  accion: MovimientoAccion;
  elemento: string;
  detalle: string;
  ip?: string;
  dispositivo?: string;
}

export interface DashboardResumen {
  inventarioTotal: number;
  inventarioPorEstado: Record<string, number>;
  pedidosTotal: number;
  pedidosActivos: number;
  pedidosFinalizados: number;
  ticketsPorEstado: Record<string, number>;
  clientesTotal: number;
  clientesActivos: number;
  clientesInactivos: number;
  alquileresPorMes: Array<{ periodo: string; alquiler: number; ventas: number }>;
  movimientosRecientes: MovimientoAuditoria[];
}

export type WebImageSection = 'hero' | 'servicio' | 'faq';

export interface WebAsset {
  id: string;
  section: WebImageSection;
  serviceId?: string | null;
  name: string;
  dataUrl: string;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type UsuarioRol = 'Administrador' | 'Soporte' | 'Normal';

export interface UsuarioAdministrador {
  id: string;
  nombre: string;
  email: string;
  usuario: string;
  password?: string;
  rol: UsuarioRol;
  telefono: string;
  superAdmin?: boolean;
  activo: boolean;
  modulos: AdminSection[];
  createdAt: string;
}

export type ClienteEstado = 'Activo' | 'Inactivo';

/** Cliente generado automáticamente a partir de los pedidos registrados. */
export interface ClienteDerivado {
  id: string;
  nombre: string;
  tipo: 'Empresa' | 'Persona natural';
  telefono: string;
  /** Distrito, provincia y departamento del último pedido. */
  ubicacion: string;
  pedidos: number;
  /** Pedidos que aún no han sido finalizados. */
  pedidosVigentes: number;
  ultimaActividad: string;
  estado: ClienteEstado;
  numerosPedido: string[];
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

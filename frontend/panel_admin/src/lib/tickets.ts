import type {
  SupportTicket,
  TicketArea,
  TicketEstado,
  TicketPrioridad,
  TicketTipo,
} from '@/types';

/** Forma en la que el backend devuelve un ticket. */
export interface TicketApiResponse {
  id: string;
  codigo: string;
  area: TicketArea | null;
  equipo: string;
  cliente: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  descripcion: string;
  numeroPedidoEstado: string;
  tipoTicket: TicketTipo | null;
  numeroPedido: string;
  telefonoContacto: string;
  direccionPedido: string;
  estadoEquipo: string;
  tecnico: string;
  tecnicoTelefono?: string;
  equiposIds: string[];
  estadosAnteriores: Record<string, string>;
  reparable?: boolean | null;
  flujo?: 'Pendiente' | 'Reparación' | 'Reemplazo' | 'General';
  equiposReemplazoIds?: string[];
  evidencias?: string[];
  descripcionSolucion?: string;
  fechaResolucion?: string;
  fecha: string;
}

interface LocalTicketLink {
  equiposIds?: string[];
  estadosAnteriores?: Record<string, string>;
}

const fechaFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatFecha(fecha: string): string {
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime()) ? fecha : fechaFormatter.format(parsed);
}

/**
 * Convierte un ticket del servidor al modelo del panel.
 * El vínculo con los equipos del inventario sigue siendo local, así que se
 * conserva desde la copia que ya existía en este navegador.
 */
export function toSupportTicket(
  row: TicketApiResponse,
  local: LocalTicketLink = row,
): SupportTicket {
  return {
    id: row.id,
    codigo: row.codigo,
    area: row.area ?? undefined,
    equipo: row.equipo,
    cliente: row.cliente,
    prioridad: row.prioridad,
    estado: row.estado,
    descripcion: row.descripcion,
    numeroPedidoEstado: row.numeroPedidoEstado,
    tipoTicket: row.tipoTicket ?? undefined,
    numeroPedido: row.numeroPedido,
    telefonoContacto: row.telefonoContacto,
    direccionPedido: row.direccionPedido,
    estadoEquipo: row.estadoEquipo,
    equiposIds: local.equiposIds,
    estadosAnteriores: local.estadosAnteriores,
    reparable: row.reparable,
    flujo: row.flujo,
    equiposReemplazoIds: row.equiposReemplazoIds ?? [],
    evidencias: row.evidencias ?? [],
    descripcionSolucion: row.descripcionSolucion ?? '',
    fechaResolucion: row.fechaResolucion,
    tecnico: row.tecnico,
    tecnicoTelefono: row.tecnicoTelefono,
    fecha: formatFecha(row.fecha),
  };
}

/**
 * El servidor es la fuente de verdad de los tickets; se conservan los vínculos locales.
 * Los tickets creados mientras la lista estaba en vuelo (ids que no existían al
 * iniciar la petición) se mantienen para no perderlos por una respuesta antigua.
 */
export function mergeServerTickets(
  rows: TicketApiResponse[],
  current: SupportTicket[],
  knownAtRequest: ReadonlySet<string> = new Set(),
): SupportTicket[] {
  const localById = new Map(current.map((ticket) => [ticket.id, ticket]));
  const serverIds = new Set(rows.map((row) => row.id));
  const fromServer = rows.map((row) => toSupportTicket(row, localById.get(row.id)));
  const createdDuringRequest = current.filter(
    (ticket) => !serverIds.has(ticket.id) && !knownAtRequest.has(ticket.id),
  );
  return [...createdDuringRequest, ...fromServer];
}

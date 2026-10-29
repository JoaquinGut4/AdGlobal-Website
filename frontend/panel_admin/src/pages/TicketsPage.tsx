import { CheckCircle2, Clock, Eye, Laptop, Plus, Trash2, User, Wrench } from 'lucide-react';
import type { SupportTicket } from '@/types';

interface TicketsPageProps {
  tickets: SupportTicket[];
  onOpenWorkflow: (ticket: SupportTicket) => void;
  onEliminar: (ticket: SupportTicket) => void | Promise<void>;
  onOpenSolution: (ticket: SupportTicket) => void;
  onOpenTicket: () => void;
}

const PRIORIDAD_CLASSES: Record<SupportTicket['prioridad'], string> = {
  Urgente: 'bg-danger/15 text-danger font-mono',
  Alta: 'bg-warning/15 text-warning',
  Media: 'bg-slate-100 text-slate-600',
  Baja: 'bg-slate-100 text-slate-500',
};

const ESTADO_CLASSES: Record<SupportTicket['estado'], string> = {
  Resuelto: 'bg-success/15 text-success',
  'En Reparación': 'bg-warning/15 text-warning',
  'En Reemplazo': 'bg-warning/15 text-warning',
  'En Diagnóstico': 'bg-highlight/25 text-brand',
  Abierto: 'bg-purple-100 text-purple-800',
};

export function TicketsPage({ tickets, onOpenWorkflow, onEliminar, onOpenSolution, onOpenTicket }: TicketsPageProps) {
  const enTaller = tickets.filter((ticket) => ticket.estado !== 'Resuelto').length;
  const abiertos = tickets.filter((t) => t.estado === 'Abierto').length;
  const urgentes = tickets.filter((t) => t.prioridad === 'Urgente' && t.estado !== 'Resuelto').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Tickets de Soporte Técnico & Reparación
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control de incidencias, diagnósticos en taller, mantenimientos y reemplazos express SLA
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenTicket}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 text-warning" />
          <span>Aperturar Nuevo Ticket</span>
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Tickets Totales</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{tickets.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Histórico registrado</p>
        </div>

        <div className="p-4 rounded-xl border border-warning/20 bg-warning/10 shadow-2xs">
          <p className="text-[11px] font-bold text-warning uppercase">En Taller / Diagnóstico</p>
          <p className="text-2xl font-black text-warning mt-0.5">{enTaller}</p>
          <p className="text-[10px] text-warning mt-0.5">En proceso técnico</p>
        </div>

        <div className="p-4 rounded-xl border border-highlight/35 bg-brand-soft/30 shadow-2xs">
          <p className="text-[11px] font-bold text-brand uppercase">Tickets abiertos</p>
          <p className="text-2xl font-black text-brand mt-0.5">{abiertos}</p>
          <p className="text-[10px] text-brand mt-0.5">Pendientes de atención</p>
        </div>

        <div className="p-4 rounded-xl border border-danger/20 bg-danger/10 shadow-2xs">
          <p className="text-[11px] font-bold text-danger uppercase">Prioridad Urgente</p>
          <p className="text-2xl font-black text-danger mt-0.5">{urgentes}</p>
          <p className="text-[10px] text-danger mt-0.5">Atención inmediata SLA</p>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {tickets.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Wrench className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">No hay tickets de soporte registrados</p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              El historial está limpio. Usa “Aperturar Nuevo Ticket” para registrar una incidencia.
            </p>
          </div>
        )}
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-brand bg-brand-soft px-2.5 py-0.5 rounded-md border border-highlight/65">
                  {ticket.codigo}
                </span>
                <span className="text-xs font-bold text-slate-800">{ticket.cliente}</span>
                {ticket.area && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">{ticket.area}</span>
                  </>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    PRIORIDAD_CLASSES[ticket.prioridad]
                  }`}
                >
                  Prioridad: {ticket.prioridad}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    ESTADO_CLASSES[ticket.estado]
                  }`}
                >
                  {ticket.estado}
                </span>
                {ticket.estado === 'Resuelto' ? (
                  <button
                    type="button"
                    onClick={() => onOpenSolution(ticket)}
                    title={`Ver solución de ${ticket.codigo}`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-2 py-1 text-[11px] font-bold text-success transition-colors hover:bg-success/15"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver solución
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenWorkflow(ticket)}
                    title={`Gestionar flujo de ${ticket.codigo}`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-highlight/65 bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand transition-colors hover:bg-highlight/25"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Gestionar flujo
                  </button>
                )}
                {ticket.estado !== 'Resuelto' && (
                  <button
                    type="button"
                    onClick={() => void onEliminar(ticket)}
                    title={`Eliminar ${ticket.codigo}`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-danger/30 bg-danger/10 px-2 py-1 text-[11px] font-bold text-danger transition-colors hover:bg-danger/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>Equipo: {ticket.equipo}</span>
              </p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-sans">
                {ticket.descripcion}
              </p>
              {ticket.numeroPedidoEstado && (
                <p className="text-xs text-slate-600">
                  <span className="font-bold">{ticket.tipoTicket === 'pedido' ? 'Pedido: ' : 'Estado anterior: '}</span>
                  {ticket.numeroPedidoEstado}
                </p>
              )}
              {ticket.telefonoContacto && (
                <p className="text-xs text-slate-600">
                  <span className="font-bold">Contacto: </span>{ticket.telefonoContacto}
                </p>
              )}
              {ticket.direccionPedido && (
                <p className="text-xs text-slate-600">
                  <span className="font-bold">Dirección de llegada: </span>{ticket.direccionPedido}
                </p>
              )}
              {ticket.flujo && ticket.flujo !== 'Pendiente' && <p className="text-xs text-slate-600"><span className="font-bold">Flujo: </span>{ticket.flujo}</p>}
              {ticket.estado === 'Resuelto' && (
                <button
                  type="button"
                  onClick={() => onOpenSolution(ticket)}
                  className="w-full rounded-lg border border-success/20 bg-success/8 p-3 text-left transition-colors hover:bg-success/12"
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Solución registrada
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-slate-700">
                    {ticket.descripcionSolucion?.trim() || 'Sin descripción de solución.'}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-success">
                    <Eye className="h-3 w-3" />
                    Ver descripción y {ticket.evidencias?.length ?? 0} {(ticket.evidencias?.length ?? 0) === 1 ? 'evidencia' : 'evidencias'}
                  </span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600 font-medium">Responsable: {ticket.tecnico}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{ticket.fecha}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

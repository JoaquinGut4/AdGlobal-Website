import { Clock, Laptop, Plus, User, Wrench } from 'lucide-react';
import type { SupportTicket } from '@/types';

interface TicketsPageProps {
  tickets: SupportTicket[];
  onAvanzarEstado: (id: string) => void;
  onOpenTicket: () => void;
}

const PRIORIDAD_CLASSES: Record<SupportTicket['prioridad'], string> = {
  Urgente: 'bg-rose-100 text-rose-700 font-mono',
  Alta: 'bg-amber-100 text-amber-800',
  Media: 'bg-slate-100 text-slate-600',
  Baja: 'bg-slate-100 text-slate-500',
};

const ESTADO_CLASSES: Record<SupportTicket['estado'], string> = {
  Resuelto: 'bg-emerald-100 text-emerald-800',
  'En Reparación': 'bg-amber-100 text-amber-800',
  'En Diagnóstico': 'bg-blue-100 text-[#2B5C94]',
  Abierto: 'bg-purple-100 text-purple-800',
};

export function TicketsPage({ tickets, onAvanzarEstado, onOpenTicket }: TicketsPageProps) {
  const enTaller = tickets.filter(
    (t) => t.estado === 'En Diagnóstico' || t.estado === 'En Reparación'
  ).length;
  const inSitu = tickets.filter((t) => t.area === 'Soporte In-Situ').length;
  const urgentes = tickets.filter((t) => t.prioridad === 'Urgente' && t.estado !== 'Resuelto').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
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
          <Plus className="w-4 h-4 text-amber-400" />
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

        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-700 uppercase">En Taller / Diagnóstico</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{enTaller}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">En proceso técnico</p>
        </div>

        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 shadow-2xs">
          <p className="text-[11px] font-bold text-[#2B5C94] uppercase">Soporte In-Situ</p>
          <p className="text-2xl font-black text-[#2B5C94] mt-0.5">{inSitu}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">Técnicos en campo</p>
        </div>

        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 shadow-2xs">
          <p className="text-[11px] font-bold text-rose-700 uppercase">Prioridad Urgente</p>
          <p className="text-2xl font-black text-rose-600 mt-0.5">{urgentes}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">Atención inmediata SLA</p>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-[#2B5C94] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {ticket.codigo}
                </span>
                <span className="text-xs font-bold text-slate-800">{ticket.cliente}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">{ticket.area}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    PRIORIDAD_CLASSES[ticket.prioridad]
                  }`}
                >
                  Prioridad: {ticket.prioridad}
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    ESTADO_CLASSES[ticket.estado]
                  }`}
                >
                  {ticket.estado}
                </span>
                <button
                  type="button"
                  onClick={() => onAvanzarEstado(ticket.id)}
                  title="Avanzar etapa del ticket"
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Avanzar etapa
                </button>
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
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600 font-medium">Asignado a: {ticket.tecnico}</span>
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

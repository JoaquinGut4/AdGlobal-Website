import { Clock, ExternalLink, FileText, Plus } from 'lucide-react';
import { getServicioNombre } from '@/data/servicios';
import { whatsappLink } from '@/lib/utils';
import type { Cotizacion } from '@/types';

interface CotizacionesPageProps {
  cotizaciones: Cotizacion[];
  onToggleStatus: (id: string) => void;
  onOpenQuote: () => void;
}

function CotizacionCard({
  cotizacion,
  onToggleStatus,
}: {
  cotizacion: Cotizacion;
  onToggleStatus: (id: string) => void;
}) {
  const servicio = getServicioNombre(cotizacion.servicioId);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-900 text-lg">{cotizacion.empresa}</span>
          <span className="text-xs text-slate-500">Contacto: {cotizacion.nombre}</span>
          <span
            className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
              cotizacion.status === 'atendido'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {cotizacion.status}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {cotizacion.createdAt}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
          <span className="text-[#2B5C94] font-semibold">Servicio: {servicio}</span>
          <span>Ciudad: {cotizacion.ciudad}</span>
          {cotizacion.fechas && <span>Fechas tentativas: {cotizacion.fechas}</span>}
        </div>

        <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans leading-relaxed">
          "{cotizacion.mensaje}"
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
          <a
            href={`mailto:${cotizacion.correo}`}
            className="hover:text-[#2B5C94] transition-colors underline"
          >
            {cotizacion.correo}
          </a>
          <span>·</span>
          <a
            href={whatsappLink(cotizacion.telefono, '')}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 transition-colors font-semibold"
          >
            WhatsApp: {cotizacion.telefono}
          </a>
        </div>
      </div>

      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onToggleStatus(cotizacion.id)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            cotizacion.status === 'pendiente'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          {cotizacion.status === 'pendiente' ? 'Marcar como Atendido' : 'Marcar como Pendiente'}
        </button>

        <a
          href={whatsappLink(
            cotizacion.telefono,
            `Hola ${cotizacion.nombre}, te saludamos de AD GLOBAL respecto a tu solicitud de cotización para ${servicio}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200"
        >
          <span>Responder por WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function CotizacionesPage({
  cotizaciones,
  onToggleStatus,
  onOpenQuote,
}: CotizacionesPageProps) {
  const pendientes = cotizaciones.filter((c) => c.status === 'pendiente').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Bandeja de Cotizaciones Web
          </h2>
          <p className="text-xs text-slate-500">
            Todas las solicitudes enviadas por clientes a través del portal de AD GLOBAL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            Total: {cotizaciones.length} · Pendientes: {pendientes}
          </span>
          <button
            type="button"
            onClick={onOpenQuote}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B5C94] hover:bg-[#1F4778] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aperturar Cotización</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {cotizaciones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No hay cotizaciones registradas</p>
            <p className="text-xs text-slate-400 mt-1">
              Las solicitudes del portal público aparecerán aquí.
            </p>
          </div>
        ) : (
          cotizaciones.map((cotizacion) => (
            <CotizacionCard
              key={cotizacion.id}
              cotizacion={cotizacion}
              onToggleStatus={onToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

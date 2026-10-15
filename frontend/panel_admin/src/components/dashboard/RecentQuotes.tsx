import { Clock } from 'lucide-react';
import type { Cotizacion } from '@/types';

interface RecentQuotesProps {
  cotizaciones: Cotizacion[];
  onToggleStatus: (id: string) => void;
}

export function RecentQuotes({ cotizaciones, onToggleStatus }: RecentQuotesProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Solicitudes Recientes de Cotización
          </h3>
          <p className="text-xs text-slate-500">
            Atención prioritaria para alquiler corporativo de equipamiento
          </p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
          {cotizaciones.length} solicitudes
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {cotizaciones.slice(0, 3).map((cotizacion) => (
          <div
            key={cotizacion.id}
            className="py-3.5 flex items-center justify-between gap-4"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">{cotizacion.empresa}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    cotizacion.status === 'atendido'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {cotizacion.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{cotizacion.mensaje}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {cotizacion.createdAt}
                </span>
                <span>·</span>
                <span>{cotizacion.ciudad}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleStatus(cotizacion.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                cotizacion.status === 'pendiente'
                  ? 'bg-[#2B5C94] text-white hover:bg-[#1F4778]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cotizacion.status === 'pendiente' ? 'Atender' : 'Archivado'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

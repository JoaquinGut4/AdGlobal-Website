import { FileSpreadsheet } from 'lucide-react';
import { PRESUPUESTOS_METRICS } from '@/data/presupuestos';

export function PresupuestosPage() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Generador de Presupuestos & Proformas
          </h2>
          <p className="text-xs text-slate-500">
            Emisión instantánea con membrete de AD GLOBAL PERÚ, IGV y condiciones comerciales
          </p>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Módulo Integrado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRESUPUESTOS_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
          >
            <span className="text-xs font-bold text-slate-500 uppercase">{metric.label}</span>
            <p
              className={`text-3xl font-extrabold font-sans ${
                metric.tone === 'brand' ? 'text-[#2B5C94]' : 'text-slate-900'
              }`}
            >
              {metric.value}
            </p>
            <p
              className={`text-xs font-semibold ${
                metric.tone === 'positive' ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {metric.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-6 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#2B5C94] flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            Módulo en preparación (Fase 3)
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            La generación automática de PDF con membrete corporativo, IGV y plantillas de
            condiciones comerciales se conectará al backend en la siguiente fase. Las métricas
            mostradas son de referencia.
          </p>
        </div>
      </div>
    </div>
  );
}

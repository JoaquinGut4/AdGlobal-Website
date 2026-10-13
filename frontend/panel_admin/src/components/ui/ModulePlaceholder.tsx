import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock3 } from 'lucide-react';

interface ModulePlaceholderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  capabilities: string[];
}

/**
 * Estructura base para los módulos del menú que aún no tienen operación completa.
 * Presenta el propósito del módulo y sus capacidades planificadas.
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  subtitle,
  capabilities,
}: ModulePlaceholderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#2B5C94]/10 text-[#2B5C94] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          <Clock3 className="w-3.5 h-3.5" />
          En preparación
        </span>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Capacidades del módulo
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {capabilities.map((capability) => (
            <div
              key={capability}
              className="flex items-start gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700 leading-relaxed">
                {capability}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#2B5C94] flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Módulo en preparación (siguiente fase)</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            La estructura de este módulo ya está integrada en el menú principal. La operación
            completa y la conexión con datos reales se habilitarán al conectar el backend.
          </p>
        </div>
      </div>
    </div>
  );
}

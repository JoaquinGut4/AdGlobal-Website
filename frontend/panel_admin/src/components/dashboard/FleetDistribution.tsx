import type { ReactNode } from 'react';
import { ArrowRight, Building2, Layers, Truck, Wrench } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { porcentajeFlota, resumirFlota } from '@/lib/inventorySummary';
import type { InventarioFiltro, InventarioRegistro } from '@/types';

interface FleetDistributionProps {
  registrosInventario: InventarioRegistro[];
  onVerFiltro: (filtro: InventarioFiltro) => void;
}

interface FleetBoxProps {
  icon: ReactNode;
  label: string;
  value: number;
  total: number;
  percent: number;
  percentLabel: string;
  footerLeft: string;
  footerRight: string;
  /** Clases explícitas para que Tailwind las detecte. */
  boxHover: string;
  iconIdle: string;
  iconHover: string;
  badge: string;
  barFill: string;
  labelHover: string;
  footerAccent: string;
  linkColor: string;
  onClick: () => void;
}

function FleetBox({
  icon,
  label,
  value,
  total,
  percent,
  percentLabel,
  footerLeft,
  footerRight,
  boxHover,
  iconIdle,
  iconHover,
  badge,
  barFill,
  labelHover,
  footerAccent,
  linkColor,
  onClick,
}: FleetBoxProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick();
      }}
      className={`bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group relative ${boxHover}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shadow-2xs transition-colors ${iconIdle} ${iconHover}`}
          >
            {icon}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${barFill}`} />
            {percentLabel} de flota
          </span>
        </div>

        <p
          className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors ${labelHover}`}
        >
          {label}
        </p>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            {value}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            / {total} equipos
          </span>
        </div>

        <div className="mt-2.5">
          <ProgressBar percent={percent} fillClass={barFill} />
        </div>
      </div>

      <div>
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-slate-600 font-medium">{footerLeft}</span>
          <span className={`font-semibold ${footerAccent}`}>{footerRight}</span>
        </div>

        <div
          className={`mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-semibold ${linkColor}`}
        >
          <span>Ver más detalles en inventario</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

export function FleetDistribution({ registrosInventario, onVerFiltro }: FleetDistributionProps) {
  const flota = resumirFlota(registrosInventario);
  const pctAlquiler = Math.round(porcentajeFlota(flota.alquiler, flota.total) * 10) / 10;
  const pctOficina = Math.round(porcentajeFlota(flota.oficina, flota.total) * 10) / 10;
  const pctTaller = Math.round(porcentajeFlota(flota.taller, flota.total) * 10) / 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2B5C94]/10 text-[#2B5C94] flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Distribución de Equipos en Flota
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2B5C94] border border-blue-200">
                Total: {flota.total} unidades
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sincronizado con Control de Inventario · Haz clic en un recuadro para ver el detalle
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onVerFiltro('all')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2B5C94]/10 hover:bg-[#2B5C94] text-[#2B5C94] hover:text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto group"
        >
          <span>Ir a Control de Inventario</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 bg-slate-50/40">
        <FleetBox
          icon={<Truck className="w-5 h-5" />}
          label="Equipos en alquiler"
          value={flota.alquiler}
          total={flota.total}
          percent={pctAlquiler}
          percentLabel={`${pctAlquiler}%`}
          footerLeft={flota.alquiler > 0 ? 'Servicios de alquiler' : 'Sin equipos en alquiler'}
          footerRight="En campo y eventos"
          boxHover="hover:border-[#2B5C94]"
          iconIdle="bg-blue-50 text-[#2B5C94] border-blue-100"
          iconHover="group-hover:bg-[#2B5C94] group-hover:text-white"
          badge="bg-blue-50 text-[#2B5C94] border-blue-200"
          barFill="bg-[#2B5C94]"
          labelHover="group-hover:text-[#2B5C94]"
          footerAccent="text-[#2B5C94]"
          linkColor="text-[#2B5C94] group-hover:text-[#1F4778]"
          onClick={() => onVerFiltro('alquiler')}
        />

        <FleetBox
          icon={<Building2 className="w-5 h-5" />}
          label="Equipos en oficina"
          value={flota.oficina}
          total={flota.total}
          percent={pctOficina}
          percentLabel={`${pctOficina}%`}
          footerLeft={flota.oficina > 0 ? 'Listos para entrega' : 'Sin equipos en oficina'}
          footerRight="Almacén central"
          boxHover="hover:border-emerald-500"
          iconIdle="bg-emerald-50 text-emerald-600 border-emerald-100"
          iconHover="group-hover:bg-emerald-600 group-hover:text-white"
          badge="bg-emerald-50 text-emerald-700 border-emerald-200"
          barFill="bg-emerald-600"
          labelHover="group-hover:text-emerald-700"
          footerAccent="text-emerald-700"
          linkColor="text-emerald-700 group-hover:text-emerald-800"
          onClick={() => onVerFiltro('oficina')}
        />

        <FleetBox
          icon={<Wrench className="w-5 h-5" />}
          label="Equipos en taller"
          value={flota.taller}
          total={flota.total}
          percent={pctTaller}
          percentLabel={`${pctTaller}%`}
          footerLeft={flota.taller > 0 ? 'En revisión técnica' : 'Sin equipos en taller'}
          footerRight="Laboratorio & calibración"
          boxHover="hover:border-amber-500"
          iconIdle="bg-amber-50 text-amber-600 border-amber-100"
          iconHover="group-hover:bg-amber-600 group-hover:text-white"
          badge="bg-amber-50 text-amber-700 border-amber-200"
          barFill="bg-amber-500"
          labelHover="group-hover:text-amber-700"
          footerAccent="text-amber-700"
          linkColor="text-amber-700 group-hover:text-amber-800"
          onClick={() => onVerFiltro('taller')}
        />
      </div>
    </div>
  );
}

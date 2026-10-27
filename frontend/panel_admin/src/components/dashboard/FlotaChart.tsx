import { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { construirAnaliticaPedidos } from '@/lib/orderAnalytics';
import type { PedidoRegistro, StatsPeriodo } from '@/types';

interface FlotaChartProps {
  pedidos: PedidoRegistro[];
}

const PERIODOS: { id: StatsPeriodo; label: string }[] = [
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'año', label: 'Año' },
];

export function FlotaChart({ pedidos }: FlotaChartProps) {
  const [period, setPeriod] = useState<StatsPeriodo>('mes');

  const data = useMemo(() => construirAnaliticaPedidos(pedidos, period), [pedidos, period]);
  const totalComparativo = data.resumen.totalAlquiler + data.resumen.totalVentas;
  const hasData = data.items.length > 0 && totalComparativo > 0;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2B5C94] flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{data.title}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {data.periodLabel}: {period.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.subtitle} · Comparativa en unidades operadas de pedidos
            </p>
          </div>
        </div>

        <div className="flex items-center flex-nowrap gap-2.5 overflow-x-auto pb-0.5 max-w-full shrink-0">
          {/* Selector de periodo */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shadow-2xs shrink-0">
            {PERIODOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  period === item.id
                    ? 'bg-white text-[#2B5C94] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Diagrama de barras */}
      <div className="pt-2">
        <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2 relative">
          <div className="absolute right-0 top-0 z-20 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-2xs">
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-xs bg-[#2B5C94]" />Alquiler</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />Ventas</span>
          </div>
          <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-slate-400 border-dashed w-full" />
            <div className="border-b border-slate-400 border-dashed w-full" />
            <div className="border-b border-slate-400 border-dashed w-full" />
            <div className="border-b border-slate-400 border-dashed w-full" />
          </div>

          {hasData ? data.items.map((item) => {
            const hAlquiler =
              item.alquiler === 0 ? 0 : Math.min(100, Math.max(8, (item.alquiler / data.maxVal) * 100));
            const hVentas =
              item.ventas === 0 ? 0 : Math.min(100, Math.max(8, (item.ventas / data.maxVal) * 100));

            return (
              <div
                key={item.label}
                className="flex-1 flex flex-col items-center h-full justify-end group relative z-10"
              >
                {/* Tooltip */}
                <div className="absolute -top-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900 text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-xl whitespace-nowrap z-30">
                  <p className="font-bold text-white text-center border-b border-slate-700 pb-0.5 mb-1">
                    {item.label} {item.sublabel ? `· ${item.sublabel}` : ''}
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-blue-300 flex items-center justify-between gap-3">
                      <span>Alquiler:</span>
                      <strong className="font-mono text-white">{item.alquiler} uds</strong>
                    </p>
                    <p className="text-emerald-300 flex items-center justify-between gap-3">
                      <span>Ventas:</span>
                      <strong className="font-mono text-white">{item.ventas} uds</strong>
                    </p>
                  </div>
                </div>

                <div className="w-full flex items-end justify-center gap-2 sm:gap-3.5 h-full pb-1">
                  {item.alquiler > 0 && (
                    <div
                      style={{ height: `${hAlquiler}%` }}
                      className="w-3.5 sm:w-6 bg-gradient-to-t from-[#1F4778] to-[#2B5C94] hover:to-[#3878BE] rounded-t-md transition-all duration-300 relative group/bar cursor-pointer shadow-xs flex flex-col justify-between items-center pb-1 shrink-0"
                    >
                      <span className="text-[9px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {item.alquiler}
                      </span>
                    </div>
                  )}

                  {item.ventas > 0 && (
                    <div
                      style={{ height: `${hVentas}%` }}
                      className="w-3.5 sm:w-6 bg-gradient-to-t from-emerald-700 to-emerald-500 hover:to-emerald-400 rounded-t-md transition-all duration-300 relative group/bar cursor-pointer shadow-xs flex flex-col justify-between items-center pb-1 shrink-0"
                    >
                      <span className="text-[9px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {item.ventas}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center mt-2">
                  <span className="block text-xs font-bold text-slate-800">{item.label}</span>
                  {item.sublabel && (
                    <span className="block text-[10px] text-slate-400 font-medium">
                      {item.sublabel}
                    </span>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
              <BarChart3 className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">Sin movimientos registrados</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Las métricas aparecerán cuando se registren alquileres o ventas.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

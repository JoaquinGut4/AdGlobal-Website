import { useState } from 'react';
import { BarChart3, ChevronRight, Laptop, Truck } from 'lucide-react';
import { ANALYTICS_BY_PERIOD } from '@/data/analytics';
import type { ChartTypeFilter, StatsPeriodo } from '@/types';

interface FlotaChartProps {
  onVerInventario: () => void;
}

const PERIODOS: { id: StatsPeriodo; label: string }[] = [
  { id: 'semana', label: 'Por Semana' },
  { id: 'mes', label: 'Mensual' },
  { id: 'año', label: 'Por Año' },
];

export function FlotaChart({ onVerInventario }: FlotaChartProps) {
  const [period, setPeriod] = useState<StatsPeriodo>('mes');
  const [typeFilter, setTypeFilter] = useState<ChartTypeFilter>('todos');

  const data = ANALYTICS_BY_PERIOD[period];
  const totalComparativo = data.resumen.totalAlquiler + data.resumen.totalVentas;
  const pctAlquiler = Math.round((data.resumen.totalAlquiler / totalComparativo) * 100);
  const pctVentas = Math.round((data.resumen.totalVentas / totalComparativo) * 100);

  const showAlquiler = typeFilter === 'todos' || typeFilter === 'alquiler';
  const showVentas = typeFilter === 'todos' || typeFilter === 'ventas';

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
              {data.subtitle} · Comparativa en unidades operadas
            </p>
          </div>
        </div>

        <div className="flex items-center flex-nowrap gap-2.5 sm:gap-3 overflow-x-auto pb-0.5 max-w-full shrink-0">
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

          {/* Filtro de tipo */}
          <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setTypeFilter('todos')}
              title="Ver ambos"
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                typeFilter === 'todos'
                  ? 'bg-white text-slate-800 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter(typeFilter === 'alquiler' ? 'todos' : 'alquiler')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === 'alquiler'
                  ? 'bg-[#2B5C94] text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-[#2B5C94]" />
              <span>Alquiler</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter(typeFilter === 'ventas' ? 'todos' : 'ventas')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === 'ventas'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>Ventas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Total en Alquiler</p>
            <p className="text-xl font-black text-[#2B5C94] tracking-tight">
              {data.resumen.totalAlquiler.toLocaleString()}
              <span className="text-[10px] font-normal text-slate-500 ml-1">uds</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2B5C94] flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Total en Ventas</p>
            <p className="text-xl font-black text-emerald-600 tracking-tight">
              {data.resumen.totalVentas.toLocaleString()}
              <span className="text-[10px] font-normal text-slate-500 ml-1">uds</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Laptop className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Promedio Alquiler</p>
            <p className="text-lg font-extrabold text-slate-800 tracking-tight">
              ~{data.resumen.promedioAlquiler.toLocaleString()}
              <span className="text-[10px] font-normal text-slate-400 ml-1">/ {period}</span>
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
            {pctAlquiler}%
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Promedio Ventas</p>
            <p className="text-lg font-extrabold text-slate-800 tracking-tight">
              ~{data.resumen.promedioVentas.toLocaleString()}
              <span className="text-[10px] font-normal text-slate-400 ml-1">/ {period}</span>
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            {pctVentas}%
          </span>
        </div>
      </div>

      {/* Diagrama de barras */}
      <div className="pt-2">
        <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2 relative">
          <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-slate-400 border-dashed w-full" />
            <div className="border-b border-slate-400 border-dashed w-full" />
            <div className="border-b border-slate-400 border-dashed w-full" />
            <div className="border-b border-slate-400 border-dashed w-full" />
          </div>

          {data.items.map((item) => {
            const hAlquiler = Math.min(100, Math.max(12, (item.alquiler / data.maxVal) * 100));
            const hVentas = Math.min(100, Math.max(10, (item.ventas / data.maxVal) * 100));

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
                  {showAlquiler && (
                    <div
                      style={{ height: `${hAlquiler}%` }}
                      className="w-3.5 sm:w-6 bg-gradient-to-t from-[#1F4778] to-[#2B5C94] hover:to-[#3878BE] rounded-t-md transition-all duration-300 relative group/bar cursor-pointer shadow-xs flex flex-col justify-between items-center pb-1 shrink-0"
                    >
                      <span className="text-[9px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {item.alquiler}
                      </span>
                    </div>
                  )}

                  {showVentas && (
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
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B5C94]" />
            <strong className="text-slate-700">Equipos en Alquiler:</strong> Laptops, Pantallas LED,
            Tablets, Sonido
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <strong className="text-slate-700">Equipos en Venta:</strong> Laptops corporativas,
            Monitores, Redes
          </span>
        </div>

        <button
          type="button"
          onClick={onVerInventario}
          className="text-[#2B5C94] hover:text-[#1F4778] font-bold inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto group"
        >
          <span>Ver stock detallado en Inventario</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

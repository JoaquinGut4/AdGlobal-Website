import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Laptop,
  Monitor,
  Package,
  Printer,
  Search,
  Tablet,
  Truck,
  Volume2,
  Wrench,
} from 'lucide-react';
import { StackedDistribution } from '@/components/ui/ProgressBar';
import { FLOTA_RESUMEN, INVENTARIO_DATA, porcentajeFlota } from '@/data/inventario';
import type { InventarioFiltro, InventarioIcon, InventarioItem } from '@/types';

interface InventarioPageProps {
  filtro: InventarioFiltro;
  onFiltroChange: (filtro: InventarioFiltro) => void;
}

function InventarioIcono({ icon }: { icon: InventarioIcon }) {
  switch (icon) {
    case 'laptop':
      return <Laptop className="w-5 h-5" />;
    case 'monitor':
      return <Monitor className="w-5 h-5" />;
    case 'tablet':
      return <Tablet className="w-5 h-5" />;
    case 'volume':
      return <Volume2 className="w-5 h-5" />;
    case 'printer':
      return <Printer className="w-5 h-5" />;
    case 'package':
      return <Package className="w-5 h-5" />;
  }
}

const FILTROS: { id: InventarioFiltro; label: string }[] = [
  { id: 'all', label: `Todos (${INVENTARIO_DATA.length})` },
  { id: 'alquiler', label: 'En Alquiler' },
  { id: 'oficina', label: 'En Oficina' },
  { id: 'taller', label: 'En Taller' },
];

function InventarioResumen({
  filtro,
  onFiltroChange,
}: {
  filtro: InventarioFiltro;
  onFiltroChange: (filtro: InventarioFiltro) => void;
}) {
  const pctAlquiler = Math.round(porcentajeFlota(FLOTA_RESUMEN.alquiler) * 10) / 10;
  const pctOficina = Math.round(porcentajeFlota(FLOTA_RESUMEN.oficina) * 10) / 10;
  const pctTaller = Math.round(porcentajeFlota(FLOTA_RESUMEN.taller) * 10) / 10;

  const toggle = (target: InventarioFiltro) =>
    onFiltroChange(filtro === target ? 'all' : target);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={() => toggle('alquiler')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          filtro === 'alquiler'
            ? 'bg-blue-50/80 border-[#2B5C94] ring-2 ring-[#2B5C94]/20 shadow-xs'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2B5C94] border border-blue-100 flex items-center justify-center font-bold">
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2B5C94] border border-blue-200">
            {pctAlquiler}% de flota
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Equipos en Alquiler
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-slate-900">{FLOTA_RESUMEN.alquiler}</span>
          <span className="text-xs text-slate-400">/ {FLOTA_RESUMEN.total} unidades</span>
        </div>
        <p className="text-[11px] text-[#2B5C94] font-medium mt-1">
          38 servicios activos en campo
        </p>
      </button>

      <button
        type="button"
        onClick={() => toggle('oficina')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          filtro === 'oficina'
            ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {pctOficina}% de flota
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Equipos en Oficina
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-slate-900">{FLOTA_RESUMEN.oficina}</span>
          <span className="text-xs text-slate-400">/ {FLOTA_RESUMEN.total} unidades</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium mt-1">
          Listos para despacho en almacén
        </p>
      </button>

      <button
        type="button"
        onClick={() => toggle('taller')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          filtro === 'taller'
            ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
            : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {pctTaller}% de flota
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Equipos en Taller
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-slate-900">{FLOTA_RESUMEN.taller}</span>
          <span className="text-xs text-slate-400">/ {FLOTA_RESUMEN.total} unidades</span>
        </div>
        <p className="text-[11px] text-amber-700 font-medium mt-1">
          En calibración y mantenimiento
        </p>
      </button>
    </div>
  );
}

function InventarioFila({
  item,
  isExpanded,
  onToggle,
}: {
  item: InventarioItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const alquilerPercent = Math.round((item.alquiler / item.total) * 100);
  const oficinaPercent = Math.round((item.oficina / item.total) * 100);
  const tallerPercent = Math.round((item.taller / item.total) * 100);

  return (
    <div className="transition-colors hover:bg-slate-50/60">
      <div className="p-4 sm:p-5 lg:grid lg:grid-cols-12 gap-3 items-center">
        <div className="lg:col-span-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#2B5C94] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <InventarioIcono icon={item.iconName} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.specs}</p>
          </div>
        </div>

        <div className="mt-3 lg:mt-0 lg:col-span-1 text-left lg:text-center">
          <span className="lg:hidden text-xs font-bold text-slate-400 mr-2">Total:</span>
          <span className="font-mono font-black text-slate-800 text-sm">{item.total}</span>
          <span className="text-[10px] text-slate-400 block">{item.unit}</span>
        </div>

        <div className="mt-2 lg:mt-0 lg:col-span-2 text-left lg:text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-[#2B5C94]" />
            <span className="font-bold text-[#2B5C94] text-xs font-mono">
              {item.alquiler} ({alquilerPercent}%)
            </span>
          </div>
        </div>

        <div className="mt-2 lg:mt-0 lg:col-span-2 text-left lg:text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-bold text-emerald-700 text-xs font-mono">
              {item.oficina} ({oficinaPercent}%)
            </span>
          </div>
        </div>

        <div className="mt-2 lg:mt-0 lg:col-span-1 text-left lg:text-center">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-700" />
            <span className="font-bold text-amber-700 text-xs font-mono">{item.taller}</span>
          </div>
        </div>

        <div className="mt-2 lg:mt-0 lg:col-span-1 text-left lg:text-center">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            {item.dispPercent}%
          </span>
        </div>

        <div className="mt-3 lg:mt-0 lg:col-span-1 text-right">
          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isExpanded
                ? 'bg-[#2B5C94] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>{isExpanded ? 'Ocultar' : 'Detalles'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-2">
        <StackedDistribution
          segments={[
            {
              percent: alquilerPercent,
              fillClass: 'bg-[#2B5C94]',
              title: `En alquiler: ${alquilerPercent}%`,
            },
            {
              percent: oficinaPercent,
              fillClass: 'bg-emerald-500',
              title: `En oficina: ${oficinaPercent}%`,
            },
            {
              percent: tallerPercent,
              fillClass: 'bg-amber-500',
              title: `En taller: ${tallerPercent}%`,
            },
          ]}
        />
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-2 bg-slate-50/70 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2">
            <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#2B5C94] text-xs font-bold">
                <Truck className="w-4 h-4" />
                <span>
                  Distribución en Alquiler ({item.alquiler} {item.unit})
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item.proyectosAlquiler}</p>
              <span className="inline-block text-[10px] font-semibold text-[#2B5C94] bg-blue-50 px-2 py-0.5 rounded">
                SLA activo 24/7 y reemplazo express
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <Building2 className="w-4 h-4" />
                <span>
                  Stock en Oficina ({item.oficina} {item.unit})
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item.ubicacionOficina}</p>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Listos para entrega inmediata y configuración previa
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                <Wrench className="w-4 h-4" />
                <span>
                  En Taller Técnico ({item.taller} {item.unit})
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item.diagnosticoTaller}</p>
              <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Retorno estimado: 24 a 48 horas
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InventarioPage({ filtro, onFiltroChange }: InventarioPageProps) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const visibles = INVENTARIO_DATA.filter((item) => {
    const matchesSearch =
      query.length === 0 ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.specs.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (filtro === 'alquiler') return item.alquiler > 0;
    if (filtro === 'oficina') return item.oficina > 0;
    if (filtro === 'taller') return item.taller > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Control de Inventario de Equipos
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2B5C94] border border-blue-200">
            {FLOTA_RESUMEN.total} equipos registrados
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Disponibilidad y distribución en tiempo real: Equipos en Alquiler, Oficina y Taller
        </p>
      </div>

      <InventarioResumen filtro={filtro} onFiltroChange={onFiltroChange} />

      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar equipo, categoría o modelo..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2B5C94] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Filtrar:</span>
          {FILTROS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFiltroChange(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filtro === item.id
                  ? 'bg-[#2B5C94] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
          {(search.length > 0 || filtro !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                onFiltroChange('all');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-4">Equipo / Especificación</div>
          <div className="col-span-1 text-center">Total</div>
          <div className="col-span-2 text-center text-[#2B5C94]">En Alquiler</div>
          <div className="col-span-2 text-center text-emerald-700">En Oficina</div>
          <div className="col-span-1 text-center text-amber-700">En Taller</div>
          <div className="col-span-1 text-center">Disp.</div>
          <div className="col-span-1 text-right">Detalle</div>
        </div>

        <div className="divide-y divide-slate-100">
          {visibles.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No se encontraron equipos con los criterios seleccionados.
            </div>
          ) : (
            visibles.map((item) => (
              <InventarioFila
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

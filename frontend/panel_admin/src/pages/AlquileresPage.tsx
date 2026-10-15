import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Package,
  Search,
} from 'lucide-react';
import { STORAGE_KEYS } from '@/config/site';
import { ALQUILERES_SEED } from '@/data/alquileres';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AlquilerEstado, AlquilerRegistro } from '@/types';

type EstadoFiltro = 'all' | AlquilerEstado;

const ESTADO_FILTROS: Array<{ id: EstadoFiltro; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'Reservado', label: 'Reservados' },
  { id: 'Activo', label: 'Activos' },
  { id: 'Por vencer', label: 'Por vencer' },
  { id: 'Vencido', label: 'Vencidos' },
  { id: 'Devuelto', label: 'Devueltos' },
];

const moneyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function normalizar(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function diasEntre(inicio: string, fin: string) {
  const start = new Date(`${inicio}T00:00:00Z`).getTime();
  const end = new Date(`${fin}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

function EstadoBadge({ estado }: { estado: AlquilerEstado }) {
  const tones: Record<AlquilerEstado, string> = {
    Reservado: 'border-violet-200 bg-violet-50 text-violet-700',
    Activo: 'border-blue-200 bg-blue-50 text-[#2B5C94]',
    'Por vencer': 'border-amber-200 bg-amber-50 text-amber-700',
    Vencido: 'border-rose-200 bg-rose-50 text-rose-700',
    Devuelto: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${tones[estado]}`}>
      {estado}
    </span>
  );
}

export function AlquileresPage() {
  const [alquileres] = useLocalStorage<AlquilerRegistro[]>(
    STORAGE_KEYS.alquileres,
    ALQUILERES_SEED,
  );
  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas las categorías');
  const [estadoActivo, setEstadoActivo] = useState<EstadoFiltro>('all');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const categorias = [
    'Todas las categorías',
    ...Array.from(new Set(alquileres.map((item) => item.categoria))).sort(),
  ];
  const terminos = normalizar(search).trim().split(/\s+/).filter(Boolean);
  const visibles = alquileres.filter((item) => {
    if (categoriaActiva !== 'Todas las categorías' && item.categoria !== categoriaActiva) return false;
    if (estadoActivo !== 'all' && item.estado !== estadoActivo) return false;
    if (terminos.length === 0) return true;
    const contenido = normalizar([
      ...Object.values(item),
      moneyFormatter.format(item.tarifa),
      moneyFormatter.format(item.deposito),
    ].join(' '));
    return terminos.every((termino) => contenido.includes(termino));
  });

  const activos = alquileres.filter((item) => item.estado === 'Activo').length;
  const porVencer = alquileres.filter((item) => item.estado === 'Por vencer').length;
  const vencidos = alquileres.filter((item) => item.estado === 'Vencido').length;
  const facturacionActiva = alquileres
    .filter((item) => item.estado === 'Activo' || item.estado === 'Por vencer')
    .reduce((total, item) => total + item.tarifa, 0);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) setIsCategoryMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const metricas = [
    {
      id: 'Activo' as const,
      label: 'Alquileres activos',
      value: activos,
      detail: `${moneyFormatter.format(facturacionActiva)} en contratos vigentes`,
      icon: CalendarCheck,
      active: 'border-[#2B5C94] bg-blue-50/80 ring-[#2B5C94]/20',
      iconTone: 'border-blue-100 bg-blue-50 text-[#2B5C94]',
      badge: 'border-blue-200 bg-blue-50 text-[#2B5C94]',
    },
    {
      id: 'Por vencer' as const,
      label: 'Próximos a vencer',
      value: porVencer,
      detail: 'Requieren devolución o renovación',
      icon: CalendarClock,
      active: 'border-amber-500 bg-amber-50/80 ring-amber-500/20',
      iconTone: 'border-amber-100 bg-amber-50 text-amber-700',
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
      id: 'Vencido' as const,
      label: 'Alquileres vencidos',
      value: vencidos,
      detail: 'Pendientes de recojo o regularización',
      icon: AlertTriangle,
      active: 'border-rose-500 bg-rose-50/80 ring-rose-500/20',
      iconTone: 'border-rose-100 bg-rose-50 text-rose-700',
      badge: 'border-rose-200 bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Control de Alquileres de Equipos
              </h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
                {alquileres.length} contratos registrados
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Reservas, contratos, periodos, responsables y devoluciones de equipos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metricas.map((metrica) => {
          const Icon = metrica.icon;
          const selected = estadoActivo === metrica.id;
          return (
            <button
              key={metrica.id}
              type="button"
              onClick={() => setEstadoActivo(selected ? 'all' : metrica.id)}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                selected
                  ? `${metrica.active} ring-2 shadow-xs`
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${metrica.iconTone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${metrica.badge}`}>
                  {alquileres.length === 0 ? 0 : Math.round((metrica.value / alquileres.length) * 100)}% del total
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{metrica.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{metrica.value}</span>
                <span className="text-xs text-slate-400">/ {alquileres.length} contratos</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{metrica.detail}</p>
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Contratos de alquiler</h3>
              <p className="text-[11px] text-slate-500">
                Consulta asignaciones, periodos, importes y estado de devolución.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
              {categorias.length - 1} categorías
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="flex w-full min-w-0 items-center gap-2 sm:max-w-2xl sm:flex-1">
            <div ref={categoryMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={isCategoryMenuOpen}
                className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-bold ${
                  isCategoryMenuOpen
                    ? 'border-[#2B5C94] bg-blue-50 text-[#2B5C94]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{categoriaActiva}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryMenuOpen && (
                <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Filtrar categoría
                  </div>
                  {categorias.map((item) => {
                    const selected = categoriaActiva === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        onClick={() => {
                          setCategoriaActiva(item);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                          selected
                            ? 'bg-blue-50 font-bold text-[#2B5C94]'
                            : 'font-semibold text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex-1">{item}</span>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Contrato, cliente, RUC, equipo, SKU, serie..."
                aria-label="Buscar alquileres"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-[#2B5C94] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ESTADO_FILTROS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEstadoActivo(item.id)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  estadoActivo === item.id
                    ? 'bg-[#2B5C94] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">{categoriaActiva}</span>
            {estadoActivo !== 'all' && <EstadoBadge estado={estadoActivo} />}
          </div>
          <span className="text-[11px] text-slate-500">
            {visibles.length} {visibles.length === 1 ? 'contrato visible' : 'contratos visibles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {['Contrato', 'Cliente / Proyecto', 'Categoría', 'Equipo / Identificación', 'Cantidad', 'Periodo', 'Duración', 'Ubicación', 'Responsable', 'Tarifa', 'Depósito', 'Estado', 'Observaciones'].map((label, index) => (
                  <th key={label} scope="col" className={`whitespace-nowrap px-3 py-3 ${index === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : ''}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {visibles.length === 0 ? (
                <tr><td colSpan={13} className="px-6 py-12 text-center text-sm text-slate-500">No se encontraron alquileres con los criterios seleccionados.</td></tr>
              ) : (
                visibles.map((item) => (
                  <tr key={item.id} className="group hover:bg-blue-50/30">
                    <td className="sticky left-0 z-10 min-w-36 bg-white px-3 py-3 align-top font-mono font-bold text-[#2B5C94] shadow-[1px_0_0_#f1f5f9] group-hover:bg-[#f8fbff]">{item.contrato}</td>
                    <td className="min-w-56 px-3 py-3 align-top"><p className="font-bold text-slate-800">{item.cliente}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.proyecto}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">RUC {item.ruc}</p></td>
                    <td className="min-w-28 whitespace-nowrap px-3 py-3 align-top font-semibold">{item.categoria}</td>
                    <td className="min-w-56 px-3 py-3 align-top"><p className="font-semibold text-slate-800">{item.equipo}</p><p className="mt-0.5 font-mono text-[10px] text-slate-500">{item.sku} · {item.numeroSerial}</p></td>
                    <td className="min-w-20 whitespace-nowrap px-3 py-3 align-top text-center font-mono font-bold text-slate-800">{item.cantidad}</td>
                    <td className="min-w-44 whitespace-nowrap px-3 py-3 align-top"><p>{dateFormatter.format(new Date(`${item.fechaInicio}T00:00:00Z`))}</p><p className="text-[10px] text-slate-400">hasta {dateFormatter.format(new Date(`${item.fechaFin}T00:00:00Z`))}</p></td>
                    <td className="min-w-24 whitespace-nowrap px-3 py-3 align-top"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{diasEntre(item.fechaInicio, item.fechaFin)} días</span></td>
                    <td className="min-w-40 px-3 py-3 align-top">{item.ubicacion}</td>
                    <td className="min-w-44 px-3 py-3 align-top"><p className="font-semibold text-slate-800">{item.responsable}</p><p className="text-[10px] text-slate-500">{item.telefono}</p></td>
                    <td className="min-w-32 whitespace-nowrap px-3 py-3 align-top font-mono font-bold text-slate-800">{moneyFormatter.format(item.tarifa)}</td>
                    <td className="min-w-32 whitespace-nowrap px-3 py-3 align-top font-mono">{moneyFormatter.format(item.deposito)}</td>
                    <td className="min-w-28 px-3 py-3 align-top"><EstadoBadge estado={item.estado} /></td>
                    <td className="min-w-64 max-w-72 whitespace-normal px-3 py-3 align-top leading-relaxed">{item.observaciones || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px] text-slate-500">
          <span className="font-bold text-slate-600">Consejo:</span>
          Desplázate horizontalmente para consultar todos los datos del contrato.
        </div>
      </section>

    </div>
  );
}

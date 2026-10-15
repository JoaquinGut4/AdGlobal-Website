import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Package,
  Plus,
  Search,
} from 'lucide-react';
import type { PedidoEstado, PedidoRegistro, PedidoTipo } from '@/types';

type EstadoFiltro = 'all' | PedidoEstado;
type TipoFiltro = 'all' | PedidoTipo;

const ESTADO_FILTROS: Array<{ id: EstadoFiltro; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'Nuevo', label: 'Nuevos' },
  { id: 'En revisión', label: 'En revisión' },
  { id: 'Confirmado', label: 'Confirmados' },
  { id: 'En preparación', label: 'En preparación' },
  { id: 'Atendido', label: 'Atendidos' },
  { id: 'Cancelado', label: 'Cancelados' },
];

const moneyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

function normalizar(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function EstadoBadge({ estado }: { estado: PedidoEstado }) {
  const tones: Record<PedidoEstado, string> = {
    Nuevo: 'border-blue-200 bg-blue-50 text-[#2B5C94]',
    'En revisión': 'border-amber-200 bg-amber-50 text-amber-700',
    Confirmado: 'border-violet-200 bg-violet-50 text-violet-700',
    'En preparación': 'border-cyan-200 bg-cyan-50 text-cyan-700',
    Atendido: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Cancelado: 'border-rose-200 bg-rose-50 text-rose-700',
  };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${tones[estado]}`}>
      {estado}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: PedidoTipo }) {
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
      tipo === 'Alquiler' ? 'bg-blue-50 text-[#2B5C94]' : 'bg-emerald-50 text-emerald-700'
    }`}>
      {tipo}
    </span>
  );
}

function PrioridadBadge({ prioridad }: { prioridad: PedidoRegistro['prioridad'] }) {
  const tone = prioridad === 'Alta'
    ? 'bg-rose-50 text-rose-700'
    : prioridad === 'Media'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-slate-100 text-slate-600';
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${tone}`}>{prioridad}</span>;
}

function GestionTipo({ pedido }: { pedido: PedidoRegistro }) {
  if (pedido.tipo === 'Alquiler') {
    return (
      <div className="min-w-52 space-y-1">
        <p className="font-semibold text-slate-800">
          {pedido.fechaInicio || '—'} <span className="text-slate-400">→</span> {pedido.fechaFin || '—'}
        </p>
        <p className="text-[10px] text-slate-500">
          Garantía: {moneyFormatter.format(pedido.deposito ?? 0)}
        </p>
        <span className="inline-flex rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#2B5C94]">
          {pedido.estadoAlquiler ?? 'Reservado'}
        </span>
      </div>
    );
  }

  const paymentTone = pedido.estadoPago === 'Pagado'
    ? 'bg-emerald-50 text-emerald-700'
    : pedido.estadoPago === 'Parcial'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700';

  return (
    <div className="min-w-52 space-y-1">
      <p className="font-mono text-[11px] font-semibold text-slate-800">
        {pedido.factura || 'Por emitir'}
      </p>
      <p className="text-[10px] text-slate-500">
        {pedido.formaPago || 'Sin definir'} · Entrega: {pedido.fechaEntrega || '—'}
      </p>
      <div className="flex items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${paymentTone}`}>
          {pedido.estadoPago ?? 'Pendiente'}
        </span>
        <span className="text-[10px] text-slate-500">
          Saldo: {moneyFormatter.format(pedido.saldo ?? pedido.monto)}
        </span>
      </div>
    </div>
  );
}

interface PedidosPageProps {
  pedidos: PedidoRegistro[];
  onOpenOrder: () => void;
}

export function PedidosPage({ pedidos, onOpenOrder }: PedidosPageProps) {
  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas las categorías');
  const [estadoActivo, setEstadoActivo] = useState<EstadoFiltro>('all');
  const [tipoActivo, setTipoActivo] = useState<TipoFiltro>('all');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const categorias = [
    'Todas las categorías',
    ...Array.from(new Set(pedidos.map((item) => item.categoria))).sort(),
  ];
  const terminos = normalizar(search).trim().split(/\s+/).filter(Boolean);
  const visibles = pedidos.filter((item) => {
    if (categoriaActiva !== 'Todas las categorías' && item.categoria !== categoriaActiva) return false;
    if (estadoActivo !== 'all' && item.estado !== estadoActivo) return false;
    if (tipoActivo !== 'all' && item.tipo !== tipoActivo) return false;
    if (terminos.length === 0) return true;
    const contenido = normalizar([...Object.values(item), moneyFormatter.format(item.monto)].join(' '));
    return terminos.every((termino) => contenido.includes(termino));
  });

  const nuevos = pedidos.filter((item) => item.estado === 'Nuevo').length;
  const confirmados = pedidos.filter((item) => item.estado === 'Confirmado').length;
  const enPreparacion = pedidos.filter((item) => item.estado === 'En preparación').length;
  const montoTotal = pedidos
    .filter((item) => item.estado !== 'Cancelado')
    .reduce((total, item) => total + item.monto, 0);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) setIsCategoryMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const metricas = [
    {
      id: 'Nuevo' as const,
      label: 'Pedidos nuevos',
      value: nuevos,
      detail: `${moneyFormatter.format(montoTotal)} en solicitudes vigentes`,
      icon: ClipboardList,
      active: 'border-[#2B5C94] bg-blue-50/80 ring-[#2B5C94]/20',
      iconTone: 'border-blue-100 bg-blue-50 text-[#2B5C94]',
      badge: 'border-blue-200 bg-blue-50 text-[#2B5C94]',
    },
    {
      id: 'Confirmado' as const,
      label: 'Pedidos confirmados',
      value: confirmados,
      detail: 'Listos para enviar a Alquileres o Ventas',
      icon: ClipboardCheck,
      active: 'border-violet-500 bg-violet-50/80 ring-violet-500/20',
      iconTone: 'border-violet-100 bg-violet-50 text-violet-700',
      badge: 'border-violet-200 bg-violet-50 text-violet-700',
    },
    {
      id: 'En preparación' as const,
      label: 'En preparación',
      value: enPreparacion,
      detail: 'Equipos en alistamiento para atención',
      icon: CheckCircle2,
      active: 'border-amber-500 bg-amber-50/80 ring-amber-500/20',
      iconTone: 'border-amber-100 bg-amber-50 text-amber-700',
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Control de Pedidos de Equipos
              </h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
                {pedidos.length} pedidos registrados
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Solicitudes de alquiler y venta, validación, asignación y seguimiento
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenOrder}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1F4778]"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
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
                  {pedidos.length === 0 ? 0 : Math.round((metrica.value / pedidos.length) * 100)}% del total
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{metrica.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{metrica.value}</span>
                <span className="text-xs text-slate-400">/ {pedidos.length} pedidos</span>
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
              <h3 className="text-sm font-bold text-slate-900">Registro de pedidos</h3>
              <p className="text-[11px] text-slate-500">
                Consulta requerimientos, fechas, importes y responsable de atención.
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
                placeholder="Pedido, usuario, cliente, RUC, SKU, equipo..."
                aria-label="Buscar pedidos"
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">{categoriaActiva}</span>
            {estadoActivo !== 'all' && <EstadoBadge estado={estadoActivo} />}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['all', 'Alquiler', 'Venta'] as TipoFiltro[]).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoActivo(tipo)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold ${
                  tipoActivo === tipo ? 'bg-white text-[#2B5C94] shadow-2xs' : 'text-slate-500'
                }`}
              >
                {tipo === 'all' ? 'Todos los tipos' : tipo}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500">
            {visibles.length} {visibles.length === 1 ? 'pedido visible' : 'pedidos visibles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {['Pedido', 'Fecha y hora', 'Usuario', 'Cliente / RUC', 'Tipo', 'Categoría', 'Cantidad', 'Equipos', 'Duración', 'Ubicación', 'Responsable', 'Monto', 'Gestión del tipo', 'Prioridad', 'Estado', 'Observaciones'].map((label, index) => (
                  <th key={label} scope="col" className={`whitespace-nowrap px-3 py-3 ${index === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : ''}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {visibles.length === 0 ? (
                <tr><td colSpan={16} className="px-6 py-12 text-center text-sm text-slate-500">No se encontraron pedidos con los criterios seleccionados.</td></tr>
              ) : (
                visibles.map((item) => (
                  <tr key={item.id} className="group hover:bg-blue-50/30">
                    <td className="sticky left-0 z-10 min-w-36 bg-white px-3 py-3 align-top font-mono font-bold text-[#2B5C94] shadow-[1px_0_0_#f1f5f9] group-hover:bg-[#f8fbff]">{item.numeroPedido}</td>
                    <td className="min-w-40 whitespace-nowrap px-3 py-3 align-top">{item.fechaPedido}</td>
                    <td className="min-w-32 whitespace-nowrap px-3 py-3 align-top font-mono text-[11px]">{item.usuario}</td>
                    <td className="min-w-52 px-3 py-3 align-top"><p className="font-bold text-slate-800">{item.cliente}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">RUC {item.ruc}</p></td>
                    <td className="min-w-24 px-3 py-3 align-top"><TipoBadge tipo={item.tipo} /></td>
                    <td className="min-w-28 whitespace-nowrap px-3 py-3 align-top font-semibold">{item.categoria}</td>
                    <td className="min-w-20 px-3 py-3 text-center align-top font-mono font-bold text-slate-800">{item.cantidad}</td>
                    <td className="min-w-64 px-3 py-3 align-top font-semibold text-slate-800">{item.equipos}</td>
                    <td className="min-w-28 whitespace-nowrap px-3 py-3 align-top">{item.duracion}</td>
                    <td className="min-w-64 px-3 py-3 align-top">{item.ubicacion}</td>
                    <td className="min-w-36 px-3 py-3 align-top">{item.responsable}</td>
                    <td className="min-w-32 whitespace-nowrap px-3 py-3 align-top font-mono font-bold text-slate-800">{moneyFormatter.format(item.monto)}</td>
                    <td className="min-w-56 px-3 py-3 align-top"><GestionTipo pedido={item} /></td>
                    <td className="min-w-24 px-3 py-3 align-top"><PrioridadBadge prioridad={item.prioridad} /></td>
                    <td className="min-w-32 px-3 py-3 align-top"><EstadoBadge estado={item.estado} /></td>
                    <td className="min-w-64 max-w-72 whitespace-normal px-3 py-3 align-top leading-relaxed">{item.observaciones || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px] text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          <span className="font-bold text-slate-600">Flujo:</span>
          Alquileres y ventas se administran desde este único registro según el tipo de pedido.
        </div>
      </section>
    </div>
  );
}

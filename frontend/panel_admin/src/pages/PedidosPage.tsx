import { useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, ClipboardList, Clock3, FileText, Plus, Search } from 'lucide-react';
import { GuideModal } from '@/components/modals/GuideModal';
import { Modal } from '@/components/ui/Modal';
import type { PedidoRegistro } from '@/types';

type TipoFiltro = 'all' | 'Alquiler' | 'Venta';

function normalizar(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function tipoDelPedido(pedido: PedidoRegistro): 'Alquiler' | 'Venta' | 'Otro' {
  if (pedido.motivoTraslado === 'Alquiler' || pedido.motivoTraslado === 'Devolución') return 'Alquiler';
  if (pedido.motivoTraslado.startsWith('Venta')) return 'Venta';
  return 'Otro';
}

function DetallesPedido({ pedido }: { pedido: PedidoRegistro }) {
  const detalles: Array<[string, ReactNode]> = [
    ['Fecha de emisión', pedido.fechaEmision],
    ['Dirección de partida', pedido.direccionPartida],
    ['Dirección de llegada', pedido.direccionLlegada],
    ['Descripción de los productos', pedido.descripcionProductos],
    ['Cantidad de productos', pedido.cantidadProductos],
    ['Unidad de medida', pedido.unidadMedida],
    ['Observaciones', pedido.observaciones || 'Sin observaciones'],
    ['Motivo de traslado', pedido.motivoTraslado],
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="w-52 px-4 py-3">Campo</th>
              <th className="px-4 py-3">Información</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {detalles.map(([label, value]) => (
              <tr key={label} className="align-top hover:bg-slate-50/70">
                <th scope="row" className="w-52 bg-slate-50/50 px-4 py-3 font-bold text-slate-500">
                  {label}
                </th>
                <td className="px-4 py-3 leading-relaxed text-slate-700">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [tipoActivo, setTipoActivo] = useState<TipoFiltro>('all');
  const [selectedPedido, setSelectedPedido] = useState<PedidoRegistro | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<PedidoRegistro | null>(null);
  const terminos = normalizar(search).trim().split(/\s+/).filter(Boolean);

  const visibles = pedidos.filter((pedido) => {
    const tipo = tipoDelPedido(pedido);
    if (tipoActivo !== 'all' && tipo !== tipoActivo) return false;
    if (terminos.length === 0) return true;
    const contenido = normalizar(Object.values(pedido).join(' '));
    return terminos.every((termino) => contenido.includes(termino));
  });

  const alquileres = pedidos.filter((pedido) => tipoDelPedido(pedido) === 'Alquiler').length;
  const ventas = pedidos.filter((pedido) => tipoDelPedido(pedido) === 'Venta').length;
  const metricas = [
    {
      id: 'Alquiler' as const,
      label: 'Pedidos de alquiler',
      value: alquileres,
      detail: 'Traslados por alquiler o devolución',
      icon: Clock3,
      active: 'border-[#2B5C94] bg-blue-50/80 ring-[#2B5C94]/20',
      iconTone: 'border-blue-100 bg-blue-50 text-[#2B5C94]',
      badge: 'border-blue-200 bg-blue-50 text-[#2B5C94]',
    },
    {
      id: 'Venta' as const,
      label: 'Pedidos de venta',
      value: ventas,
      detail: 'Traslados relacionados con ventas',
      icon: CheckCircle2,
      active: 'border-emerald-500 bg-emerald-50/80 ring-emerald-500/20',
      iconTone: 'border-emerald-100 bg-emerald-50 text-emerald-700',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Control de Pedidos de Equipos</h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
                {pedidos.length} pedidos registrados
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Emisión de pedidos y datos necesarios para el traslado de productos
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenOrder}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1F4778]"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {metricas.map((metrica) => {
          const Icon = metrica.icon;
          const selected = tipoActivo === metrica.id;
          return (
            <button
              key={metrica.id}
              type="button"
              onClick={() => setTipoActivo(selected ? 'all' : metrica.id)}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                selected ? `${metrica.active} ring-2 shadow-xs` : 'border-slate-200 bg-white hover:border-blue-300'
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
              <p className="mt-1 text-[11px] text-slate-500">{metrica.detail}</p>
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-900">Registro de pedidos</h3>
          <p className="text-[11px] text-slate-500">Consulta los datos de emisión, traslado y productos.</p>
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="relative w-full min-w-0 sm:max-w-2xl sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pedido, dirección, producto, motivo..."
              aria-label="Buscar pedidos"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-[#2B5C94] focus:bg-white focus:outline-none"
            />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 self-end rounded-lg bg-slate-100 p-1 sm:self-auto">
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
        </div>

        <div className="flex items-center justify-end border-b border-slate-100 px-4 py-2.5">
          <span className="text-[11px] text-slate-500">
            {visibles.length} {visibles.length === 1 ? 'pedido visible' : 'pedidos visibles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {['N.º de pedido', 'Fecha de emisión', 'Dirección de llegada', 'Descripción de productos', 'Cantidad', 'Guía'].map((label, index) => (
                  <th key={label} className={`whitespace-nowrap px-3 py-3 ${index === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : ''}`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {visibles.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No se encontraron pedidos.</td></tr>
              ) : visibles.map((pedido) => (
                <tr
                  key={pedido.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalle del pedido ${pedido.numeroPedido}`}
                  onClick={() => setSelectedPedido(pedido)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedPedido(pedido);
                    }
                  }}
                  className="group cursor-pointer hover:bg-blue-50/30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2B5C94]"
                >
                  <td className="sticky left-0 z-10 min-w-44 bg-white px-3 py-3 align-top shadow-[1px_0_0_#f1f5f9] group-hover:bg-[#f8fbff]">
                    <span className="inline-flex items-center gap-2 font-mono font-bold text-[#2B5C94] group-hover:underline">
                      {pedido.numeroPedido}
                    </span>
                  </td>
                  <td className="min-w-32 whitespace-nowrap px-3 py-3 align-top">{pedido.fechaEmision}</td>
                  <td className="min-w-80 max-w-96 whitespace-normal px-3 py-3 align-top leading-relaxed">{pedido.direccionLlegada}</td>
                  <td className="min-w-72 px-3 py-3 align-top font-semibold text-slate-800">{pedido.descripcionProductos}</td>
                  <td className="min-w-20 px-3 py-3 text-center align-top font-mono font-bold">{pedido.cantidadProductos}</td>
                  <td className="min-w-24 px-3 py-3 align-top">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedGuide(pedido);
                      }}
                      title={`Guía del pedido ${pedido.numeroPedido}`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-[#2B5C94] hover:border-[#2B5C94] hover:bg-blue-100"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Guía
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={selectedPedido !== null}
        onClose={() => setSelectedPedido(null)}
        labelledBy="order-detail-modal-title"
        title={selectedPedido ? `Pedido ${selectedPedido.numeroPedido}` : 'Detalle del pedido'}
        subtitle={selectedPedido?.motivoTraslado}
        icon={<ClipboardList className="h-4 w-4" />}
        headerClass="bg-[#2B5C94]"
        panelClass="max-w-4xl"
      >
        {selectedPedido && <DetallesPedido pedido={selectedPedido} />}
      </Modal>

      <GuideModal
        isOpen={selectedGuide !== null}
        pedido={selectedGuide}
        onClose={() => setSelectedGuide(null)}
      />
    </div>
  );
}

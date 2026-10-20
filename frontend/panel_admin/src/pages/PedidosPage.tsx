import { useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, ClipboardList, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { GuideModal } from '@/components/modals/GuideModal';
import { Modal } from '@/components/ui/Modal';
import { formatFecha, parseDireccionLlegada } from '@/lib/utils';
import type { PedidoRegistro } from '@/types';

type TipoFiltro = 'all' | 'Alquiler' | 'Venta';

const COLUMNAS_PEDIDOS: Array<{ label: string; width: string }> = [
  { label: 'N.º de pedido', width: '12%' },
  { label: 'Fecha de creación', width: '11%' },
  { label: 'Dirección de llegada', width: '22%' },
  { label: 'Descripción de los productos', width: '22%' },
  { label: 'Cantidad', width: '8%' },
  { label: 'Acciones', width: '25%' },
];

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
  const destino = parseDireccionLlegada(pedido.direccionLlegada);
  const detalles: Array<[string, ReactNode]> = [
    ['Fecha de creación', formatFecha(pedido.fechaEmision)],
    ['Nombre de la empresa / persona', destino.destinatario || '—'],
    ['Número de contacto', pedido.telefonoContacto || '—'],
    ['Dirección', destino.direccion || '—'],
    ['Distrito', destino.distrito || '—'],
    ['Provincia', destino.provincia || '—'],
    ['Departamento', destino.departamento || '—'],
    ['Motivo del traslado', pedido.motivoTraslado],
    ['Estado del pedido', pedido.estadoPedido ?? 'Activo'],
    ...(pedido.fechaFinalizacion ? [['Fecha de finalización', new Date(pedido.fechaFinalizacion).toLocaleString('es-PE')] as [string, string]] : []),
    ['Descripción de los productos', pedido.descripcionProductos],
    ['Cantidad de los productos', pedido.cantidadProductos],
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
                <td className="whitespace-pre-line px-4 py-3 leading-relaxed text-slate-700">{value}</td>
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
  onEdit: (pedido: PedidoRegistro) => void;
  onFinish: (pedido: PedidoRegistro) => void;
  onDelete: (pedido: PedidoRegistro) => void;
}

export function PedidosPage({ pedidos, onOpenOrder, onEdit, onFinish, onDelete }: PedidosPageProps) {
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {COLUMNAS_PEDIDOS.map((columna, index) => (
                  <th
                    key={columna.label}
                    scope="col"
                    style={{ width: columna.width }}
                    className={`whitespace-nowrap px-3 py-3 ${index === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : ''}`}
                  >
                    {columna.label}
                  </th>
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
                  <td className="sticky left-0 z-10 break-words bg-white px-3 py-3 align-top shadow-[1px_0_0_#f1f5f9] group-hover:bg-[#f8fbff]">
                    <span className="inline-flex items-center gap-2 font-mono font-bold text-[#2B5C94] group-hover:underline">
                      {pedido.numeroPedido}
                    </span>
                    <span className={`mt-1 block w-fit rounded px-1.5 py-0.5 text-[10px] font-bold ${pedido.estadoPedido === 'Finalizado'
                      ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#2B5C94]'}`}>
                      {pedido.estadoPedido ?? 'Activo'}
                    </span>
                  </td>
                  <td className="whitespace-normal break-words px-3 py-3 align-top">{formatFecha(pedido.fechaEmision)}</td>
                  <td className="whitespace-normal break-words px-3 py-3 align-top leading-relaxed">{pedido.direccionLlegada}</td>
                  <td className="whitespace-pre-line break-words px-3 py-3 align-top font-semibold text-slate-800">{pedido.descripcionProductos}</td>
                  <td className="px-3 py-3 text-center align-top font-mono font-bold">{pedido.cantidadProductos}</td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-1.5">
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
                      {pedido.estadoPedido !== 'Finalizado' && (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onFinish(pedido);
                            }}
                            title={`Finalizar pedido ${pedido.numeroPedido}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Finalizar
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(pedido);
                            }}
                            title={`Editar pedido ${pedido.numeroPedido}`}
                            aria-label={`Editar pedido ${pedido.numeroPedido}`}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#2B5C94] hover:bg-blue-50 hover:text-[#2B5C94]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(pedido);
                        }}
                        title={`Eliminar pedido ${pedido.numeroPedido}`}
                        aria-label={`Eliminar pedido ${pedido.numeroPedido}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px] text-slate-500">
          <span className="font-bold text-slate-600">
            {visibles.length} {visibles.length === 1 ? 'pedido mostrado' : 'pedidos mostrados'}
          </span>
          en la tabla actual.
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

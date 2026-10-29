import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Ban, CheckCircle2, ClipboardList, Download, FileText, Loader2, PackageCheck, Pencil, Plus, RotateCcw, Search, Truck } from 'lucide-react';
import { GuideModal } from '@/components/modals/GuideModal';
import { OrderRenewalModal } from '@/components/modals/OrderRenewalModal';
import { Modal } from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';
import { formatFecha, parseDireccionLlegada } from '@/lib/utils';
import type { EstadoFlujoPedido, PedidoRegistro } from '@/types';

type TipoFiltro = 'all' | 'Alquiler' | 'Venta';
type SubcategoriaPedidos = 'registro' | 'guia';

interface GuiaEmitida {
  id: string;
  pedidoId: string;
  numeroGuia: string;
  fechaTraslado: string;
  estado: 'Emitida';
  updatedAt: string;
}

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

const ESTADO_STYLE: Record<EstadoFlujoPedido, string> = {
  Borrador: 'bg-slate-100 text-slate-600',
  Confirmado: 'bg-blue-50 text-blue-700',
  Despachado: 'bg-violet-50 text-violet-700',
  Alquiler: 'bg-brand-soft text-brand',
  'Por devolver': 'bg-amber-50 text-amber-700',
  Vencido: 'bg-danger/10 text-danger',
  Cerrado: 'bg-success/10 text-success',
  Anulado: 'bg-slate-200 text-slate-600',
};

function estadoFlujo(pedido: PedidoRegistro): EstadoFlujoPedido {
  return pedido.estadoFlujo ?? (pedido.estadoPedido === 'Finalizado' ? 'Cerrado' : 'Borrador');
}

function puedeRenovar(pedido: PedidoRegistro): boolean {
  return ['Alquiler', 'Por devolver', 'Vencido'].includes(estadoFlujo(pedido));
}

function siguienteAccion(pedido: PedidoRegistro): { estado: EstadoFlujoPedido; label: string; icon: ReactNode } | null {
  const estado = estadoFlujo(pedido);
  if (estado === 'Borrador') return { estado: 'Confirmado', label: 'Confirmar', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  if (estado === 'Confirmado') return { estado: 'Despachado', label: 'Despachar', icon: <Truck className="h-3.5 w-3.5" /> };
  if (estado === 'Despachado' && pedido.motivoTraslado === 'Alquiler') return { estado: 'Alquiler', label: 'Entregado', icon: <PackageCheck className="h-3.5 w-3.5" /> };
  if (['Despachado', 'Alquiler', 'Por devolver', 'Vencido'].includes(estado)) return { estado: 'Cerrado', label: 'Cerrar', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  return null;
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
    ['Estado del pedido', estadoFlujo(pedido)],
    ['Entrega / inicio del alquiler', pedido.fechaInicio || pedido.fechaEntrega ? formatFecha(pedido.fechaInicio ?? pedido.fechaEntrega ?? '') : '—'],
    ['Fin del alquiler', pedido.fechaFin ? formatFecha(pedido.fechaFin) : '—'],
    ...(pedido.renovaciones ? [['Renovaciones', `${pedido.renovaciones}${pedido.historialRenovaciones?.length ? ` · Última hasta ${formatFecha(pedido.historialRenovaciones[0].fechaNueva)}` : ''}`] as [string, string]] : []),
    ...(pedido.motivoAnulacion ? [['Motivo de anulación', pedido.motivoAnulacion] as [string, string]] : []),
    ...(pedido.fechaFinalizacion ? [['Fecha de finalización', new Date(pedido.fechaFinalizacion).toLocaleString('es-PE')] as [string, string]] : []),
    ['Descripción de los productos', pedido.descripcionProductos],
    ['Cantidad de los productos', pedido.cantidadProductos],
    ['Comentario', pedido.observaciones || '—'],
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
  onTransition: (pedido: PedidoRegistro, estado: EstadoFlujoPedido) => void;
  onRenew: (pedido: PedidoRegistro, nuevaFechaFin: string, motivo: string) => Promise<boolean>;
}

export function PedidosPage({
  pedidos,
  onOpenOrder,
  onEdit,
  onTransition,
  onRenew,
}: PedidosPageProps) {
  const [search, setSearch] = useState('');
  const [tipoActivo, setTipoActivo] = useState<TipoFiltro>('all');
  const [subcategoria, setSubcategoria] = useState<SubcategoriaPedidos>('registro');
  const [selectedPedido, setSelectedPedido] = useState<PedidoRegistro | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<PedidoRegistro | null>(null);
  const [renewalPedido, setRenewalPedido] = useState<PedidoRegistro | null>(null);
  const [numeroPedidoGuia, setNumeroPedidoGuia] = useState('');
  const [guideError, setGuideError] = useState('');
  const [searchingGuide, setSearchingGuide] = useState(false);
  const [guideSearchOpen, setGuideSearchOpen] = useState(false);
  const [guiasEmitidas, setGuiasEmitidas] = useState<GuiaEmitida[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const terminos = normalizar(search).trim().split(/\s+/).filter(Boolean);

  const visibles = pedidos.filter((pedido) => {
    const tipo = tipoDelPedido(pedido);
    if (tipoActivo !== 'all' && tipo !== tipoActivo) return false;
    if (terminos.length === 0) return true;
    const contenido = normalizar(Object.values(pedido).join(' '));
    return terminos.every((termino) => contenido.includes(termino));
  });
  const guideQuery = normalizar(numeroPedidoGuia).trim();
  const guideSuggestions = pedidos
    .filter((pedido) => estadoFlujo(pedido) === 'Confirmado')
    .filter((pedido) => {
      if (!guideQuery) return true;
      const destino = parseDireccionLlegada(pedido.direccionLlegada);
      return normalizar(`${pedido.numeroPedido} ${destino.destinatario}`).includes(guideQuery);
    })
    .slice(0, 6);

  const cargarGuiasEmitidas = useCallback(async () => {
    setLoadingGuides(true);
    setHistoryError('');
    try {
      setGuiasEmitidas(await apiRequest<GuiaEmitida[]>('/guias/emitidas'));
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'No se pudo cargar el historial de guías.');
    } finally {
      setLoadingGuides(false);
    }
  }, []);

  useEffect(() => {
    if (subcategoria === 'guia') void cargarGuiasEmitidas();
  }, [subcategoria, cargarGuiasEmitidas]);

  const abrirGuiaPorNumero = async (numero = numeroPedidoGuia) => {
    const normalized = numero.trim().toUpperCase();
    setNumeroPedidoGuia(normalized);
    setGuideError('');
    setGuideSearchOpen(false);
    setSubcategoria('guia');
    if (!normalized) {
      setGuideError('Ingresa el número de pedido para continuar.');
      return;
    }

    setSearchingGuide(true);
    try {
      const pedido = await apiRequest<PedidoRegistro>(`/pedidos/por-numero?numero=${encodeURIComponent(normalized)}`);
      if (estadoFlujo(pedido) !== 'Confirmado') {
        setGuideError('Primero confirma el pedido para poder aperturar su guía de remisión.');
        return;
      }
      setSelectedGuide(pedido);
    } catch (error) {
      setGuideError(error instanceof Error ? error.message : 'No se pudo buscar el pedido.');
    } finally {
      setSearchingGuide(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Control de Pedidos de Equipos</h2>
              <span className="rounded-full border border-highlight/65 bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand">
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
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-brand-deep"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      <nav aria-label="Subcategorías de pedidos" className="flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setSubcategoria('registro')}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            subcategoria === 'registro' ? 'bg-white text-brand shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Registro de pedidos
        </button>
        <button
          type="button"
          onClick={() => setSubcategoria('guia')}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            subcategoria === 'guia' ? 'bg-white text-brand shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Guía de remisión
        </button>
      </nav>

      {subcategoria === 'registro' ? (
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
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 self-end rounded-lg bg-slate-100 p-1 sm:self-auto">
            {(['all', 'Alquiler', 'Venta'] as TipoFiltro[]).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoActivo(tipo)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold ${
                  tipoActivo === tipo ? 'bg-white text-brand shadow-2xs' : 'text-slate-500'
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
              ) : visibles.map((pedido) => {
                const flujo = estadoFlujo(pedido);
                const accion = siguienteAccion(pedido);
                const anulable = flujo === 'Borrador' || flujo === 'Confirmado';
                return (
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
                  className="group cursor-pointer hover:bg-brand-soft/30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                >
                  <td className="sticky left-0 z-10 break-words bg-white px-3 py-3 align-top shadow-[1px_0_0_#f1f5f9] group-hover:bg-brand-soft/30">
                    <span className="inline-flex items-center gap-2 font-mono font-bold text-brand group-hover:underline">
                      {pedido.numeroPedido}
                    </span>
                    <span className={`mt-1 block w-fit rounded px-1.5 py-0.5 text-[10px] font-bold ${ESTADO_STYLE[flujo]}`}>
                      {flujo}
                    </span>
                  </td>
                  <td className="whitespace-normal break-words px-3 py-3 align-top">{formatFecha(pedido.fechaEmision)}</td>
                  <td className="whitespace-normal break-words px-3 py-3 align-top leading-relaxed">{pedido.direccionLlegada}</td>
                  <td className="whitespace-pre-line break-words px-3 py-3 align-top font-semibold text-slate-800">{pedido.descripcionProductos}</td>
                  <td className="px-3 py-3 text-center align-top font-mono font-bold">{pedido.cantidadProductos}</td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {accion && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onTransition(pedido, accion.estado);
                            }}
                            title={`${accion.label} pedido ${pedido.numeroPedido}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 text-[11px] font-bold text-success hover:bg-success/15"
                          >
                            {accion.icon}
                            {accion.label}
                          </button>
                      )}
                      {puedeRenovar(pedido) && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setRenewalPedido(pedido);
                          }}
                          title={`Renovar pedido ${pedido.numeroPedido}`}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-soft px-2.5 py-1.5 text-[11px] font-bold text-brand hover:bg-highlight/20"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Renovar
                        </button>
                      )}
                      {flujo === 'Borrador' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(pedido);
                            }}
                            title={`Editar pedido ${pedido.numeroPedido}`}
                            aria-label={`Editar pedido ${pedido.numeroPedido}`}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-brand hover:bg-brand-soft hover:text-brand"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                      )}
                      {anulable && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onTransition(pedido, 'Anulado');
                          }}
                          title={`Anular pedido ${pedido.numeroPedido}`}
                          aria-label={`Anular pedido ${pedido.numeroPedido}`}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger hover:border-danger hover:bg-danger/15"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
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
      ) : (
        <section className="min-h-[28rem] overflow-visible rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="rounded-t-2xl border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Guía de remisión</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ingresa el número de un pedido confirmado para aperturar o editar su guía.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <form
              className="w-full max-w-5xl"
              onSubmit={(event) => {
                event.preventDefault();
                void abrirGuiaPorNumero();
              }}
            >
              <label htmlFor="numero-pedido-guia" className="text-xs font-bold text-slate-700">
                Número de pedido <span className="text-danger">*</span>
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="numero-pedido-guia"
                    value={numeroPedidoGuia}
                    onChange={(event) => {
                      setNumeroPedidoGuia(event.target.value.toUpperCase());
                      setGuideError('');
                      setGuideSearchOpen(true);
                    }}
                    onFocus={() => setGuideSearchOpen(true)}
                    onBlur={() => setGuideSearchOpen(false)}
                    placeholder="Ej. PED-2026-001"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={guideSearchOpen}
                    aria-controls="resultados-pedidos-guia"
                    aria-autocomplete="list"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 font-mono text-sm font-bold uppercase text-slate-800 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  {guideSearchOpen && (
                    <div
                      id="resultados-pedidos-guia"
                      role="listbox"
                      className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    >
                      {guideSuggestions.length > 0 ? guideSuggestions.map((pedido) => {
                        const destino = parseDireccionLlegada(pedido.direccionLlegada);
                        return (
                          <button
                            key={pedido.id}
                            type="button"
                            role="option"
                            aria-selected={numeroPedidoGuia === pedido.numeroPedido}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => void abrirGuiaPorNumero(pedido.numeroPedido)}
                            className="flex w-full cursor-pointer items-center justify-between gap-6 rounded-lg px-4 py-3 text-left hover:bg-brand-soft focus:bg-brand-soft focus:outline-none"
                          >
                            <span className="min-w-0">
                              <span className="block font-mono text-sm font-bold text-brand">{pedido.numeroPedido}</span>
                              <span className="mt-0.5 block truncate text-xs text-slate-500">
                                {destino.destinatario || pedido.direccionLlegada}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-slate-400">
                              {formatFecha(pedido.fechaEmision)}
                            </span>
                          </button>
                        );
                      }) : (
                        <p className="px-3 py-3 text-xs text-slate-500">No hay pedidos confirmados que coincidan.</p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searchingGuide}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-6 text-xs font-bold text-white hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70"
                >
                  {searchingGuide ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {searchingGuide ? 'Buscando...' : 'Continuar'}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                La guía recién puede aperturarse cuando el pedido está confirmado.
              </p>
              {guideError && (
                <p role="alert" className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">
                  {guideError}
                </p>
              )}
            </form>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Historial de guías emitidas</h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">Consulta y descarga las guías que ya fueron emitidas.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {guiasEmitidas.length} emitidas
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr><th className="px-4 py-3">N.º guía</th><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Inicio del traslado</th><th className="px-4 py-3 text-right">Acción</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingGuides ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Cargando historial...</td></tr>
                    ) : historyError ? (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-danger">{historyError}</td></tr>
                    ) : guiasEmitidas.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Todavía no hay guías emitidas.</td></tr>
                    ) : guiasEmitidas.map((guia) => {
                      const pedido = pedidos.find((item) => item.id === guia.pedidoId);
                      return (
                        <tr key={guia.id} className="text-slate-700 hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono font-bold text-brand">0001-{guia.numeroGuia}</td>
                          <td className="px-4 py-3 font-mono">{pedido?.numeroPedido ?? 'Pedido no disponible'}</td>
                          <td className="px-4 py-3">{formatFecha(guia.fechaTraslado)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              disabled={!pedido}
                              onClick={() => pedido && setSelectedGuide(pedido)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-soft px-2.5 py-1.5 text-[11px] font-bold text-brand hover:bg-highlight/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Ver / descargar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <Modal
        isOpen={selectedPedido !== null}
        onClose={() => setSelectedPedido(null)}
        labelledBy="order-detail-modal-title"
        title={selectedPedido ? `Pedido ${selectedPedido.numeroPedido}` : 'Detalle del pedido'}
        subtitle={selectedPedido?.motivoTraslado}
        icon={<ClipboardList className="h-4 w-4" />}
        headerClass="bg-brand"
        panelClass="max-w-4xl"
      >
        {selectedPedido && <DetallesPedido pedido={selectedPedido} />}
      </Modal>

      <GuideModal
        isOpen={selectedGuide !== null}
        pedido={selectedGuide}
        onClose={() => setSelectedGuide(null)}
        onIssued={cargarGuiasEmitidas}
      />

      <OrderRenewalModal
        isOpen={renewalPedido !== null}
        pedido={renewalPedido}
        onClose={() => setRenewalPedido(null)}
        onRenew={onRenew}
      />
    </div>
  );
}

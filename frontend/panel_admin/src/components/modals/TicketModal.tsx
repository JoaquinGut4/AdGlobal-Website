import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { PackageCheck, Search, Wrench, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';
import { assetsForOrder } from '@/lib/inventorySync';
import { occupiedByTicket } from '@/lib/ticketWorkflow';
import { formatDireccionLlegada, parseDireccionLlegada } from '@/lib/utils';
import type { InventarioRegistro, PedidoRegistro, SupportTicket, TicketPrioridad, TicketTipo } from '@/types';

export interface NuevoTicketInput {
  equipo: string;
  cliente: string;
  prioridad: TicketPrioridad;
  descripcion: string;
  numeroPedidoEstado: string;
  tipoTicket: TicketTipo;
  numeroPedido: string;
  telefonoContacto: string;
  direccionPedido: string;
  estadoEquipo: string;
  equiposIds: string[];
  tecnicoId?: string;
  tecnico: string;
  tecnicoTelefono?: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevoTicketInput) => Promise<SupportTicket>;
  inventario: InventarioRegistro[];
  pedidos: PedidoRegistro[];
  tickets: SupportTicket[];
}

interface TecnicoSoporte {
  id: string;
  nombre: string;
  telefono: string;
}

const PRIORIDADES: { value: TicketPrioridad; label: string }[] = [
  { value: 'Urgente', label: 'Urgente (SLA 24/7 Crítico)' },
  { value: 'Alta', label: 'Alta (Respuesta < 4 horas)' },
  { value: 'Media', label: 'Media (Atención estándar)' },
  { value: 'Baja', label: 'Baja (Programable)' },
];

const FIELD_CLASS =
  'w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium';

function normalizarTelefonoWhatsApp(telefono: string) {
  const digits = telefono.replace(/\D/g, '');
  return digits.length === 9 ? `51${digits}` : digits;
}

export function TicketModal({ isOpen, onClose, onCreate, inventario, pedidos, tickets }: TicketModalProps) {
  const [tipoTicket, setTipoTicket] = useState<TicketTipo>('pedido');
  const [pedidoSearch, setPedidoSearch] = useState('');
  const [pedidoId, setPedidoId] = useState('');
  const [estadoEquipo, setEstadoEquipo] = useState('');
  const [prioridad, setPrioridad] = useState<TicketPrioridad>('Alta');
  const [tecnicos, setTecnicos] = useState<TecnicoSoporte[]>([]);
  const [tecnicoId, setTecnicoId] = useState('');
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<InventarioRegistro[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTipoTicket('pedido');
      setPedidoSearch('');
      setPedidoId('');
      setEstadoEquipo('');
      setPrioridad('Alta');
      setDescripcion('');
      setSkuSearch('');
      setEquiposSeleccionados([]);
      setSubmitError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();

    const cargarTecnicos = async () => {
      setLoadingTecnicos(true);
      try {
        const payload = await apiRequest<unknown>('/usuarios/soporte', { signal: controller.signal });
        const records = Array.isArray(payload)
          ? payload
          : typeof payload === 'object' && payload !== null && 'data' in payload && Array.isArray(payload.data)
            ? payload.data
            : [];
        const mapped = records
          .map((item, index): TecnicoSoporte | null => {
            if (typeof item !== 'object' || item === null) return null;
            const row = item as Record<string, unknown>;
            const nombre = String(row.nombre ?? row.name ?? '').trim();
            if (!nombre) return null;
            return {
              id: String(row.id ?? row.codigo ?? `tecnico-${index}`),
              nombre,
              telefono: String(row.whatsapp ?? row.telefono ?? row.phone ?? ''),
            };
          })
          .filter((item): item is TecnicoSoporte => item !== null);
        setTecnicos(mapped);
        setTecnicoId(mapped[0]?.id ?? '');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setTecnicos([]);
        setTecnicoId('');
      } finally {
        setLoadingTecnicos(false);
      }
    };

    void cargarTecnicos();
    return () => controller.abort();
  }, [isOpen]);

  const selectedOrder = pedidos.find((order) => order.id === pedidoId);
  const cliente = selectedOrder ? parseDireccionLlegada(selectedOrder.direccionLlegada).destinatario : '';
  const telefonoContacto = selectedOrder?.telefonoContacto?.trim() ?? '';
  const direccionPedido = selectedOrder ? formatDireccionLlegada(selectedOrder.direccionLlegada) : '';
  const estadosDisponibles = Array.from(new Set(inventario.map((item) => item.estado.trim()).filter(Boolean)));
  const availableAssets = tipoTicket === 'pedido'
    ? selectedOrder ? assetsForOrder(selectedOrder, inventario) : []
    : inventario.filter((asset) => asset.estado === estadoEquipo);
  const pedidoQuery = pedidoSearch.trim().toLowerCase();
  const orderResults = pedidoQuery && !selectedOrder
    ? pedidos.filter((order) =>
        [order.numeroPedido, order.direccionLlegada, order.descripcionProductos]
          .join(' ').toLowerCase().includes(pedidoQuery),
      ).slice(0, 8)
    : [];
  const query = skuSearch.trim().toLowerCase();
  const resultados = query
    ? availableAssets
        .filter((registro) =>
          [registro.sku, registro.qr, registro.descripcion, registro.numeroSerial]
            .join(' ')
            .toLowerCase()
            .includes(query),
        )
        .filter((registro) => !equiposSeleccionados.some((item) => item.id === registro.id))
        .filter((registro) => !occupiedByTicket([registro.id], tickets))
        .slice(0, 8)
    : [];

  const equiposActuales = equiposSeleccionados.map((item) =>
    inventario.find((registro) => registro.id === item.id),
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    if (tipoTicket === 'pedido' && (!selectedOrder || !cliente || !telefonoContacto || !direccionPedido)) {
      setSubmitError('Selecciona un pedido con cliente/empresa, número de contacto y dirección de llegada. Edita el pedido si le falta alguno.');
      return;
    }
    if (tipoTicket === 'general' && !estadoEquipo) {
      setSubmitError('Selecciona el estado de los equipos en Inventario.');
      return;
    }
    if (equiposSeleccionados.length === 0 || !descripcion.trim()) {
      setSubmitError('Selecciona al menos un equipo y describe el problema.');
      return;
    }
    const currentAssets = equiposActuales.filter((item): item is InventarioRegistro => item !== undefined);
    if (currentAssets.length !== equiposSeleccionados.length) {
      setSubmitError('Uno de los equipos seleccionados ya no existe en Inventario. Vuelve a seleccionarlo.');
      return;
    }
    if (currentAssets.some((asset) => !availableAssets.some((available) => available.id === asset.id))) {
      setSubmitError('Los equipos seleccionados ya no pertenecen al pedido o estado elegido. Vuelve a seleccionarlos.');
      return;
    }
    if (occupiedByTicket(currentAssets.map((asset) => asset.id), tickets)) {
      setSubmitError('Uno de los equipos ya tiene un ticket de soporte activo.');
      return;
    }

    const tecnico = tecnicos.find((item) => item.id === tecnicoId) ?? tecnicos[0];
    if (!tecnico) {
      setSubmitError('No hay un usuario de soporte disponible para asignar el ticket.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await onCreate({
        cliente: tipoTicket === 'pedido' ? cliente : 'Inventario interno',
        prioridad,
        equipo: currentAssets
          .map((registro) => `${registro.sku} — ${registro.descripcion}`)
          .join('; '),
        numeroPedidoEstado: tipoTicket === 'pedido' ? selectedOrder!.numeroPedido : estadoEquipo,
        tipoTicket,
        numeroPedido: tipoTicket === 'pedido' ? selectedOrder!.numeroPedido : '',
        telefonoContacto: tipoTicket === 'pedido' ? telefonoContacto : '',
        direccionPedido: tipoTicket === 'pedido' ? direccionPedido : '',
        estadoEquipo: tipoTicket === 'general' ? estadoEquipo : '',
        equiposIds: currentAssets.map((asset) => asset.id),
        tecnicoId: tecnico.id,
        tecnico: tecnico.nombre,
        tecnicoTelefono: tecnico.telefono,
        descripcion: descripcion.trim(),
      });

      const whatsapp = normalizarTelefonoWhatsApp(tecnico.telefono);
      if (whatsapp) {
        const message = [
          `Nuevo ticket de soporte ${ticket.codigo}`,
          `Cliente / Empresa: ${ticket.cliente}`,
          ...(ticket.telefonoContacto ? [`Número de contacto: ${ticket.telefonoContacto}`] : []),
          ...(ticket.direccionPedido ? [`Dirección de llegada: ${ticket.direccionPedido}`] : []),
          `Prioridad: ${ticket.prioridad}`,
          `Equipo(s): ${ticket.equipo}`,
          `N.º de pedido / Estado: ${ticket.numeroPedidoEstado}`,
          `Descripción: ${ticket.descripcion}`,
          `Responsable asignado: ${ticket.tecnico}`,
        ].join('\n');
        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      } else {
        window.alert(
          'El ticket fue creado, pero el responsable no tiene un número de WhatsApp registrado.',
        );
      }

      setDescripcion('');
      setSkuSearch('');
      setEquiposSeleccionados([]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo aperturar el ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="ticket-modal-title"
      title="Aperturar Ticket de Soporte"
      subtitle="Registra los equipos y asigna al responsable de soporte"
      icon={<Wrench className="h-4 w-4" />}
      headerClass="bg-slate-900"
      panelClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        <div role="tablist" aria-label="Tipo de ticket" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {([
            { id: 'pedido', label: 'Por pedido' },
            { id: 'general', label: 'General / Inventario' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tipoTicket === tab.id}
              onClick={() => {
                setTipoTicket(tab.id);
                setEquiposSeleccionados([]);
                setSkuSearch('');
                setSubmitError('');
              }}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${tipoTicket === tab.id
                ? 'bg-white text-[#2B5C94] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {tipoTicket === 'pedido' ? (
          <div role="tabpanel" className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div>
              <label htmlFor="ticket-order" className="mb-1 block text-xs font-bold uppercase text-slate-600">
                Número de pedido <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="ticket-order"
                  type="search"
                  required
                  value={pedidoSearch}
                  onChange={(event) => {
                    setPedidoSearch(event.target.value);
                    setPedidoId('');
                    setEquiposSeleccionados([]);
                    setSkuSearch('');
                  }}
                  placeholder="Busca por número, cliente o producto"
                  className={`${FIELD_CLASS} pl-9`}
                />
                {pedidoQuery && !selectedOrder && (
                  <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    {orderResults.length === 0 ? (
                      <p className="p-2 text-xs text-slate-500">No se encontraron pedidos.</p>
                    ) : orderResults.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => {
                          setPedidoId(order.id);
                          setPedidoSearch(order.numeroPedido);
                          setSkuSearch('');
                          setEquiposSeleccionados([]);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs hover:bg-blue-50"
                      >
                        <span className="block font-bold text-[#2B5C94]">{order.numeroPedido}</span>
                        <span className="block truncate text-slate-500">
                          {parseDireccionLlegada(order.direccionLlegada).destinatario || 'Sin cliente'} · {order.estadoPedido ?? 'Activo'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ticket-customer" className="mb-1 block text-xs font-bold uppercase text-slate-600">Cliente / Empresa</label>
                <input id="ticket-customer" type="text" readOnly value={cliente} placeholder="Se completa desde el pedido" className={`${FIELD_CLASS} bg-slate-50`} />
              </div>
              <div>
                <label htmlFor="ticket-contact" className="mb-1 block text-xs font-bold uppercase text-slate-600">Número de contacto</label>
                <input id="ticket-contact" type="tel" readOnly value={telefonoContacto} placeholder="Se completa desde el pedido" className={`${FIELD_CLASS} bg-slate-50`} />
              </div>
            </div>
            <div>
              <label htmlFor="ticket-order-address" className="mb-1 block text-xs font-bold uppercase text-slate-600">Dirección de llegada</label>
              <textarea
                id="ticket-order-address"
                rows={2}
                readOnly
                value={direccionPedido}
                placeholder="Se completa desde el pedido"
                className={`${FIELD_CLASS} resize-none bg-slate-50`}
              />
            </div>
            {selectedOrder && (!cliente || !telefonoContacto || !direccionPedido) && (
              <p className="text-[11px] font-semibold text-amber-700">
                Este pedido no tiene cliente, número de contacto o dirección. Complétalo en Pedidos antes de crear el ticket.
              </p>
            )}
          </div>
        ) : (
          <div role="tabpanel">
            <label htmlFor="ticket-inventory-status" className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Estado <span className="text-rose-500">*</span>
            </label>
            <select
              id="ticket-inventory-status"
              required
              value={estadoEquipo}
              onChange={(event) => {
                setEstadoEquipo(event.target.value);
                setEquiposSeleccionados([]);
                setSkuSearch('');
              }}
              className={FIELD_CLASS}
            >
              <option value="">Selecciona el estado de los equipos</option>
              {estadosDisponibles.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="ticket-priority" className="mb-1 block text-xs font-bold uppercase text-slate-600">Prioridad</label>
          <select id="ticket-priority" value={prioridad} onChange={(event) => setPrioridad(event.target.value as TicketPrioridad)} className={FIELD_CLASS}>
            {PRIORIDADES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
            Equipo afectado <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={skuSearch}
              disabled={tipoTicket === 'pedido' ? !selectedOrder : !estadoEquipo}
              onChange={(event) => setSkuSearch(event.target.value)}
              placeholder={tipoTicket === 'pedido' ? 'Busca productos de este pedido...' : 'Busca productos con el estado elegido...'}
              className={`${FIELD_CLASS} pl-9 disabled:cursor-not-allowed disabled:bg-slate-100`}
            />
          </div>

          {query && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {resultados.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-slate-500">No se encontraron productos disponibles.</p>
              ) : resultados.map((registro) => (
                <button
                  key={registro.id}
                  type="button"
                  onClick={() => {
                    setEquiposSeleccionados((current) => [...current, registro]);
                    setSkuSearch('');
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-blue-50"
                >
                  <PackageCheck className="h-4 w-4 shrink-0 text-[#2B5C94]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs font-bold text-[#2B5C94]">{registro.sku}</span>
                    <span className="block truncate text-[11px] text-slate-600">{registro.descripcion}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{registro.estado}</span>
                </button>
              ))}
            </div>
          )}
          {tipoTicket === 'pedido' && selectedOrder && availableAssets.length === 0 && (
            <p className="mt-1.5 text-[11px] font-semibold text-amber-700">
              Ningún SKU de este pedido está registrado en Inventario.
            </p>
          )}

          {equiposSeleccionados.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {equiposSeleccionados.map((registro) => (
                <span key={registro.id} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-[#2B5C94]">
                  {registro.sku} · {registro.descripcion}
                  <button
                    type="button"
                    onClick={() => {
                      setEquiposSeleccionados((current) => current.filter((item) => item.id !== registro.id));
                    }}
                    aria-label={`Quitar ${registro.sku}`}
                    className="cursor-pointer text-blue-400 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Usuario de soporte asignado</label>
          <select
            value={tecnicoId}
            onChange={(event) => setTecnicoId(event.target.value)}
            disabled={loadingTecnicos || tecnicos.length === 0}
            className={FIELD_CLASS}
          >
            {tecnicos.length === 0 && <option value="">Sin usuarios de soporte disponibles</option>}
            {tecnicos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}{item.telefono ? ` · ${item.telefono}` : ' · Sin WhatsApp registrado'}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">
            Solo se muestran usuarios activos con rol Soporte.
          </p>
          {loadingTecnicos && <p className="mt-1 text-[10px] text-slate-500">Consultando usuarios de soporte...</p>}
          {!loadingTecnicos && tecnicos.length === 0 && (
            <p className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] font-semibold text-amber-700">
              No hay usuarios activos con rol Soporte. Crea uno en Configuración para poder aperturar tickets.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
            Descripción del problema o solicitud técnica <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Detalla la falla, síntomas, daños visibles o requerimiento de soporte..."
            className={FIELD_CLASS}
          />
        </div>

        {submitError && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loadingTecnicos || tecnicos.length === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wrench className="h-3.5 w-3.5 text-amber-400" />
            {isSubmitting ? 'Aperturando...' : 'Aperturar ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

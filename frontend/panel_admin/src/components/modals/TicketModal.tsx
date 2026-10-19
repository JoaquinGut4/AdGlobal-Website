import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { PackageCheck, Search, Wrench, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { STORAGE_KEYS } from '@/config/site';
import { INVENTARIO_REGISTROS } from '@/data/inventario';
import { apiRequest } from '@/lib/api';
import type { InventarioRegistro, SupportTicket, TicketPrioridad } from '@/types';

export interface NuevoTicketInput {
  equipo: string;
  cliente: string;
  prioridad: TicketPrioridad;
  descripcion: string;
  tecnicoId?: string;
  tecnico: string;
  tecnicoTelefono?: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevoTicketInput) => Promise<SupportTicket>;
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

function cargarInventario(): InventarioRegistro[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.inventario);
    return stored ? (JSON.parse(stored) as InventarioRegistro[]) : INVENTARIO_REGISTROS;
  } catch {
    return INVENTARIO_REGISTROS;
  }
}

function normalizarTelefonoWhatsApp(telefono: string) {
  const digits = telefono.replace(/\D/g, '');
  return digits.length === 9 ? `51${digits}` : digits;
}

export function TicketModal({ isOpen, onClose, onCreate }: TicketModalProps) {
  const [cliente, setCliente] = useState('');
  const [prioridad, setPrioridad] = useState<TicketPrioridad>('Alta');
  const [tecnicos, setTecnicos] = useState<TecnicoSoporte[]>([]);
  const [tecnicoId, setTecnicoId] = useState('');
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [inventario, setInventario] = useState<InventarioRegistro[]>([]);
  const [skuSearch, setSkuSearch] = useState('');
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<InventarioRegistro[]>([]);

  useEffect(() => {
    if (isOpen) {
      setInventario(cargarInventario());
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

  const query = skuSearch.trim().toLowerCase();
  const resultados = query
    ? inventario
        .filter((registro) =>
          [registro.sku, registro.qr, registro.descripcion, registro.numeroSerial]
            .join(' ')
            .toLowerCase()
            .includes(query),
        )
        .filter((registro) => !equiposSeleccionados.some((item) => item.id === registro.id))
        .slice(0, 8)
    : [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    if (equiposSeleccionados.length === 0 || !cliente.trim() || !descripcion.trim()) return;

    const tecnico = tecnicos.find((item) => item.id === tecnicoId) ?? tecnicos[0];
    if (!tecnico) {
      setSubmitError('No hay un usuario de soporte disponible para asignar el ticket.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await onCreate({
        cliente: cliente.trim(),
        prioridad,
        equipo: equiposSeleccionados
          .map((registro) => `${registro.sku} — ${registro.descripcion}`)
          .join('; '),
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
          `Prioridad: ${ticket.prioridad}`,
          `Equipo(s): ${ticket.equipo}`,
          `Descripción: ${ticket.descripcion}`,
          `Responsable asignado: ${ticket.tecnico}`,
        ].join('\n');
        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      } else {
        window.alert(
          'El ticket fue creado, pero el responsable no tiene un número de WhatsApp registrado.',
        );
      }

      setCliente('');
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Cliente / Empresa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              placeholder="Nombre de la empresa"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Prioridad de atención
            </label>
            <select value={prioridad} onChange={(event) => setPrioridad(event.target.value as TicketPrioridad)} className={FIELD_CLASS}>
              {PRIORIDADES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
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
              onChange={(event) => setSkuSearch(event.target.value)}
              placeholder="Buscar por SKU, QR, serie o nombre..."
              className={`${FIELD_CLASS} pl-9`}
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

          {equiposSeleccionados.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {equiposSeleccionados.map((registro) => (
                <span key={registro.id} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-[#2B5C94]">
                  {registro.sku} · {registro.descripcion}
                  <button
                    type="button"
                    onClick={() => setEquiposSeleccionados((current) => current.filter((item) => item.id !== registro.id))}
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
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
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

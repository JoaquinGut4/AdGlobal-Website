import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ClipboardPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { MotivoTraslado, PedidoRegistro } from '@/types';

export type NuevoPedidoInput = Omit<PedidoRegistro, 'id' | 'numeroPedido'>;

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevoPedidoInput) => void;
}

const DIRECCION_PARTIDA = 'Av. Húsares de Junín 527, Jesús María, Lima, Lima';

const MOTIVOS: MotivoTraslado[] = [
  'Venta',
  'Venta con entrega a terceros',
  'Venta sujeta a confirmación del cliente',
  'Compra',
  'Alquiler',
  'Devolución',
  'Traslado entre establecimientos de una misma empresa',
  'Reemplazo de bienes',
  'Transformación',
  'Recojo de bienes transformados',
  'Traslado por emisor itinerante de comprobantes de pago',
  'Traslado a zona primaria',
  'Importación',
  'Exportación',
];

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5C94]';

export function OrderModal({ isOpen, onClose, onCreate }: OrderModalProps) {
  const [fechaEmision, setFechaEmision] = useState(() => new Date().toISOString().slice(0, 10));
  const [destinatarioTipo, setDestinatarioTipo] = useState<'Persona natural' | 'Empresa'>('Empresa');
  const [destinatario, setDestinatario] = useState('');
  const [direccion, setDireccion] = useState('');
  const [distrito, setDistrito] = useState('');
  const [provincia, setProvincia] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [descripcionProductos, setDescripcionProductos] = useState('');
  const [cantidadProductos, setCantidadProductos] = useState('1');
  const [motivoTraslado, setMotivoTraslado] = useState<MotivoTraslado>('Venta');
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const direccionLlegada = [
      `${destinatarioTipo}: ${destinatario.trim()}`,
      `Dirección: ${direccion.trim()}`,
      `Distrito: ${distrito.trim()}`,
      `Provincia: ${provincia.trim()}`,
      `Departamento: ${departamento.trim()}`,
    ].join(' · ');

    onCreate({
      fechaEmision,
      direccionPartida: DIRECCION_PARTIDA,
      direccionLlegada,
      descripcionProductos: descripcionProductos.trim(),
      cantidadProductos: Number(cantidadProductos),
      unidadMedida: 'UND',
      motivoTraslado,
      observaciones: observaciones.trim(),
    });

    setFechaEmision(new Date().toISOString().slice(0, 10));
    setDestinatarioTipo('Empresa');
    setDestinatario('');
    setDireccion('');
    setDistrito('');
    setProvincia('');
    setDepartamento('');
    setDescripcionProductos('');
    setCantidadProductos('1');
    setMotivoTraslado('Venta');
    setObservaciones('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="order-modal-title"
      title="Aperturar pedido"
      subtitle="Datos para la emisión y traslado de los productos"
      icon={<ClipboardPlus className="h-4 w-4" />}
      headerClass="bg-[#2B5C94]"
      panelClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha de emisión" required>
            <input type="date" required value={fechaEmision} onChange={(event) => setFechaEmision(event.target.value)} className={FIELD_CLASS} />
          </Field>
          <Field label="Dirección de partida">
            <textarea rows={2} value={DIRECCION_PARTIDA} readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} />
          </Field>
        </div>

        <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2B5C94]">
            Dirección de llegada
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Tipo de destinatario" required>
              <select value={destinatarioTipo} onChange={(event) => setDestinatarioTipo(event.target.value as 'Persona natural' | 'Empresa')} className={FIELD_CLASS}>
                <option>Persona natural</option>
                <option>Empresa</option>
              </select>
            </Field>
            <Field label={destinatarioTipo === 'Empresa' ? 'Nombre de la empresa' : 'Nombre completo'} required full>
              <input required value={destinatario} onChange={(event) => setDestinatario(event.target.value)} className={FIELD_CLASS} />
            </Field>
            <Field label="Dirección" required full>
              <input required value={direccion} onChange={(event) => setDireccion(event.target.value)} placeholder="Calle, avenida y número" className={FIELD_CLASS} />
            </Field>
            <Field label="Distrito" required>
              <input required value={distrito} onChange={(event) => setDistrito(event.target.value)} className={FIELD_CLASS} />
            </Field>
            <Field label="Provincia" required>
              <input required value={provincia} onChange={(event) => setProvincia(event.target.value)} className={FIELD_CLASS} />
            </Field>
            <Field label="Departamento" required>
              <input required value={departamento} onChange={(event) => setDepartamento(event.target.value)} className={FIELD_CLASS} />
            </Field>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Descripción de los productos (SKU + categoría + nombre)" required full>
            <textarea rows={3} required value={descripcionProductos} onChange={(event) => setDescripcionProductos(event.target.value)} placeholder="Ej. LAP-0001 · Laptops · Lenovo ThinkPad T14 Gen 2" className={FIELD_CLASS} />
          </Field>
          <Field label="Cantidad de productos" required>
            <input type="number" min="1" required value={cantidadProductos} onChange={(event) => setCantidadProductos(event.target.value)} className={FIELD_CLASS} />
          </Field>
          <Field label="Unidad de medida">
            <input value="UND" readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} />
          </Field>
          <Field label="Motivo de traslado" required full>
            <select value={motivoTraslado} onChange={(event) => setMotivoTraslado(event.target.value as MotivoTraslado)} className={FIELD_CLASS}>
              {MOTIVOS.map((motivo) => <option key={motivo}>{motivo}</option>)}
            </select>
          </Field>
          <Field label="Observaciones" full>
            <textarea rows={3} value={observaciones} onChange={(event) => setObservaciones(event.target.value)} placeholder="Observaciones generales" className={FIELD_CLASS} />
          </Field>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2.5 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur-sm">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#2B5C94] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1F4778]">
            <ClipboardPlus className="h-3.5 w-3.5" />
            Aperturar pedido
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ClipboardPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { PedidoRegistro, PedidoTipo, VentaPagoEstado } from '@/types';

export interface NuevoPedidoInput {
  cliente: string;
  ruc: string;
  tipo: PedidoTipo;
  categoria: string;
  cantidad: number;
  equipos: string;
  duracion: string;
  ubicacion: string;
  responsable: string;
  monto: number;
  prioridad: PedidoRegistro['prioridad'];
  observaciones: string;
  fechaInicio?: string;
  fechaFin?: string;
  deposito?: number;
  factura?: string;
  formaPago?: string;
  fechaEntrega?: string;
  saldo?: number;
  estadoPago?: VentaPagoEstado;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevoPedidoInput) => void;
  usuario: string;
  siguienteNumero: string;
}

const CATEGORIAS = [
  'Laptops',
  'Computadoras',
  'Monitores',
  'Tablets',
  'Televisores',
  'Impresoras',
  'Proyectores',
];

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5C94]';

export function OrderModal({
  isOpen,
  onClose,
  onCreate,
  usuario,
  siguienteNumero,
}: OrderModalProps) {
  const [cliente, setCliente] = useState('');
  const [ruc, setRuc] = useState('');
  const [tipo, setTipo] = useState<PedidoTipo>('Alquiler');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [cantidad, setCantidad] = useState('1');
  const [equipos, setEquipos] = useState('');
  const [duracion, setDuracion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [monto, setMonto] = useState('');
  const [prioridad, setPrioridad] = useState<PedidoRegistro['prioridad']>('Media');
  const [observaciones, setObservaciones] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [deposito, setDeposito] = useState('');
  const [factura, setFactura] = useState('Por emitir');
  const [formaPago, setFormaPago] = useState('Transferencia bancaria');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [saldo, setSaldo] = useState('');
  const [estadoPago, setEstadoPago] = useState<VentaPagoEstado>('Pendiente');

  const handleTypeChange = (nextType: PedidoTipo) => {
    setTipo(nextType);
    if (nextType === 'Venta' && !duracion.trim()) setDuracion('Entrega única');
    if (nextType === 'Alquiler' && duracion === 'Entrega única') setDuracion('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const baseInput: NuevoPedidoInput = {
      cliente: cliente.trim(),
      ruc: ruc.trim(),
      tipo,
      categoria,
      cantidad: Number(cantidad),
      equipos: equipos.trim(),
      duracion: duracion.trim(),
      ubicacion: ubicacion.trim(),
      responsable: responsable.trim(),
      monto: Number(monto),
      prioridad,
      observaciones: observaciones.trim(),
    };

    onCreate(
      tipo === 'Alquiler'
        ? {
            ...baseInput,
            fechaInicio,
            fechaFin,
            deposito: Number(deposito || 0),
          }
        : {
            ...baseInput,
            factura: factura.trim() || 'Por emitir',
            formaPago,
            fechaEntrega,
            saldo: Number(saldo || monto),
            estadoPago,
          },
    );

    setCliente('');
    setRuc('');
    setTipo('Alquiler');
    setCategoria(CATEGORIAS[0]);
    setCantidad('1');
    setEquipos('');
    setDuracion('');
    setUbicacion('');
    setResponsable('');
    setMonto('');
    setPrioridad('Media');
    setObservaciones('');
    setFechaInicio('');
    setFechaFin('');
    setDeposito('');
    setFactura('Por emitir');
    setFormaPago('Transferencia bancaria');
    setFechaEntrega('');
    setSaldo('');
    setEstadoPago('Pendiente');
  };

  const fechaActual = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="order-modal-title"
      title="Aperturar pedido"
      subtitle="Registra una solicitud de alquiler o venta de equipos"
      icon={<ClipboardPlus className="h-4 w-4" />}
      headerClass="bg-[#2B5C94]"
      panelClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:grid-cols-3">
          <ReadOnlyField label="Número de pedido" value={siguienteNumero} />
          <ReadOnlyField label="Fecha del pedido" value={fechaActual} />
          <ReadOnlyField label="Usuario" value={usuario} />
          <p className="text-[10px] text-slate-500 sm:col-span-3">
            Estos datos se asignarán automáticamente al guardar el pedido.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2B5C94]">
            Cliente y operación
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Cliente / Empresa" required wide>
              <input required value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre o razón social" className={FIELD_CLASS} />
            </Field>
            <Field label="RUC" required>
              <input required inputMode="numeric" minLength={11} maxLength={11} value={ruc} onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))} placeholder="11 dígitos" className={FIELD_CLASS} />
            </Field>
            <Field label="Tipo" required>
              <select value={tipo} onChange={(e) => handleTypeChange(e.target.value as PedidoTipo)} className={FIELD_CLASS}>
                <option value="Alquiler">Alquiler</option>
                <option value="Venta">Venta</option>
              </select>
            </Field>
            <Field label="Categoría" required>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={FIELD_CLASS}>
                {CATEGORIAS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Cantidad" required>
              <input type="number" min="1" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={FIELD_CLASS} />
            </Field>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2B5C94]">
            Equipos y condiciones
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Equipos (SKU y nombre)" required full>
              <textarea rows={2} required value={equipos} onChange={(e) => setEquipos(e.target.value)} placeholder="Ej. LAP-0002 — Lenovo ThinkPad T14 Gen 2" className={FIELD_CLASS} />
            </Field>
            <Field label="Duración" required>
              <input required value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder={tipo === 'Alquiler' ? 'Ej. 10 días' : 'Entrega única'} className={FIELD_CLASS} />
            </Field>
            <Field label="Responsable de recepción" required>
              <input required value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nombre completo" className={FIELD_CLASS} />
            </Field>
            <Field label="Prioridad" required>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as PedidoRegistro['prioridad'])} className={FIELD_CLASS}>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </Field>
            <Field label="Ubicación de entrega" required wide>
              <input required value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Dirección completa donde se llevarán los equipos" className={FIELD_CLASS} />
            </Field>
            <Field label="Monto pactado (S/)" required>
              <input type="number" min="0" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className={FIELD_CLASS} />
            </Field>
            <Field label="Observaciones" full>
              <textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Condiciones, accesorios, soporte u otras indicaciones" className={FIELD_CLASS} />
            </Field>
          </div>
        </div>

        {tipo === 'Alquiler' ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2B5C94]">
              Gestión del alquiler
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Fecha de inicio" required>
                <input type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className={FIELD_CLASS} />
              </Field>
              <Field label="Fecha de fin" required>
                <input type="date" min={fechaInicio || undefined} required value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className={FIELD_CLASS} />
              </Field>
              <Field label="Depósito / Garantía (S/)">
                <input type="number" min="0" step="0.01" value={deposito} onChange={(e) => setDeposito(e.target.value)} placeholder="0.00" className={FIELD_CLASS} />
              </Field>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              El pedido iniciará con estado operativo “Reservado” y podrá avanzar hasta su devolución.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
              Facturación y entrega de la venta
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Factura / Comprobante">
                <input value={factura} onChange={(e) => setFactura(e.target.value)} placeholder="Por emitir" className={FIELD_CLASS} />
              </Field>
              <Field label="Forma de pago" required>
                <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)} className={FIELD_CLASS}>
                  <option>Transferencia bancaria</option>
                  <option>Crédito 15 días</option>
                  <option>Crédito 30 días</option>
                  <option>Tarjeta corporativa</option>
                  <option>Efectivo</option>
                </select>
              </Field>
              <Field label="Estado del pago" required>
                <select value={estadoPago} onChange={(e) => setEstadoPago(e.target.value as VentaPagoEstado)} className={FIELD_CLASS}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Parcial">Parcial</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </Field>
              <Field label="Fecha de entrega" required>
                <input type="date" required value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className={FIELD_CLASS} />
              </Field>
              <Field label="Saldo pendiente (S/)">
                <input type="number" min="0" step="0.01" value={saldo} onChange={(e) => setSaldo(e.target.value)} placeholder="Igual al monto si se deja vacío" className={FIELD_CLASS} />
              </Field>
            </div>
          </div>
        )}

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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="mt-1 block truncate font-mono text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}

function Field({
  label,
  required,
  wide,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : wide ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

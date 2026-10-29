import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ClipboardPlus, Plus, ScanLine, Search } from 'lucide-react';
import { InventoryScannerModal } from '@/components/modals/InventoryScannerModal';
import { Modal } from '@/components/ui/Modal';
import { parseDireccionLlegada } from '@/lib/utils';
import { orderSkusFromDescription, skuInDescription } from '@/lib/inventorySync';
import type {
  InventarioCategoria,
  InventarioRegistro,
  MotivoTraslado,
  PedidoRegistro,
} from '@/types';

export type NuevoPedidoInput = Omit<PedidoRegistro, 'id' | 'numeroPedido'>;

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevoPedidoInput) => boolean | Promise<boolean>;
  inventario: InventarioRegistro[];
  categorias: InventarioCategoria[];
  editingPedido?: PedidoRegistro | null;
  onUpdate?: (pedido: PedidoRegistro) => boolean | Promise<boolean>;
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
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand';

const CATEGORIA_LABELS: Record<string, string> = {
  laptops: 'Laptops',
  computadoras: 'Computadoras',
  monitores: 'Monitores',
  tablets: 'Tablets',
  televisores: 'Televisores',
  impresoras: 'Impresoras',
  proyectores: 'Proyectores',
};

function normalizar(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function lineasUnicas(value: string) {
  const seen = new Set<string>();
  return value.split('\n').map((line) => line.trim()).filter((line) => {
    const key = normalizar(line);
    if (!line || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join('\n');
}

export function OrderModal({ isOpen, onClose, onCreate, inventario, categorias, editingPedido = null, onUpdate }: OrderModalProps) {
  const [fechaEmision, setFechaEmision] = useState(() => new Date().toISOString().slice(0, 10));
  const fechaCreacion = new Date(`${fechaEmision}T00:00:00`).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const [destinatario, setDestinatario] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [direccion, setDireccion] = useState('');
  const [distrito, setDistrito] = useState('');
  const [provincia, setProvincia] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [motivoTraslado, setMotivoTraslado] = useState<MotivoTraslado>('Venta');
  const [descripcionProductos, setDescripcionProductos] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [orderError, setOrderError] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [menuProductosOpen, setMenuProductosOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const categoriasPersonalizadas = new Map(categorias.map((categoria) => [categoria.id, categoria.label]));
  const labelCategoria = (categoriaId: InventarioRegistro['categoriaId']) =>
    CATEGORIA_LABELS[categoriaId] ?? categoriasPersonalizadas.get(categoriaId) ?? categoriaId;

  const productosFiltrados = useMemo(() => {
    const termino = normalizar(busquedaProducto).trim();
    if (!termino) return [];
    return inventario
      .filter((producto) => !skuInDescription(descripcionProductos, producto.sku))
      .filter((producto) =>
        normalizar(
          [producto.sku, labelCategoria(producto.categoriaId), producto.descripcion, producto.marca].join(' '),
        ).includes(termino),
      )
      .slice(0, 8);
  }, [busquedaProducto, inventario, categorias, descripcionProductos]);

  const agregarProducto = (producto: InventarioRegistro) => {
    if (skuInDescription(descripcionProductos, producto.sku)) {
      setOrderError(`El equipo ${producto.sku} ya está agregado al pedido.`);
      setScannerOpen(false);
      return;
    }
    const linea = `${producto.sku} · ${labelCategoria(producto.categoriaId)} · ${producto.descripcion}`;
    setDescripcionProductos((current) => lineasUnicas(current.trim() ? `${current.trim()}\n${linea}` : linea));
    setOrderError('');
    setBusquedaProducto('');
    setMenuProductosOpen(false);
    setScannerOpen(false);
  };

  const resetForm = () => {
    setFechaEmision(new Date().toISOString().slice(0, 10));
    setDestinatario('');
    setTelefonoContacto('');
    setDireccion('');
    setDistrito('');
    setProvincia('');
    setDepartamento('');
    setMotivoTraslado('Venta');
    setDescripcionProductos('');
    setObservaciones('');
    setFechaInicio('');
    setFechaFin('');
    setOrderError('');
    setBusquedaProducto('');
    setMenuProductosOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!editingPedido) {
      resetForm();
      return;
    }
    const parsed = parseDireccionLlegada(editingPedido.direccionLlegada);
    setFechaEmision(editingPedido.fechaEmision);
    setDestinatario(parsed.destinatario);
    setTelefonoContacto(editingPedido.telefonoContacto ?? '');
    setDireccion(parsed.direccion);
    setDistrito(parsed.distrito);
    setProvincia(parsed.provincia);
    setDepartamento(parsed.departamento);
    setMotivoTraslado(editingPedido.motivoTraslado);
    setDescripcionProductos(lineasUnicas(editingPedido.descripcionProductos));
    setObservaciones(editingPedido.observaciones ?? '');
    setFechaInicio(editingPedido.fechaInicio ?? editingPedido.fechaEntrega ?? '');
    setFechaFin(editingPedido.fechaFin ?? '');
    setBusquedaProducto('');
    setMenuProductosOpen(false);
  }, [isOpen, editingPedido]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setOrderError('');
    const telefono = telefonoContacto.trim();
    const digitos = telefono.replace(/\D/g, '');
    if (editingPedido && (!/^[+()\d\s-]+$/.test(telefono) || digitos.length < 7 || digitos.length > 15)) {
      setOrderError('Ingresa un número de contacto válido (entre 7 y 15 dígitos).');
      return;
    }
    const skus = orderSkusFromDescription(descripcionProductos, inventario);
    const direccionLlegada = editingPedido ? [
      destinatario.trim(),
      `Dirección: ${direccion.trim()}`,
      `Distrito: ${distrito.trim()}`,
      `Provincia: ${provincia.trim()}`,
      `Departamento: ${departamento.trim()}`,
    ].join(' · ') : '';

    const payload: NuevoPedidoInput = {
      fechaEmision,
      direccionPartida: editingPedido?.direccionPartida ?? DIRECCION_PARTIDA,
      direccionLlegada,
      telefonoContacto: telefono,
      descripcionProductos: editingPedido ? lineasUnicas(descripcionProductos) : '',
      skus,
      cantidadProductos: Math.max(1, skus.length),
      unidadMedida: 'UND',
      motivoTraslado,
      observaciones: observaciones.trim(),
      fechaEntrega: fechaInicio || undefined,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
    };

    if (editingPedido && onUpdate) {
      if (!await onUpdate({ ...editingPedido, ...payload })) {
        setOrderError('Revisa los SKU: alguno no existe o está asignado a otro pedido activo.');
      }
      return;
    }

    if (await onCreate(payload)) resetForm();
    else setOrderError('No se pudo aperturar el pedido. Revisa los campos e inténtalo nuevamente.');
  };

  return (
    <>
    <Modal
      isOpen={isOpen && !scannerOpen}
      onClose={onClose}
      labelledBy="order-modal-title"
      title={editingPedido ? 'Editar pedido' : 'Aperturar pedido'}
      subtitle={editingPedido ? `Pedido ${editingPedido.numeroPedido}` : 'Registro inicial del pedido como borrador'}
      icon={<ClipboardPlus className="h-4 w-4" />}
      headerClass="bg-brand"
      panelClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Número de pedido" required>
            <input
              type="text"
              value={editingPedido?.numeroPedido ?? 'Se genera automáticamente'}
              readOnly
              disabled
              aria-label="Número de pedido"
              className={`${FIELD_CLASS} cursor-not-allowed bg-slate-100 font-mono text-slate-600`}
            />
          </Field>
          <Field label="Fecha de creación" required>
            <input
              type="text"
              value={fechaCreacion}
              readOnly
              disabled
              aria-label="Fecha de creación del pedido"
              className={`${FIELD_CLASS} cursor-not-allowed bg-slate-100 text-slate-600`}
            />
          </Field>
        </div>

        {!editingPedido && (
          <section className="rounded-xl border border-highlight/35 bg-brand-soft/40 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand">Datos de apertura</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Motivo del traslado" required>
                <select value={motivoTraslado} onChange={(event) => setMotivoTraslado(event.target.value as MotivoTraslado)} className={FIELD_CLASS}>
                  {MOTIVOS.map((motivo) => <option key={motivo}>{motivo}</option>)}
                </select>
              </Field>
              <Field label="Comentario" required>
                <textarea
                  rows={3}
                  required
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  placeholder="Agrega un comentario sobre el pedido..."
                  className={FIELD_CLASS}
                />
              </Field>
            </div>
          </section>
        )}

        {editingPedido && (
        <>
        <section className="rounded-xl border border-highlight/35 bg-brand-soft/40 p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand">
            Dirección de llegada
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombre de la empresa / persona" required full>
              <input required value={destinatario} onChange={(event) => setDestinatario(event.target.value)} className={FIELD_CLASS} />
            </Field>
            <Field label="Número de contacto" required>
              <input
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                maxLength={30}
                value={telefonoContacto}
                onChange={(event) => setTelefonoContacto(event.target.value)}
                placeholder="Ej. +51 955 746 704"
                className={FIELD_CLASS}
              />
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

        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Programación del pedido</h4>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">Requerida para confirmar</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Fecha de entrega / inicio del alquiler">
              <input type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)} className={FIELD_CLASS} />
            </Field>
            <Field label="Fin del alquiler">
              <input type="date" min={fechaInicio || undefined} value={fechaFin} onChange={(event) => setFechaFin(event.target.value)} className={FIELD_CLASS} />
            </Field>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Puedes aperturar el borrador sin estas fechas. Antes de confirmarlo deberán estar completas y ser válidas.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Motivo del traslado" required full>
            <select value={motivoTraslado} onChange={(event) => setMotivoTraslado(event.target.value as MotivoTraslado)} className={FIELD_CLASS}>
              {MOTIVOS.map((motivo) => <option key={motivo}>{motivo}</option>)}
            </select>
          </Field>
          <Field label="Descripción de los productos (SKU + categoría + nombre)" required full>
            <div className="space-y-2">
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busquedaProducto}
                      onChange={(event) => {
                        setBusquedaProducto(event.target.value);
                        setMenuProductosOpen(true);
                      }}
                      onFocus={() => setMenuProductosOpen(true)}
                      placeholder="Buscar por SKU, categoría o nombre..."
                      className={`${FIELD_CLASS} pl-9`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-highlight/65 bg-brand-soft px-3 text-xs font-bold text-brand hover:bg-highlight/15 active:scale-[.98]"
                  >
                    <ScanLine className="h-4 w-4" />
                    Escanear
                  </button>
                </div>
                {menuProductosOpen && busquedaProducto.trim() !== '' && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {productosFiltrados.length === 0 ? (
                      <p className="px-3 py-2 text-[11px] text-slate-500">Sin coincidencias disponibles o el equipo ya fue agregado.</p>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <button
                          key={producto.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => agregarProducto(producto)}
                          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-brand-soft"
                        >
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-brand">{producto.sku}</span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                {labelCategoria(producto.categoriaId)}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-slate-600">{producto.descripcion}</span>
                          </span>
                          <Plus className="h-3.5 w-3.5 shrink-0 text-brand" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <textarea rows={3} required value={descripcionProductos} onChange={(event) => setDescripcionProductos(event.target.value)} placeholder="Ej. SKU · Categoría · Descripción del equipo" className={FIELD_CLASS} />
              <p className="text-[11px] text-slate-500">
                La cantidad se calcula automáticamente: una unidad por cada SKU distinto. Un equipo no puede agregarse dos veces.
              </p>
            </div>
          </Field>
        </div>

        <Field label="Comentario" full>
          <textarea
            rows={3}
            value={observaciones}
            onChange={(event) => setObservaciones(event.target.value)}
            placeholder="Agrega un comentario sobre el pedido..."
            className={FIELD_CLASS}
          />
        </Field>
        </>
        )}

        {orderError && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
            {orderError}
          </p>
        )}

        <div className="sticky bottom-0 flex items-center justify-end gap-2.5 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur-sm">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-deep">
            <ClipboardPlus className="h-3.5 w-3.5" />
            {editingPedido ? 'Guardar cambios' : 'Aperturar pedido'}
          </button>
        </div>
      </form>
    </Modal>
    <InventoryScannerModal
      isOpen={scannerOpen}
      onClose={() => setScannerOpen(false)}
      onFound={agregarProducto}
    />
    </>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

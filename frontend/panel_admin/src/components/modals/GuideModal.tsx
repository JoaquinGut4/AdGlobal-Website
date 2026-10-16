import { useEffect, useRef, useState } from 'react';
import { FileText, Printer, Save } from 'lucide-react';
import { AdGlobalLogo } from '@/components/AdGlobalLogo';
import { Modal } from '@/components/ui/Modal';
import type { PedidoRegistro } from '@/types';

interface GuideModalProps {
  isOpen: boolean;
  pedido: PedidoRegistro | null;
  onClose: () => void;
}

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#2B5C94] focus:outline-none focus:ring-1 focus:ring-[#2B5C94]';

const MOTIVOS = [
  'Venta',
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
  'Venta con entrega a terceros',
];

export function GuideModal({ isOpen, pedido, onClose }: GuideModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [numeroGuia, setNumeroGuia] = useState('');
  const [fechaTraslado, setFechaTraslado] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!pedido || !isOpen) return;
    const sequence = pedido.numeroPedido.match(/(\d+)$/)?.[1] ?? '1';
    setNumeroGuia(sequence.padStart(6, '0'));
    setFechaTraslado(pedido.fechaEmision);
    setStatus('');
  }, [isOpen, pedido]);

  if (!pedido) return null;

  const destinatario = pedido.direccionLlegada.split(' · ')[0].replace(/^(Empresa|Persona natural):\s*/, '');

  const guardarBorrador = () => {
    if (!formRef.current) return;
    const data = Object.fromEntries(new FormData(formRef.current).entries());
    window.localStorage.setItem(`adglobal_guia_${pedido.id}`, JSON.stringify(data));
    setStatus('Borrador guardado en este navegador.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="guide-modal-title"
      title="Guía de remisión - Remitente"
      subtitle={`Documento asociado al pedido ${pedido.numeroPedido}`}
      icon={<FileText className="h-4 w-4" />}
      headerClass="bg-[#2B5C94]"
      panelClass="max-w-6xl"
    >
      <form ref={formRef} className="flex-1 overflow-y-auto bg-[#eef2f7] p-4 sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={guardarBorrador} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3 py-2 text-xs font-bold text-white hover:bg-[#1F4778]">
            <Save className="h-3.5 w-3.5" />
            Guardar borrador
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Printer className="h-3.5 w-3.5" />
            Imprimir / PDF
          </button>
          {status && <span role="status" className="text-xs font-semibold text-emerald-700">{status}</span>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:p-7">
          <div className="grid gap-5 border-b-2 border-[#2B5C94] pb-5 md:grid-cols-[1fr_330px]">
            <div>
              <AdGlobalLogo variant="brand" height={28} />
              <h2 className="mt-3 text-xl font-black text-[#2B5C94]">AD GLOBAL SOLUTIONS SAC</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Av. Húsares de Junín 527, Jesús María – Lima – Lima
              </p>
              <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[10px] text-[#2B5C94]">
                Formato digital basado en el prototipo de guía proporcionado.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border-2 border-[#2B5C94] text-center">
              <div className="px-4 py-3 text-lg font-black text-slate-800">RUC 20602583849</div>
              <div className="bg-[#2B5C94] px-4 py-3 text-sm font-black text-white">
                GUÍA DE REMISIÓN – REMITENTE
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-3 font-bold text-rose-700">
                <span>0001 - N°</span>
                <input name="numero_guia" value={numeroGuia} onChange={(event) => setNumeroGuia(event.target.value)} className="w-28 rounded border border-rose-200 px-2 py-1 text-center font-mono" />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <GuideSection title="Fechas del documento">
              <GuideField label="Fecha de emisión">
                <input type="date" name="fecha_emision" defaultValue={pedido.fechaEmision} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="Inicio del traslado">
                <input type="date" name="fecha_traslado" value={fechaTraslado} onChange={(event) => setFechaTraslado(event.target.value)} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Información del traslado">
              <GuideField label="Observaciones / referencia interna" full>
                <textarea name="observaciones" rows={3} defaultValue={pedido.observaciones} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Dirección de partida">
              <GuideField label="Dirección" full>
                <textarea name="direccion_partida" rows={3} defaultValue={pedido.direccionPartida} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Dirección de llegada">
              <GuideField label="Destinatario y dirección" full>
                <textarea name="direccion_llegada" rows={4} defaultValue={pedido.direccionLlegada} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Destinatario / Razón social">
              <GuideField label="Apellidos y nombres / Razón social" full>
                <input name="destinatario" defaultValue={destinatario} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="R.U.C.">
                <input name="destinatario_ruc" inputMode="numeric" maxLength={11} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="D.N.I.">
                <input name="destinatario_dni" inputMode="numeric" maxLength={8} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Unidad de transporte y conductor">
              <GuideField label="Vehículo, marca y placa" full><input name="vehiculo" className={FIELD_CLASS} /></GuideField>
              <GuideField label="Licencia de conducir"><input name="licencia" className={FIELD_CLASS} /></GuideField>
              <GuideField label="D.N.I. del conductor"><input name="conductor_dni" maxLength={8} className={FIELD_CLASS} /></GuideField>
            </GuideSection>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <div className="bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#2B5C94]">
              Descripción de los bienes trasladados
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="bg-slate-100 text-[10px] uppercase text-slate-500">
                  <tr><th className="px-3 py-2">Cant.</th><th className="px-3 py-2">Unid.</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2">Peso (kg)</th></tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="p-2"><input name="cantidad" type="number" min="1" defaultValue={pedido.cantidadProductos} className={FIELD_CLASS} /></td>
                    <td className="p-2"><input name="unidad" defaultValue={pedido.unidadMedida} className={FIELD_CLASS} /></td>
                    <td className="p-2"><textarea name="descripcion" rows={2} defaultValue={pedido.descripcionProductos} className={FIELD_CLASS} /></td>
                    <td className="p-2"><input name="peso" type="number" min="0" step="0.01" defaultValue="0" className={FIELD_CLASS} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <GuideSection title="Transportista">
              <GuideField label="Nombre / Razón social" full><input name="transportista" className={FIELD_CLASS} /></GuideField>
              <GuideField label="R.U.C."><input name="transportista_ruc" maxLength={11} className={FIELD_CLASS} /></GuideField>
              <GuideField label="Costo de traslado"><input name="costo_traslado" type="number" min="0" step="0.01" className={FIELD_CLASS} /></GuideField>
            </GuideSection>
            <GuideSection title="Comprobante de pago">
              <GuideField label="Tipo"><input name="comprobante_tipo" placeholder="Factura, boleta, etc." className={FIELD_CLASS} /></GuideField>
              <GuideField label="Número"><input name="comprobante_numero" className={FIELD_CLASS} /></GuideField>
            </GuideSection>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-[#2B5C94]">Motivo de traslado</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {MOTIVOS.map((motivo, index) => (
                <label key={motivo} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                  <input type="checkbox" name="motivo" value={motivo} defaultChecked={pedido.motivoTraslado === motivo} className="mt-0.5" />
                  <span>{index + 1}. {motivo}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-10 text-center text-xs font-bold text-slate-700 sm:grid-cols-2">
            <div><div className="mb-2 h-12 border-b border-slate-500" />Firma del remitente</div>
            <div><div className="mb-2 h-12 border-b border-slate-500" />Conformidad del cliente / destinatario</div>
          </div>

          <p className="mt-8 text-[9px] leading-relaxed text-slate-400">
            Este formato es una digitalización operativa y no sustituye una Guía de Remisión Electrónica válida ante SUNAT.
          </p>
        </div>
      </form>
    </Modal>
  );
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-[#2B5C94]">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function GuideField({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? 'sm:col-span-2' : ''}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

import { useEffect, useRef, useState } from 'react';
import { FileText, Printer, Save } from 'lucide-react';
import { AdGlobalLogo } from '@/components/AdGlobalLogo';
import { Modal } from '@/components/ui/Modal';
import logo from '@/assets/logo/adglobal-logo.png';
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

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}

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

  const segmentosLlegada = pedido.direccionLlegada.split(' · ');
  const destinatario = segmentosLlegada[0].replace(/^(Empresa|Persona natural):\s*/, '');
  const datoLlegada = (label: string) =>
    segmentosLlegada.find((segmento) => segmento.startsWith(`${label}:`))?.replace(`${label}:`, '').trim() ?? '';

  const guardarBorrador = () => {
    if (!formRef.current) return;
    const data = Object.fromEntries(new FormData(formRef.current).entries());
    window.localStorage.setItem(`adglobal_guia_${pedido.id}`, JSON.stringify(data));
    setStatus('Borrador guardado en este navegador.');
  };

  const imprimirGuia = () => {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) {
      setStatus('Completa los campos obligatorios antes de imprimir.');
      return;
    }

    const data = new FormData(formRef.current);
    const value = (name: string) => escapeHtml(data.get(name));
    const motivosSeleccionados = new Set(data.getAll('motivo').map(String));
    const logoUrl = new URL(logo, window.location.href).href;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      setStatus('El navegador bloqueó la ventana de impresión.');
      return;
    }

    const motivosHtml = MOTIVOS.map(
      (motivo, index) => `
        <div class="reason"><span class="check">${motivosSeleccionados.has(motivo) ? '✓' : ''}</span>${index + 1}. ${escapeHtml(motivo)}</div>`,
    ).join('');

    printWindow.document.write(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Guía ${value('numero_guia')}</title>
<style>
@page{size:A4 portrait;margin:7mm}*{box-sizing:border-box}body{margin:0;background:#fff;font-family:Arial,sans-serif;color:#183b6a;font-size:9px}.guide{width:100%;min-height:276mm;border:1.5px solid #285a97;padding:6mm;position:relative}.header{display:grid;grid-template-columns:1.15fr .85fr;gap:8px;align-items:stretch}.company{display:grid;grid-template-columns:170px 1fr;gap:9px;align-items:center}.logo{max-width:165px;filter:brightness(0) saturate(100%) invert(34%) sepia(18%) saturate(2026%) hue-rotate(171deg) brightness(89%) contrast(91%)}.company-info{text-align:center;font-weight:700;line-height:1.35}.services{border:1px dashed #285a97;border-radius:7px;padding:5px;margin-bottom:5px;text-align:left;font-size:8px}.docbox{border:2px solid #285a97;border-radius:10px;overflow:hidden;text-align:center}.ruc{font-size:20px;font-weight:900;padding:11px}.doctype{background:#285a97;color:#fff;padding:10px;font-size:15px;font-weight:900}.number{padding:11px;font-size:18px;font-weight:900;color:#c63d3d}.number strong{color:#285a97}.dates{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.date{display:grid;grid-template-columns:120px 1fr;border:1.5px solid #285a97;border-radius:6px;overflow:hidden}.date b{background:#285a97;color:#fff;padding:7px;text-transform:uppercase}.date span{padding:7px;color:#222}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.box{border:1.5px solid #285a97;border-radius:8px;overflow:hidden;min-height:59px}.box h3,.goods h3,.bottom h3{margin:0;background:#285a97;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.5px;padding:5px;font-size:10px}.box-content{padding:7px;color:#222;line-height:1.55;white-space:pre-wrap}.line{border-bottom:1px dotted #667992;min-height:17px;padding:2px 0}.goods{border:1.5px solid #285a97;border-radius:8px;overflow:hidden;margin-top:7px}.goods table{width:100%;border-collapse:collapse;color:#222}.goods th{background:#285a97;color:#fff;padding:5px;border-right:1px solid #fff;text-transform:uppercase}.goods td{border-right:1px solid #285a97;padding:7px;vertical-align:top}.goods .item{height:78mm}.bottom-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:7px;margin-top:7px}.bottom{border:1.5px solid #285a97;border-radius:8px;overflow:hidden}.bottom-content{padding:7px;color:#222}.reason-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px}.reason{display:flex;gap:5px;align-items:flex-start;line-height:1.2}.check{width:12px;height:12px;border:1px solid #285a97;display:inline-flex;align-items:center;justify-content:center;font-weight:900;flex:none}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin:18mm 20mm 0;text-align:center;color:#183b6a;font-weight:700}.signature{border-top:1px solid #183b6a;padding-top:5px}.foot{margin-top:8px;text-align:center;font-size:7px;color:#777}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.guide{page-break-inside:avoid}}
</style></head><body><main class="guide">
<section class="header"><div class="company"><img class="logo" src="${escapeHtml(logoUrl)}"><div class="company-info"><div class="services">Tecnología de Información<br>Sistemas Audiovisuales<br>Pantallas LED Gigantes<br>Computadoras y Portátiles<br>Impresoras y Proyectores Multimedia</div>Av. Húsares de Junín 527, Jesús María – Lima – Lima<br>Telf: 01-7353734 · Cel: 957586421 / 944825839<br>E-mail: atencionalcliente@adglobal.com</div></div><div class="docbox"><div class="ruc">RUC 20602583849</div><div class="doctype">GUÍA DE REMISIÓN - REMITENTE</div><div class="number"><strong>0001 -</strong> N° ${value('numero_guia')}</div></div></section>
<section class="dates"><div class="date"><b>Fecha de emisión</b><span>${value('fecha_emision')}</span></div><div class="date"><b>Inicio del traslado</b><span>${value('fecha_traslado')}</span></div></section>
<section class="grid2"><div class="box"><h3>Dirección de partida</h3><div class="box-content"><div class="line"><b>Dirección:</b> ${value('partida_direccion')}</div><div class="line"><b>Distrito:</b> ${value('partida_distrito')} &nbsp; <b>Provincia:</b> ${value('partida_provincia')} &nbsp; <b>Departamento:</b> ${value('partida_departamento')}</div></div></div><div class="box"><h3>Dirección de llegada</h3><div class="box-content"><div class="line"><b>Dirección:</b> ${value('llegada_direccion')}</div><div class="line"><b>Distrito:</b> ${value('llegada_distrito')} &nbsp; <b>Provincia:</b> ${value('llegada_provincia')} &nbsp; <b>Departamento:</b> ${value('llegada_departamento')}</div></div></div><div class="box"><h3>Dirección de partida</h3><div class="box-content"><div class="line"><b>Apellidos y nombres / Razón social:</b> ${value('destinatario')}</div><div class="line"><b>R.U.C.:</b> ${value('destinatario_ruc')} &nbsp; <b>D.I.:</b> ${value('destinatario_dni')}</div></div></div><div class="box"><h3>Unidad de transporte y conductor</h3><div class="box-content"><div class="line"><b>Vehículo, marca y placa:</b> ${value('vehiculo')}</div><div class="line"><b>Certificado de inscripción:</b> ${value('certificado')}</div><div class="line"><b>Licencia de conductor:</b> ${value('licencia')} &nbsp; <b>D.I.:</b> ${value('conductor_dni')}</div></div></div></section>
<section class="goods"><h3>Descripción de los bienes trasladados</h3><table><thead><tr><th style="width:9%">Cant.</th><th style="width:11%">Unid. de med.</th><th>Descripción</th><th style="width:24%">Observaciones</th><th style="width:12%">Peso total</th></tr></thead><tbody><tr class="item"><td>${value('cantidad')}</td><td>${value('unidad')}</td><td>${value('descripcion')}</td><td>${value('item_observaciones')}</td><td>${value('peso')} kg</td></tr></tbody></table></section>
<section class="bottom-grid"><div><div class="bottom"><h3>Transportista</h3><div class="bottom-content"><div class="line"><b>Nombre:</b> ${value('transportista')}</div><div class="line"><b>R.U.C.:</b> ${value('transportista_ruc')}</div><div class="line"><b>Costo de traslado:</b> ${value('costo_traslado')}</div></div></div><div class="bottom" style="margin-top:6px"><h3>Comprobante de pago</h3><div class="bottom-content"><b>Tipo:</b> ${value('comprobante_tipo')} &nbsp; <b>N°:</b> ${value('comprobante_numero')}</div></div></div><div class="bottom"><h3>Motivo de traslado</h3><div class="bottom-content reason-grid">${motivosHtml}</div></div></section>
<section class="signatures"><div class="signature">Firma del remitente</div><div class="signature">Conformidad del cliente / destinatario</div></section><p class="foot">Formato operativo. La emisión tributaria debe cumplir los requisitos vigentes de SUNAT.</p></main>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
    printWindow.document.close();
    setStatus('Vista de impresión generada.');
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
          <button type="button" onClick={imprimirGuia} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
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
                <br />
                Telf: 01-7353734
                <br />
                Cel: 957586421 / 944825839
                <br />
                E-mail: atencionalcliente@adglobal.com
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

            <GuideSection title="Dirección de partida">
              <GuideField label="Dirección" full>
                <input name="partida_direccion" value="Av. Húsares de Junín 527" readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} />
              </GuideField>
              <GuideField label="Distrito">
                <input name="partida_distrito" value="Jesús María" readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} />
              </GuideField>
              <GuideField label="Provincia">
                <input name="partida_provincia" value="Lima" readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} />
              </GuideField>
              <GuideField label="Departamento" full>
                <input name="partida_departamento" value="Lima" readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Dirección de llegada">
              <GuideField label="Dirección" full>
                <input name="llegada_direccion" defaultValue={datoLlegada('Dirección')} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="Distrito">
                <input name="llegada_distrito" defaultValue={datoLlegada('Distrito')} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="Provincia">
                <input name="llegada_provincia" defaultValue={datoLlegada('Provincia')} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="Departamento" full>
                <input name="llegada_departamento" defaultValue={datoLlegada('Departamento')} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Dirección de partida">
              <GuideField label="Apellidos y nombres / Razón social" full>
                <input name="destinatario" defaultValue={destinatario} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="R.U.C.">
                <input name="destinatario_ruc" inputMode="numeric" maxLength={11} className={FIELD_CLASS} />
              </GuideField>
              <GuideField label="D.I.">
                <input name="destinatario_dni" inputMode="numeric" maxLength={8} className={FIELD_CLASS} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Unidad de transporte y conductor">
              <GuideField label="Vehículo, marca y placa" full><input name="vehiculo" className={FIELD_CLASS} /></GuideField>
              <GuideField label="Certificado de inscripción" full><input name="certificado" className={FIELD_CLASS} /></GuideField>
              <GuideField label="Licencia de conductor"><input name="licencia" className={FIELD_CLASS} /></GuideField>
              <GuideField label="D.I."><input name="conductor_dni" maxLength={12} className={FIELD_CLASS} /></GuideField>
            </GuideSection>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <div className="bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#2B5C94]">
              Descripción de los bienes trasladados
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="bg-slate-100 text-[10px] uppercase text-slate-500">
                  <tr><th className="px-3 py-2">Cant.</th><th className="px-3 py-2">Unid.</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2">Observaciones</th><th className="px-3 py-2">Peso (kg)</th></tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="p-2"><input name="cantidad" type="number" min="1" value={pedido.cantidadProductos} readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} /></td>
                    <td className="p-2"><input name="unidad" defaultValue={pedido.unidadMedida} className={FIELD_CLASS} /></td>
                    <td className="p-2"><textarea name="descripcion" rows={2} value={pedido.descripcionProductos} readOnly className={`${FIELD_CLASS} bg-slate-100 text-slate-600`} /></td>
                    <td className="p-2"><textarea name="item_observaciones" rows={2} defaultValue={pedido.observaciones} placeholder="Observaciones del producto trasladado" className={FIELD_CLASS} /></td>
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

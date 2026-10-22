import { useEffect, useRef, useState } from 'react';
import { FileText, Lock, Printer, Save } from 'lucide-react';
import { AdGlobalLogo } from '@/components/AdGlobalLogo';
import { Modal } from '@/components/ui/Modal';
import { ADMIN_CONFIG } from '@/config/site';
import { ApiError, apiRequest } from '@/lib/api';
import logo from '@/assets/logo/adglobal-logo.png';
import type { PedidoRegistro } from '@/types';

interface GuideModalProps {
  isOpen: boolean;
  pedido: PedidoRegistro | null;
  onClose: () => void;
}

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs focus:border-[#2B5C94] focus:outline-none focus:ring-1 focus:ring-[#2B5C94]';

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

interface BienTrasladado {
  id: string;
  descripcion: string;
  cantidad: string;
  unidad: string;
  observaciones: string;
  peso: string;
}

interface GuideRecord {
  id: string; pedidoId: string; numeroGuia: string; fechaTraslado: string;
  destinatarioRuc: string; destinatarioDocumento: string; vehiculo: string; certificado: string;
  licencia: string; conductorDocumento: string; transportista: string; transportistaRuc: string;
  costoTraslado: number; comprobanteTipo: string; comprobanteNumero: string; motivos: string[];
  estado: 'Borrador' | 'Emitida'; bienes: Array<{ descripcion: string; cantidad: number; unidad: string; observaciones: string; peso: number }>;
}

/** Crea una fila por producto. La cantidad total del pedido se reparte entre las líneas. */
function crearBienes(pedido: PedidoRegistro): BienTrasladado[] {
  const lineas = pedido.descripcionProductos
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);
  if (lineas.length === 0) return [];

  const total = Math.max(0, Number(pedido.cantidadProductos) || 0);
  const base = Math.floor(total / lineas.length);
  const resto = total - base * lineas.length;

  return lineas.map((linea, index) => ({
    id: `bien-${index}`,
    descripcion: linea,
    cantidad: String(base + (index < resto ? 1 : 0)),
    unidad: pedido.unidadMedida,
    observaciones: index === 0 ? pedido.observaciones : '',
    peso: '0',
  }));
}

export function GuideModal({ isOpen, pedido, onClose }: GuideModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [numeroGuia, setNumeroGuia] = useState('');
  const [fechaTraslado, setFechaTraslado] = useState('');
  const [status, setStatus] = useState('');
  const [bienes, setBienes] = useState<BienTrasladado[]>([]);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!pedido || !isOpen) return;
    const sequence = pedido.numeroPedido.match(/(\d+)$/)?.[1] ?? '1';
    setNumeroGuia(sequence.padStart(6, '0'));
    setFechaTraslado(pedido.fechaEmision);
    setStatus('');
    setBienes(crearBienes(pedido));
    void apiRequest<GuideRecord>(`/pedidos/${pedido.id}/guia`).then((guide) => {
      setNumeroGuia(guide.numeroGuia);
      setFechaTraslado(guide.fechaTraslado);
      setBienes(guide.bienes.map((item, index) => ({ id: `bien-${index}`, descripcion: item.descripcion, cantidad: String(item.cantidad), unidad: item.unidad, observaciones: item.observaciones, peso: String(item.peso) })));
      window.setTimeout(() => {
        if (!formRef.current) return;
        const values: Record<string, string> = { destinatario_ruc: guide.destinatarioRuc, destinatario_dni: guide.destinatarioDocumento, vehiculo: guide.vehiculo, certificado: guide.certificado, licencia: guide.licencia, conductor_dni: guide.conductorDocumento, transportista: guide.transportista, transportista_ruc: guide.transportistaRuc, costo_traslado: String(guide.costoTraslado), comprobante_tipo: guide.comprobanteTipo, comprobante_numero: guide.comprobanteNumero };
        for (const [name, value] of Object.entries(values)) { const field = formRef.current.elements.namedItem(name) as HTMLInputElement | null; if (field) field.value = value; }
        formRef.current.querySelectorAll<HTMLInputElement>('input[name="motivo"]').forEach(input => { input.checked = guide.motivos.includes(input.value); });
      });
      setStatus(`Guía cargada · ${guide.estado}`);
    }).catch((error) => { if (!(error instanceof ApiError && error.status === 404)) setStatus(error instanceof Error ? error.message : 'No se pudo cargar la guía.'); });
  }, [isOpen, pedido]);

  if (!pedido) return null;

  const soloLectura = pedido.estadoPedido === 'Finalizado';
  const fieldClass = `${FIELD_CLASS} ${soloLectura ? 'bg-slate-100 text-slate-600' : 'bg-white text-slate-800'}`;
  const formatearNumero = (value: number) =>
    value.toLocaleString('es-PE', { maximumFractionDigits: 2 });
  const totalCantidad = bienes.reduce((total, bien) => total + (Number(bien.cantidad) || 0), 0);
  const totalPeso = bienes.reduce((total, bien) => total + (Number(bien.peso) || 0), 0);

  const actualizarBien = (
    index: number,
    campo: 'cantidad' | 'unidad' | 'observaciones' | 'peso',
    valor: string,
  ) => {
    setBienes((current) =>
      current.map((bien, position) => (position === index ? { ...bien, [campo]: valor } : bien)),
    );
  };
  const segmentosLlegada = pedido.direccionLlegada.split(' · ');
  const destinatario = segmentosLlegada[0].replace(/^(Empresa|Persona natural):\s*/, '');
  const datoLlegada = (label: string) =>
    segmentosLlegada.find((segmento) => segmento.startsWith(`${label}:`))?.replace(`${label}:`, '').trim() ?? '';

  const payloadGuia = (estado: 'Borrador' | 'Emitida') => {
    const data = new FormData(formRef.current ?? undefined);
    const text = (name: string) => String(data.get(name) ?? '');
    return {
      numeroGuia,
      fechaTraslado,
      destinatarioRuc: text('destinatario_ruc'),
      destinatarioDocumento: text('destinatario_dni'),
      vehiculo: text('vehiculo'),
      certificado: text('certificado'),
      licencia: text('licencia'),
      conductorDocumento: text('conductor_dni'),
      transportista: text('transportista'),
      transportistaRuc: text('transportista_ruc'),
      costoTraslado: Number(text('costo_traslado')) || 0,
      comprobanteTipo: text('comprobante_tipo'),
      comprobanteNumero: text('comprobante_numero'),
      motivos: Array.from(formRef.current?.querySelectorAll<HTMLInputElement>('input[name="motivo"]:checked') ?? []).map((input) => input.value),
      estado,
      bienes: bienes.map((item) => ({ descripcion: item.descripcion, cantidad: Number(item.cantidad) || 0, unidad: item.unidad, observaciones: item.observaciones, peso: Number(item.peso) || 0 })),
    };
  };

  const guardar = async (estado: 'Borrador' | 'Emitida') => {
    try {
      await apiRequest(`/pedidos/${pedido.id}/guia`, { method: 'PUT', body: JSON.stringify(payloadGuia(estado)) });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        await apiRequest(`/pedidos/${pedido.id}/guia`, { method: 'POST', body: JSON.stringify(payloadGuia(estado)) });
      } else {
        throw error;
      }
    }
  };

  const guardarBorrador = async () => {
    if (soloLectura) return;
    try {
      await guardar('Borrador');
      setStatus('Borrador guardado en la base de datos.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar el borrador.');
    }
  };

  const descargarPdf = async () => {
    const response = await fetch(`${ADMIN_CONFIG.apiUrl}/pedidos/${pedido.id}/guia/pdf`, { credentials: 'include' });
    if (!response.ok) {
      setStatus('No se pudo descargar el PDF.');
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `guia-${numeroGuia}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const imprimirGuia = async () => {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) {
      setStatus('Completa los campos obligatorios antes de imprimir.');
      return;
    }
    try {
      await guardar('Emitida');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar la guía.');
      return;
    }

    const data = new FormData(formRef.current);
    const value = (name: string) => escapeHtml(data.get(name));
    const motivosSeleccionados = new Set(
      Array.from(formRef.current.querySelectorAll<HTMLInputElement>('input[name="motivo"]:checked')).map(
        (input) => input.value,
      ),
    );
    const logoUrl = new URL(logo, window.location.href).href;

    const bienesHtml = bienes.length > 0
      ? bienes
          .map((bien) => {
            const [sku, ...resto] = bien.descripcion.split(' · ');
            const detalle = resto.join(' · ');
            return `<tr class="item"><td>${escapeHtml(bien.cantidad || '0')}</td><td>${escapeHtml(bien.unidad)}</td><td><strong>${escapeHtml(sku)}</strong>${detalle ? ` · ${escapeHtml(detalle)}` : ''}</td><td>${escapeHtml(bien.observaciones)}</td><td>${escapeHtml(bien.peso || '0')} kg</td></tr>`;
          })
          .join('')
      : '<tr class="item"><td colspan="5">Sin productos registrados</td></tr>';

    const totalesHtml = bienes.length > 0
      ? `<tfoot><tr><td>${escapeHtml(formatearNumero(totalCantidad))}</td><td></td><td colspan="2">Total (${bienes.length} ${bienes.length === 1 ? 'producto' : 'productos'})</td><td>${escapeHtml(formatearNumero(totalPeso))} kg</td></tr></tfoot>`
      : '';
    const alturaRelleno = Math.max(0, 78 - bienes.length * 7);
    const rellenoHtml = alturaRelleno > 0
      ? `<tr class="filler" style="height:${alturaRelleno}mm"><td></td><td></td><td></td><td></td><td></td></tr>`
      : '';
    const cuerpoHtml = `${bienesHtml}${rellenoHtml}`;


    const motivosHtml = MOTIVOS.map(
      (motivo, index) => `
        <div class="reason"><span class="check">${motivosSeleccionados.has(motivo) ? '✓' : ''}</span>${index + 1}. ${escapeHtml(motivo)}</div>`,
    ).join('');

    const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Guía ${value('numero_guia')}</title>
<style>
@page{size:A4 portrait;margin:7mm}*{box-sizing:border-box}body{margin:0;background:#fff;font-family:Arial,sans-serif;color:#183b6a;font-size:9px}.guide{width:100%;min-height:276mm;border:1.5px solid #285a97;padding:6mm;position:relative}.header{display:grid;grid-template-columns:1.15fr .85fr;gap:8px;align-items:stretch}.company{display:grid;grid-template-columns:170px 1fr;gap:9px;align-items:center}.logo{max-width:165px;filter:brightness(0) saturate(100%) invert(34%) sepia(18%) saturate(2026%) hue-rotate(171deg) brightness(89%) contrast(91%)}.company-info{text-align:center;font-weight:700;line-height:1.35}.services{border:1px dashed #285a97;border-radius:7px;padding:5px;margin-bottom:5px;text-align:left;font-size:8px}.docbox{border:2px solid #285a97;border-radius:10px;overflow:hidden;text-align:center}.ruc{font-size:20px;font-weight:900;padding:11px}.doctype{background:#285a97;color:#fff;padding:10px;font-size:15px;font-weight:900}.number{padding:11px;font-size:18px;font-weight:900;color:#c63d3d}.number strong{color:#285a97}.dates{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.date{display:grid;grid-template-columns:120px 1fr;border:1.5px solid #285a97;border-radius:6px;overflow:hidden}.date b{background:#285a97;color:#fff;padding:7px;text-transform:uppercase}.date span{padding:7px;color:#222}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.box{border:1.5px solid #285a97;border-radius:8px;overflow:hidden;min-height:59px}.box h3,.goods h3,.bottom h3{margin:0;background:#285a97;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.5px;padding:5px;font-size:10px}.box-content{padding:7px;color:#222;line-height:1.55;white-space:pre-wrap}.line{border-bottom:1px dotted #667992;min-height:17px;padding:2px 0}.goods{border:1.5px solid #285a97;border-radius:8px;overflow:hidden;margin-top:7px}.goods table{width:100%;border-collapse:collapse;color:#222}.goods .filler td{padding:0}.goods thead{display:table-header-group}.goods th{background:#285a97;color:#fff;padding:5px;border-right:1px solid #fff;text-transform:uppercase}.goods td{border-right:1px solid #285a97;padding:7px;vertical-align:top}.goods tfoot td{border-top:1.5px solid #285a97;background:#eef2f7;font-weight:700}.bottom-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:7px;margin-top:7px}.bottom{border:1.5px solid #285a97;border-radius:8px;overflow:hidden}.bottom-content{padding:7px;color:#222}.reason-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px}.reason{display:flex;gap:5px;align-items:flex-start;line-height:1.2}.check{width:12px;height:12px;border:1px solid #285a97;display:inline-flex;align-items:center;justify-content:center;font-weight:900;flex:none}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin:18mm 20mm 0;text-align:center;color:#183b6a;font-weight:700}.signature{border-top:1px solid #183b6a;padding-top:5px}.foot{margin-top:8px;text-align:center;font-size:7px;color:#777}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.goods tr,.signatures{page-break-inside:avoid}}
</style></head><body><main class="guide">
<section class="header"><div class="company"><img class="logo" src="${escapeHtml(logoUrl)}"><div class="company-info"><div class="services">Tecnología de Información<br>Sistemas Audiovisuales<br>Pantallas LED Gigantes<br>Computadoras y Portátiles<br>Impresoras y Proyectores Multimedia</div>Av. Húsares de Junín 527, Jesús María – Lima – Lima<br>Telf: 01-7353734 · Cel: 957586421 / 944825839<br>E-mail: atencionalcliente@adglobal.com</div></div><div class="docbox"><div class="ruc">RUC 20602583849</div><div class="doctype">GUÍA DE REMISIÓN - REMITENTE</div><div class="number"><strong>0001 -</strong> N° ${value('numero_guia')}</div></div></section>
<section class="dates"><div class="date"><b>Fecha de emisión</b><span>${value('fecha_emision')}</span></div><div class="date"><b>Inicio del traslado</b><span>${value('fecha_traslado')}</span></div></section>
<section class="grid2"><div class="box"><h3>Dirección de partida</h3><div class="box-content"><div class="line"><b>Dirección:</b> ${value('partida_direccion')}</div><div class="line"><b>Distrito:</b> ${value('partida_distrito')} &nbsp; <b>Provincia:</b> ${value('partida_provincia')} &nbsp; <b>Departamento:</b> ${value('partida_departamento')}</div></div></div><div class="box"><h3>Dirección de llegada</h3><div class="box-content"><div class="line"><b>Dirección:</b> ${value('llegada_direccion')}</div><div class="line"><b>Distrito:</b> ${value('llegada_distrito')} &nbsp; <b>Provincia:</b> ${value('llegada_provincia')} &nbsp; <b>Departamento:</b> ${value('llegada_departamento')}</div></div></div><div class="box"><h3>Dirección de partida</h3><div class="box-content"><div class="line"><b>Apellidos y nombres / Razón social:</b> ${value('destinatario')}</div><div class="line"><b>R.U.C.:</b> ${value('destinatario_ruc')} &nbsp; <b>D.I.:</b> ${value('destinatario_dni')}</div></div></div><div class="box"><h3>Unidad de transporte y conductor</h3><div class="box-content"><div class="line"><b>Vehículo, marca y placa:</b> ${value('vehiculo')}</div><div class="line"><b>Certificado de inscripción:</b> ${value('certificado')}</div><div class="line"><b>Licencia de conductor:</b> ${value('licencia')} &nbsp; <b>D.I.:</b> ${value('conductor_dni')}</div></div></div></section>
<section class="goods"><h3>Descripción de los bienes trasladados</h3><table><thead><tr><th style="width:9%">Cant.</th><th style="width:11%">Unid. de med.</th><th>Descripción</th><th style="width:24%">Observaciones</th><th style="width:12%">Peso total</th></tr></thead><tbody>${cuerpoHtml}</tbody>${totalesHtml}</table></section>
<section class="bottom-grid"><div><div class="bottom"><h3>Transportista</h3><div class="bottom-content"><div class="line"><b>Nombre:</b> ${value('transportista')}</div><div class="line"><b>R.U.C.:</b> ${value('transportista_ruc')}</div><div class="line"><b>Costo de traslado:</b> ${value('costo_traslado')}</div></div></div><div class="bottom" style="margin-top:6px"><h3>Comprobante de pago</h3><div class="bottom-content"><b>Tipo:</b> ${value('comprobante_tipo')} &nbsp; <b>N°:</b> ${value('comprobante_numero')}</div></div></div><div class="bottom"><h3>Motivo de traslado</h3><div class="bottom-content reason-grid">${motivosHtml}</div></div></section>
<section class="signatures"><div class="signature">Firma del remitente</div><div class="signature">Conformidad del cliente / destinatario</div></section><p class="foot">Formato operativo. La emisión tributaria debe cumplir los requisitos vigentes de SUNAT.</p></main>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`;

    const preview = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(
        '</head>',
        '<style>@media screen{html,body{background:#e5e7eb}body{max-width:210mm;margin:0 auto;padding:12px}}</style></head>',
      );
    setPreviewHtml(preview);
    setStatus('Vista previa generada. Revisa el documento y usa «Imprimir / Guardar PDF».');
  };

  const imprimirVistaPrevia = () => {
    const frame = previewRef.current;
    const view = frame?.contentWindow;
    if (!frame || !view || !frame.contentDocument?.body) {
      setStatus('La vista previa aún se está cargando. Intenta de nuevo.');
      return;
    }
    view.focus();
    view.print();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!previewHtml) onClose();
        }}
        labelledBy="guide-modal-title"
      title="Guía de remisión - Remitente"
      subtitle={`Documento asociado al pedido ${pedido.numeroPedido}`}
      icon={<FileText className="h-4 w-4" />}
      headerClass="bg-[#2B5C94]"
      panelClass="max-w-6xl"
    >
      <form ref={formRef} className="flex-1 overflow-y-auto bg-[#eef2f7] p-4 sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {soloLectura ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              <Lock className="h-3.5 w-3.5" />
              Guía bloqueada · pedido finalizado
            </span>
          ) : (
            <button type="button" onClick={() => void guardarBorrador()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3 py-2 text-xs font-bold text-white hover:bg-[#1F4778]">
              <Save className="h-3.5 w-3.5" />
              Guardar borrador
            </button>
          )}
          <button type="button" onClick={() => void imprimirGuia()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
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
                <input
                  name="numero_guia"
                  value={numeroGuia}
                  onChange={(event) => setNumeroGuia(event.target.value)}
                  readOnly={soloLectura}
                  className={`w-28 rounded border border-rose-200 px-2 py-1 text-center font-mono ${soloLectura ? 'bg-slate-100 text-slate-600' : ''}`}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <GuideSection title="Fechas del documento">
              <GuideField label="Fecha de emisión">
                <input type="date" name="fecha_emision" defaultValue={pedido.fechaEmision} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
              <GuideField label="Inicio del traslado">
                <input type="date" name="fecha_traslado" value={fechaTraslado} onChange={(event) => setFechaTraslado(event.target.value)} readOnly={soloLectura} className={fieldClass} />
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
                <input name="llegada_direccion" defaultValue={datoLlegada('Dirección')} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
              <GuideField label="Distrito">
                <input name="llegada_distrito" defaultValue={datoLlegada('Distrito')} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
              <GuideField label="Provincia">
                <input name="llegada_provincia" defaultValue={datoLlegada('Provincia')} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
              <GuideField label="Departamento" full>
                <input name="llegada_departamento" defaultValue={datoLlegada('Departamento')} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Dirección de partida">
              <GuideField label="Apellidos y nombres / Razón social" full>
                <input name="destinatario" defaultValue={destinatario} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
              <GuideField label="R.U.C.">
                <input name="destinatario_ruc" inputMode="numeric" maxLength={11} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
              <GuideField label="D.I.">
                <input name="destinatario_dni" inputMode="numeric" maxLength={8} readOnly={soloLectura} className={fieldClass} />
              </GuideField>
            </GuideSection>

            <GuideSection title="Unidad de transporte y conductor">
              <GuideField label="Vehículo, marca y placa" full><input name="vehiculo" readOnly={soloLectura} className={fieldClass} /></GuideField>
              <GuideField label="Certificado de inscripción" full><input name="certificado" readOnly={soloLectura} className={fieldClass} /></GuideField>
              <GuideField label="Licencia de conductor"><input name="licencia" readOnly={soloLectura} className={fieldClass} /></GuideField>
              <GuideField label="D.I."><input name="conductor_dni" maxLength={12} readOnly={soloLectura} className={fieldClass} /></GuideField>
            </GuideSection>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2B5C94]">
                Descripción de los bienes trasladados
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {bienes.length} {bienes.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="bg-slate-100 text-[10px] uppercase text-slate-500">
                  <tr><th className="px-3 py-2">Cant.</th><th className="px-3 py-2">Unid.</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2">Observaciones</th><th className="px-3 py-2">Peso total</th></tr>
                </thead>
                <tbody>
                  {bienes.length > 0 ? bienes.map((bien, index) => {
                    const [sku, ...resto] = bien.descripcion.split(' · ');
                    const detalle = resto.join(' · ');
                    return (
                      <tr key={bien.id} className="border-t border-slate-200 align-top">
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={bien.cantidad}
                            onChange={(event) => actualizarBien(index, 'cantidad', event.target.value)}
                            readOnly={soloLectura}
                            aria-label={`Cantidad de ${sku}`}
                            className={`${fieldClass} text-right font-mono`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={bien.unidad}
                            onChange={(event) => actualizarBien(index, 'unidad', event.target.value)}
                            readOnly={soloLectura}
                            aria-label={`Unidad de medida de ${sku}`}
                            className={fieldClass}
                          />
                        </td>
                        <td className="p-2">
                          <p className="text-xs leading-relaxed text-slate-700">
                            <span className="font-mono font-bold text-[#2B5C94]">{sku}</span>
                            {detalle && <span className="text-slate-600"> · {detalle}</span>}
                          </p>
                        </td>
                        <td className="p-2">
                          <textarea
                            rows={2}
                            value={bien.observaciones}
                            onChange={(event) => actualizarBien(index, 'observaciones', event.target.value)}
                            readOnly={soloLectura}
                            aria-label={`Observaciones de ${sku}`}
                            placeholder="Observaciones del producto trasladado"
                            className={fieldClass}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={bien.peso}
                            onChange={(event) => actualizarBien(index, 'peso', event.target.value)}
                            readOnly={soloLectura}
                            aria-label={`Peso de ${sku}`}
                            className={`${fieldClass} text-right font-mono`}
                          />
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                        Sin productos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
                {bienes.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-800">
                      <td className="p-2 text-right font-mono">{formatearNumero(totalCantidad)}</td>
                      <td className="p-2" />
                      <td colSpan={2} className="p-2 text-right text-[10px] uppercase tracking-wide text-slate-500">
                        Total · {bienes.length} {bienes.length === 1 ? 'producto' : 'productos'}
                      </td>
                      <td className="p-2 font-mono">{formatearNumero(totalPeso)} kg</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <GuideSection title="Transportista">
              <GuideField label="Nombre / Razón social" full><input name="transportista" readOnly={soloLectura} className={fieldClass} /></GuideField>
              <GuideField label="R.U.C."><input name="transportista_ruc" maxLength={11} readOnly={soloLectura} className={fieldClass} /></GuideField>
              <GuideField label="Costo de traslado"><input name="costo_traslado" type="number" min="0" step="0.01" readOnly={soloLectura} className={fieldClass} /></GuideField>
            </GuideSection>
            <GuideSection title="Comprobante de pago">
              <GuideField label="Tipo"><input name="comprobante_tipo" placeholder="Factura, boleta, etc." readOnly={soloLectura} className={fieldClass} /></GuideField>
              <GuideField label="Número"><input name="comprobante_numero" readOnly={soloLectura} className={fieldClass} /></GuideField>
            </GuideSection>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-[#2B5C94]">Motivo de traslado</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {MOTIVOS.map((motivo, index) => (
                <label key={motivo} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                  <input type="checkbox" name="motivo" value={motivo} defaultChecked={pedido.motivoTraslado === motivo} disabled={soloLectura} className="mt-0.5" />
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

      <Modal
        isOpen={previewHtml !== null}
        onClose={() => setPreviewHtml(null)}
        labelledBy="guide-preview-title"
        title="Vista previa de la guía"
        subtitle={`Documento asociado al pedido ${pedido.numeroPedido}`}
        icon={<Printer className="h-4 w-4" />}
        headerClass="bg-slate-800"
        panelClass="max-w-6xl"
      >
        <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">
              Revisa el documento antes de imprimir o guardar como PDF.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={imprimirVistaPrevia}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3 py-2 text-xs font-bold text-white hover:bg-[#1F4778]"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir / Guardar PDF
              </button>
              <button
                type="button"
                onClick={() => void descargarPdf()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-[#2B5C94] hover:bg-blue-50"
              >
                <FileText className="h-3.5 w-3.5" />
                Descargar PDF
              </button>
              <button
                type="button"
                onClick={() => setPreviewHtml(null)}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Volver
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <iframe
              ref={previewRef}
              title={`Vista previa de la guía ${pedido.numeroPedido}`}
              srcDoc={previewHtml ?? ''}
              className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white shadow-xs"
            />
          </div>
        </div>
      </Modal>
    </>
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

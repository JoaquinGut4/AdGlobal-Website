import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ScanLine, Search, Upload, Wrench } from 'lucide-react';
import { InventoryScannerModal } from '@/components/modals/InventoryScannerModal';
import { Modal } from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';
import { toSupportTicket } from '@/lib/tickets';
import type { TicketApiResponse } from '@/lib/tickets';
import type { InventarioRegistro, PedidoRegistro, SupportTicket } from '@/types';

interface Props {
  ticket: SupportTicket | null;
  inventario: InventarioRegistro[];
  pedidos: PedidoRegistro[];
  onClose: () => void;
  onUpdated: (ticket: SupportTicket) => void | Promise<void>;
}

const UNAVAILABLE = new Set(['Alquiler', 'Venta', 'Diagnóstico', 'Reparación', 'Reemplazo requerido', 'Reservado para reemplazo', 'Baja']);

/** Los equipos alquilados se atienden desde un ticket por pedido, no desde inventario. */
function estaEnAlquiler(item: InventarioRegistro): boolean {
  return item.estado.toLowerCase().includes('alquiler')
    || item.ubicacion.toLowerCase() === 'alquilado'
    || Boolean(item.pedidoActivo);
}

export function TicketWorkflowModal({ ticket, inventario, pedidos, onClose, onUpdated }: Props) {
  const [current, setCurrent] = useState<SupportTicket | null>(ticket);
  const [repairable, setRepairable] = useState<boolean | null>(null);
  const [replacementIds, setReplacementIds] = useState<string[]>([]);
  const [affectedIds, setAffectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [affectedSearch, setAffectedSearch] = useState('');
  const [scannerMode, setScannerMode] = useState<'affected' | 'replacement' | null>(null);
  const [solution, setSolution] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrent(ticket);
    setRepairable(ticket?.reparable ?? null);
    setReplacementIds(ticket?.equiposReemplazoIds ?? []);
    setAffectedIds(ticket?.equiposIds ?? []);
    setSolution(ticket?.descripcionSolucion ?? '');
    setFiles([]);
    setAffectedSearch('');
    setScannerMode(null);
    setError('');
  }, [ticket]);

  const affected = useMemo(() => inventario.filter((item) => affectedIds.includes(item.id)), [affectedIds, inventario]);
  const affectedCandidates = useMemo(() => {
    if (!current) return [];
    const term = affectedSearch.trim().toLowerCase();
    if (current.tipoTicket === 'pedido') {
      const order = pedidos.find((item) => item.numeroPedido === current.numeroPedido && item.estadoPedido !== 'Finalizado');
      const assigned = new Set(Object.keys(order?.estadosAnteriores ?? {}));
      return inventario.filter((item) => assigned.has(item.id));
    }
    // Ticket general: cualquier equipo del inventario puede ingresar al flujo,
    // sin limitarse al estado de referencia elegido al aperturarlo.
    return inventario
      .filter((item) => !estaEnAlquiler(item))
      .filter((item) => !term || [item.sku, item.descripcion, item.marca, item.estado]
        .join(' ').toLowerCase().includes(term))
      .sort((a, b) => Number(b.estado === current.estadoEquipo) - Number(a.estado === current.estadoEquipo) || a.sku.localeCompare(b.sku));
  }, [affectedIds, affectedSearch, current, inventario, pedidos]);
  const candidates = useMemo(() => inventario.filter((item) =>
    !affectedIds.includes(item.id) && !UNAVAILABLE.has(item.estado) &&
    [item.sku, item.descripcion, item.marca].join(' ').toLowerCase().includes(search.toLowerCase()),
  ), [affectedIds, inventario, search]);
  const selectedReplacements = useMemo(
    () => replacementIds.map((id) => inventario.find((item) => item.id === id)).filter((item): item is InventarioRegistro => Boolean(item)),
    [inventario, replacementIds],
  );

  if (!current) return null;
  const flowPending = (current.flujo ?? 'Pendiente') === 'Pendiente';
  const showSolution = !flowPending && (
    current.flujo === 'General' ||
    (current.flujo === 'Reparación' && repairable === true) ||
    (current.flujo === 'Reemplazo' && repairable === false)
  );
  const replacementCountMatches = repairable !== false || (affectedIds.length > 0 && replacementIds.length === affectedIds.length);
  const canSaveDiagnosis = affectedIds.length > 0 &&
    (current.tipoTicket !== 'pedido' || repairable !== null) && replacementCountMatches;

  const saveDiagnosis = async () => {
    if (affectedIds.length === 0) { setError('Selecciona al menos un equipo afectado.'); return; }
    if (current.tipoTicket === 'pedido' && repairable === null) { setError('Indica si los equipos son reparables.'); return; }
    if (current.tipoTicket === 'pedido' && repairable === false && replacementIds.length !== affected.length) {
      setError(`Selecciona ${affected.length} equipo(s) de reemplazo.`); return;
    }
    setSaving(true); setError('');
    try {
      const response = await apiRequest<TicketApiResponse>(`/tickets/${current.id}/diagnostico`, {
        method: 'POST', body: JSON.stringify({ equiposAfectadosIds: affectedIds, reparable: current.tipoTicket === 'pedido' ? repairable : null, equiposReemplazoIds: repairable === false ? replacementIds : [] }),
      });
      const updated = toSupportTicket(response); setCurrent(updated); await onUpdated(updated);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el diagnóstico.'); }
    finally { setSaving(false); }
  };

  const resolve = async () => {
    if (!solution.trim()) { setError('Describe la solución aplicada.'); return; }
    if (files.length === 0 && !(current.evidencias?.length)) { setError('Adjunta al menos una evidencia.'); return; }
    setSaving(true); setError('');
    try {
      const evidencias = [...(current.evidencias ?? [])];
      for (const file of files) {
        const form = new FormData(); form.append('file', file);
        const uploaded = await apiRequest<{ url: string }>('/tickets/evidencias', { method: 'POST', body: form });
        evidencias.push(uploaded.url);
      }
      const response = await apiRequest<TicketApiResponse>(`/tickets/${current.id}/resolver`, {
        method: 'POST', body: JSON.stringify({ evidencias, descripcionSolucion: solution.trim() }),
      });
      const updated = toSupportTicket(response); await onUpdated(updated); onClose();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo resolver el ticket.'); }
    finally { setSaving(false); }
  };

  return <>
    <Modal isOpen={ticket !== null && scannerMode === null} onClose={onClose} labelledBy="ticket-workflow-title" title={`Flujo ${current.codigo}`} subtitle={current.tipoTicket === 'pedido' ? `Pedido ${current.numeroPedido}` : 'Ticket general de inventario'} icon={<Wrench className="h-4 w-4" />} headerClass="bg-slate-900" panelClass="max-w-3xl">
    <div className="flex-1 space-y-5 overflow-y-auto p-6">
      <section className="space-y-4 rounded-xl border border-highlight/35 bg-brand-soft/40 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900">Equipos afectados</h4>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
              {affectedCandidates.length} disponibles
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Selecciona aquí los equipos que ingresarán al flujo técnico.</p>
          {current.tipoTicket === 'general' && (
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={affectedSearch}
                  onChange={(event) => setAffectedSearch(event.target.value)}
                  className="h-9 w-full rounded-lg border bg-white pl-9 pr-3 text-xs"
                  placeholder="Buscar por SKU, descripción, marca o estado..."
                />
              </div>
              <button
                type="button"
                onClick={() => setScannerMode('affected')}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-highlight/65 bg-brand-soft px-3 text-xs font-bold text-brand hover:bg-highlight/25 active:scale-[.98]"
                title="Agregar equipo escaneando su código QR"
              >
                <ScanLine className="h-4 w-4" />
                Escanear
              </button>
            </div>
          )}
          {current.tipoTicket === 'general' && (
            <p className="text-[10px] font-medium text-slate-500">
              Los equipos en alquiler no se muestran. Al guardar, el equipo pasa a Reparación y se ubica en Taller.
            </p>
          )}
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1">
            {affectedCandidates.length === 0 ? (
              <p className="px-3 py-5 text-center text-xs text-slate-500">No hay equipos que coincidan con la búsqueda.</p>
            ) : affectedCandidates.map((item) => {
              const selected = affectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAffectedIds((ids) => selected ? ids.filter((id) => id !== item.id) : [...ids, item.id]);
                    setReplacementIds([]);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs ${selected ? 'border-brand bg-brand-soft' : 'border-transparent bg-white hover:bg-slate-50'}`}
                >
                  <span className="min-w-0">
                    <strong className="font-mono text-brand">{item.sku}</strong>
                    <span className="text-slate-600"> · {item.descripcion}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>{item.estado}</span>
                </button>
              );
            })}
          </div>
        </div>
        {current.tipoTicket === 'pedido' && <div><h4 className="text-sm font-bold text-slate-900">¿Los equipos son reparables?</h4><div className="mt-2 flex gap-2"><button type="button" onClick={() => { setRepairable(true); setReplacementIds([]); }} className={`rounded-lg px-4 py-2 text-xs font-bold ${repairable === true ? 'bg-success text-white' : 'border bg-white text-slate-600'}`}>Sí · Reparación</button><button type="button" onClick={() => setRepairable(false)} className={`rounded-lg px-4 py-2 text-xs font-bold ${repairable === false ? 'bg-warning text-white' : 'border bg-white text-slate-600'}`}>No · Reemplazo</button></div></div>}
        {repairable === false && <div className="space-y-3">
          <div className={`rounded-lg border px-3 py-2 text-xs font-bold ${replacementCountMatches ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning'}`}>
            {affectedIds.length} equipo(s) afectado(s) · {replacementIds.length} reemplazo(s) seleccionado(s). Debe existir exactamente un reemplazo por cada afectado.
          </div>
          {selectedReplacements.length > 0 && <div className="space-y-1">{selectedReplacements.map((item, index) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs"><span><strong className="font-mono">{affected[index]?.sku ?? `Afectado ${index + 1}`}</strong> → <span className="font-mono">{item.sku}</span> · {item.descripcion}</span><button type="button" onClick={() => setReplacementIds((ids) => ids.filter((id) => id !== item.id))} className="font-bold text-danger">Quitar</button></div>)}</div>}
          <div>
            <label className="text-xs font-bold text-slate-600">Buscar equipo de reemplazo</label>
            <div className="mt-1 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-lg border pl-9 pr-3 text-xs" placeholder="Escribe SKU, descripción o marca..." />
              </div>
              <button
                type="button"
                onClick={() => setScannerMode('replacement')}
                title="Agregar equipo de reemplazo escaneando su código QR"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-3 text-xs font-bold text-warning hover:bg-warning/15 active:scale-[.98]"
              >
                <ScanLine className="h-4 w-4" />
                Escanear
              </button>
            </div>
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1">
            {candidates.length === 0 ? <p className="px-3 py-4 text-center text-xs text-slate-500">No hay equipos disponibles que coincidan con la búsqueda.</p> : candidates.map((item) => { const selected = replacementIds.includes(item.id); const full = replacementIds.length >= affectedIds.length; return <button key={item.id} type="button" disabled={!selected && full} onClick={() => setReplacementIds((ids) => selected ? ids.filter((id) => id !== item.id) : [...ids, item.id])} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'border-warning bg-warning/10' : 'border-transparent hover:border-highlight/65 hover:bg-brand-soft'}`}><span><strong className="font-mono">{item.sku}</strong> · {item.descripcion}</span><span>{selected ? 'Seleccionado' : item.estado}</span></button>; })}
          </div>
        </div>}
        <div className="flex gap-2"><button type="button" disabled={saving || !canSaveDiagnosis} onClick={() => void saveDiagnosis()} className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Guardar cambios</button></div>
      </section>

      {showSolution && <section className="space-y-4 rounded-xl border border-success/20 bg-success/10 p-4">
        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><h4 className="text-sm font-bold text-slate-900">Solución · {current.flujo}</h4></div>
        {current.flujo === 'Reemplazo' && <div className="space-y-1 text-xs text-slate-600">{current.equiposReemplazoIds?.map((id, index) => { const item = inventario.find((asset) => asset.id === id); return <p key={id}><strong>Reemplazo {index + 1}:</strong> {item ? `${item.sku} · ${item.descripcion}` : id}</p>; })}</div>}
        <label className="block text-xs font-bold text-slate-600">Descripción de la solución<textarea rows={4} value={solution} onChange={(event) => setSolution(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" placeholder="Describe las acciones realizadas y el resultado..." /></label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-600"><Upload className="h-4 w-4" />Evidencia de la {current.flujo?.toLowerCase()}<input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label>
        {files.length > 0 && <p className="text-[11px] text-slate-500">{files.map((file) => file.name).join(' · ')}</p>}
        <button type="button" disabled={saving} onClick={() => void resolve()} className="rounded-lg bg-success px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Completar y resolver ticket</button>
      </section>}
      {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">{error}</p>}
    </div>
  </Modal>
    <InventoryScannerModal
      isOpen={scannerMode !== null}
      onClose={() => setScannerMode(null)}
      onFound={(asset) => {
        const mode = scannerMode;
        setScannerMode(null);
        if (mode === 'replacement') {
          if (UNAVAILABLE.has(asset.estado) || estaEnAlquiler(asset)) {
            setError(`El equipo ${asset.sku} no está disponible para reemplazo.`);
            return;
          }
          if (affectedIds.includes(asset.id)) {
            setError(`El equipo ${asset.sku} es uno de los afectados y no puede ser su propio reemplazo.`);
            return;
          }
          if (replacementIds.includes(asset.id)) {
            setError(`El equipo ${asset.sku} ya está agregado como reemplazo.`);
            return;
          }
          if (replacementIds.length >= affectedIds.length) {
            setError('Ya seleccionaste todos los reemplazos necesarios.');
            return;
          }
          setReplacementIds((ids) => [...ids, asset.id]);
          setError('');
          return;
        }
        if (estaEnAlquiler(asset)) {
          setError(`El equipo ${asset.sku} está en alquiler; usa un ticket por pedido.`);
          return;
        }
        if (affectedIds.includes(asset.id)) {
          setError(`El equipo ${asset.sku} ya está agregado al ticket.`);
          return;
        }
        setAffectedIds((ids) => [...ids, asset.id]);
        setReplacementIds([]);
        setAffectedSearch('');
        setError('');
      }}
    />
  </>;
}

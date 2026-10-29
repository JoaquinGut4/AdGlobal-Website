import { CheckCircle2, Download, FileText, Image as ImageIcon, User, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { evidenceKind, resolveEvidenceUrl } from '@/lib/evidence';
import type { SupportTicket } from '@/types';

interface TicketSolutionModalProps {
  ticket: SupportTicket | null;
  onClose: () => void;
}

function fechaResolucion(value?: string): string {
  if (!value) return 'Sin fecha registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-PE');
}

export function TicketSolutionModal({ ticket, onClose }: TicketSolutionModalProps) {
  if (!ticket) return null;
  const evidencias = ticket.evidencias ?? [];

  return (
    <Modal
      isOpen
      onClose={onClose}
      labelledBy="ticket-solution-title"
      title="Solución del ticket"
      subtitle={`${ticket.codigo} · ${ticket.cliente}`}
      icon={<CheckCircle2 className="h-4 w-4" />}
      headerClass="bg-success"
      panelClass="max-w-3xl"
    >
      <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-5 sm:p-6">
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Equipo</span><strong className="mt-0.5 block text-slate-700">{ticket.equipo || 'Sin equipo registrado'}</strong></div>
          </div>
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Responsable</span><strong className="mt-0.5 block text-slate-700">{ticket.tecnico || 'No asignado'}</strong></div>
          </div>
          <div className="sm:col-span-2 rounded-lg bg-success/8 px-3 py-2 text-success">
            <span className="font-bold">Resuelto: </span>
            {fechaResolucion(ticket.fechaResolucion)}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Problema reportado</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{ticket.descripcion}</p>
        </section>

        <section className="rounded-xl border border-success/25 bg-success/8 p-4">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-success">
            <CheckCircle2 className="h-4 w-4" />
            Descripción de la solución
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {ticket.descripcionSolucion?.trim() || 'No se registró una descripción de la solución.'}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ImageIcon className="h-4 w-4" />
              Evidencias
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
              {evidencias.length} {evidencias.length === 1 ? 'archivo' : 'archivos'}
            </span>
          </div>

          {evidencias.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-xs font-semibold text-slate-500">
              No se adjuntaron imágenes ni videos como evidencia.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {evidencias.map((url, index) => {
                const src = resolveEvidenceUrl(url);
                const kind = evidenceKind(url);
                return (
                  <article key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {kind === 'image' ? (
                      <a href={src} target="_blank" rel="noreferrer noopener" title="Abrir imagen completa">
                        <img src={src} alt={`Evidencia ${index + 1} del ticket ${ticket.codigo}`} className="h-44 w-full object-contain bg-white" />
                      </a>
                    ) : kind === 'video' ? (
                      <video src={src} controls preload="metadata" className="h-44 w-full bg-black object-contain" />
                    ) : (
                      <a href={src} target="_blank" rel="noreferrer noopener" className="flex h-44 items-center justify-center gap-2 bg-white text-xs font-bold text-brand hover:underline">
                        <FileText className="h-5 w-5" /> Abrir archivo
                      </a>
                    )}
                    <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
                      <span className="truncate text-[10px] font-semibold text-slate-500">Evidencia {index + 1}</span>
                      <a href={src} download target="_blank" rel="noreferrer noopener" className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-brand hover:underline">
                        <Download className="h-3 w-3" /> Abrir
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarClock, History, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatFecha } from '@/lib/utils';
import type { PedidoRegistro } from '@/types';

interface OrderRenewalModalProps {
  isOpen: boolean;
  pedido: PedidoRegistro | null;
  onClose: () => void;
  onRenew: (pedido: PedidoRegistro, nuevaFechaFin: string, motivo: string) => Promise<boolean>;
}

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand';

function sumarDias(value: string, days: number): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const base = year && month && day ? new Date(year, month - 1, day) : new Date();
  base.setDate(base.getDate() + days);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
}

function hoyLocal(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function OrderRenewalModal({ isOpen, pedido, onClose, onRenew }: OrderRenewalModalProps) {
  const [nuevaFechaFin, setNuevaFechaFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fechaActualFin = pedido?.fechaFin ?? '';
  const minimo = useMemo(() => {
    const despuesDelFin = fechaActualFin ? sumarDias(fechaActualFin, 1) : sumarDias(hoyLocal(), 1);
    return despuesDelFin > hoyLocal() ? despuesDelFin : hoyLocal();
  }, [fechaActualFin]);

  useEffect(() => {
    if (!isOpen || !pedido) return;
    const base = pedido.fechaFin && pedido.fechaFin >= hoyLocal() ? pedido.fechaFin : hoyLocal();
    setNuevaFechaFin(sumarDias(base, 7));
    setMotivo('');
    setError('');
    setSaving(false);
  }, [isOpen, pedido]);

  if (!pedido) return null;

  const historial = [...(pedido.historialRenovaciones ?? [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!nuevaFechaFin) {
      setError('Selecciona la nueva fecha de fin del alquiler.');
      return;
    }
    if (fechaActualFin && nuevaFechaFin <= fechaActualFin) {
      setError('La nueva fecha de fin debe ser posterior a la fecha actual del pedido.');
      return;
    }
    if (nuevaFechaFin < hoyLocal()) {
      setError('La nueva fecha de fin no puede estar en el pasado.');
      return;
    }
    if (motivo.trim().length < 3) {
      setError('Indica el motivo de la renovación (mínimo 3 caracteres).');
      return;
    }
    setSaving(true);
    const ok = await onRenew(pedido, nuevaFechaFin, motivo.trim());
    setSaving(false);
    if (ok) onClose();
    else setError('No se pudo renovar el pedido. Revisa la fecha e inténtalo nuevamente.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="order-renewal-title"
      title="Renovar pedido"
      subtitle={`Pedido ${pedido.numeroPedido}`}
      icon={<RotateCcw className="h-4 w-4" />}
      headerClass="bg-brand"
      panelClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <section className="rounded-xl border border-highlight/35 bg-brand-soft/40 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <CalendarClock className="h-4 w-4" />
            Período actual
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
            <span>Inicio: <strong className="text-slate-800">{formatFecha(pedido.fechaInicio ?? pedido.fechaEntrega ?? pedido.fechaEmision)}</strong></span>
            <span>Fin: <strong className="text-slate-800">{fechaActualFin ? formatFecha(fechaActualFin) : 'Sin fecha'}</strong></span>
            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
              {pedido.renovaciones ?? 0} {(pedido.renovaciones ?? 0) === 1 ? 'renovación' : 'renovaciones'}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="renewal-end-date" className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Nueva fecha de fin <span className="text-danger">*</span>
            </label>
            <input
              id="renewal-end-date"
              type="date"
              required
              min={minimo}
              value={nuevaFechaFin}
              onChange={(event) => setNuevaFechaFin(event.target.value)}
              className={FIELD_CLASS}
            />
            <p className="mt-1 text-[10px] text-slate-500">Debe ser posterior al fin actual.</p>
          </div>
          <div>
            <label htmlFor="renewal-reason" className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Motivo de la renovación <span className="text-danger">*</span>
            </label>
            <textarea
              id="renewal-reason"
              rows={3}
              required
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ej. El cliente solicita extender el alquiler una semana más."
              className={FIELD_CLASS}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
            {error}
          </p>
        )}

        {historial.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <History className="h-4 w-4 text-brand" />
              Historial de renovaciones
            </div>
            <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {historial.map((item, index) => (
                <article key={`${item.fecha}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-slate-700">
                      {formatFecha(item.fechaAnterior)} → {formatFecha(item.fechaNueva)}
                    </strong>
                    <span className="font-mono text-[9px] text-slate-400">
                      {new Date(item.fecha).toLocaleString('es-PE')}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{item.motivo}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Registrado por {item.usuario}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {saving ? 'Renovando...' : 'Confirmar renovación'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

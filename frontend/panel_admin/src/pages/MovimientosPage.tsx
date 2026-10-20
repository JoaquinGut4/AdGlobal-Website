import { useState } from 'react';
import { Boxes, CalendarDays, ClipboardList, Search, TicketCheck, X } from 'lucide-react';
import { diaLocal, movimientosPorFecha } from '@/lib/movementDates';
import type { MovimientoAuditoria, MovimientoModulo } from '@/types';

interface MovimientosPageProps {
  movimientos: MovimientoAuditoria[];
}

type ModuloFiltro = 'Todos' | MovimientoModulo;

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function normalizar(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const MODULOS: Array<{ id: MovimientoModulo; icon: typeof ClipboardList; tone: string }> = [
  { id: 'Pedidos', icon: ClipboardList, tone: 'border-blue-200 bg-blue-50 text-[#2B5C94]' },
  { id: 'Inventario', icon: Boxes, tone: 'border-violet-200 bg-violet-50 text-violet-700' },
  { id: 'Tickets', icon: TicketCheck, tone: 'border-amber-200 bg-amber-50 text-amber-700' },
];

export function MovimientosPage({ movimientos }: MovimientosPageProps) {
  const [search, setSearch] = useState('');
  const [moduloActivo, setModuloActivo] = useState<ModuloFiltro>('Todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const terminos = normalizar(search).trim().split(/\s+/).filter(Boolean);
  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const movimientosEnRango = movimientosPorFecha(movimientos, desde, hasta);

  const visibles = movimientosEnRango.filter((movimiento) => {
    if (moduloActivo !== 'Todos' && movimiento.modulo !== moduloActivo) return false;
    if (terminos.length === 0) return true;
    const contenido = normalizar(Object.values(movimiento).join(' '));
    return terminos.every((termino) => contenido.includes(termino));
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Historial de Movimientos</h2>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
            {movimientos.length} movimientos registrados
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Auditoría de acciones realizadas por los usuarios en Pedidos, Inventario y Tickets, consultable por fecha.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MODULOS.map((modulo) => {
          const Icon = modulo.icon;
          const total = movimientosEnRango.filter((item) => item.modulo === modulo.id).length;
          const active = moduloActivo === modulo.id;
          return (
            <button
              key={modulo.id}
              type="button"
              onClick={() => setModuloActivo(active ? 'Todos' : modulo.id)}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                active ? `${modulo.tone} ring-2 ring-current/10` : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${modulo.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-2xl font-black text-slate-900">{total}</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">{modulo.id}</p>
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="relative w-full sm:max-w-xl sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario, acción, pedido, SKU o ticket..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-[#2B5C94] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['Todos', 'Pedidos', 'Inventario', 'Tickets'] as ModuloFiltro[]).map((modulo) => (
              <button
                key={modulo}
                type="button"
                onClick={() => setModuloActivo(modulo)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  moduloActivo === modulo
                    ? 'bg-[#2B5C94] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {modulo}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
          <div className="flex items-center gap-1.5 self-center text-xs font-bold text-slate-600">
            <CalendarDays className="h-4 w-4 text-[#2B5C94]" />
            Fecha
          </div>
          <div>
            <label htmlFor="movimientos-desde" className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Desde
            </label>
            <input
              id="movimientos-desde"
              type="date"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-[#2B5C94] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="movimientos-hasta" className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Hasta
            </label>
            <input
              id="movimientos-hasta"
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-[#2B5C94] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const today = diaLocal(new Date().toISOString()) ?? '';
              setDesde(today);
              setHasta(today);
            }}
            className="h-9 cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-[#2B5C94] hover:bg-blue-100"
          >
            Hoy
          </button>
          {(desde || hasta) && (
            <button
              type="button"
              onClick={() => { setDesde(''); setHasta(''); }}
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar fechas
            </button>
          )}
          {rangoInvalido && (
            <p role="alert" className="w-full text-xs font-semibold text-rose-700">
              La fecha «Desde» no puede ser posterior a «Hasta».
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <span className="text-xs font-bold text-slate-800">
            {moduloActivo === 'Todos' ? 'Todos los módulos' : moduloActivo}
            {(desde || hasta) && <span className="ml-2 font-medium text-slate-500">· Período seleccionado</span>}
          </span>
          <span className="text-[11px] text-slate-500">
            {visibles.length} {visibles.length === 1 ? 'movimiento visible' : 'movimientos visibles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {['Fecha y hora', 'Usuario', 'Módulo', 'Acción', 'Elemento', 'Detalle'].map((label) => (
                  <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No se encontraron movimientos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                visibles.map((movimiento) => {
                  const modulo = MODULOS.find((item) => item.id === movimiento.modulo) ?? MODULOS[0];
                  const actionTone = movimiento.accion === 'Eliminó'
                    ? 'bg-rose-50 text-rose-700'
                    : movimiento.accion === 'Creó' || movimiento.accion === 'Agregó'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700';
                  return (
                    <tr key={movimiento.id} className="hover:bg-blue-50/30">
                      <td className="min-w-44 whitespace-nowrap px-4 py-3">
                        {diaLocal(movimiento.fecha) ? dateFormatter.format(new Date(movimiento.fecha)) : 'Fecha no disponible'}
                      </td>
                      <td className="min-w-36 px-4 py-3 font-mono font-bold text-slate-700">{movimiento.usuario}</td>
                      <td className="min-w-28 px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${modulo.tone}`}>{movimiento.modulo}</span></td>
                      <td className="min-w-24 px-4 py-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${actionTone}`}>{movimiento.accion}</span></td>
                      <td className="min-w-36 px-4 py-3 font-mono font-bold text-[#2B5C94]">{movimiento.elemento}</td>
                      <td className="min-w-72 px-4 py-3 leading-relaxed">{movimiento.detalle}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

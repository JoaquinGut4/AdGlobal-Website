import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Maximize2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { esPedidoActivo, fechaLocal, rangoPedido } from '@/lib/orderPeriods';
import type { PedidoRegistro } from '@/types';

interface OrdersCalendarProps {
  orders: PedidoRegistro[];
  onGoToOrders: () => void;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

interface CalendarEntry {
  order: PedidoRegistro;
  active: boolean;
}

const MAX_PERIOD_DAYS = 370;

export function OrdersCalendar({ orders, onGoToOrders }: OrdersCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const ordersByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    const add = (date: Date, entry: CalendarEntry) => {
      const key = dateKey(date);
      map.set(key, [...(map.get(key) ?? []), entry]);
    };

    for (const order of orders) {
      if (!esPedidoActivo(order)) {
        // Los pedidos cerrados conservan su fecha de emisión como referencia histórica.
        const date = fechaLocal(order.fechaEmision);
        if (date) add(date, { order, active: false });
        continue;
      }

      const range = rangoPedido(order);
      if (!range) continue;
      const days = Math.min(
        MAX_PERIOD_DAYS,
        Math.round((range.fin.getTime() - range.inicio.getTime()) / 86_400_000) + 1,
      );
      for (let index = 0; index < days; index += 1) {
        const date = new Date(range.inicio);
        date.setDate(range.inicio.getDate() + index);
        add(date, { order, active: true });
      }
    }
    return map;
  }, [orders]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const monthDays = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const relativeDay = index - startOffset + 1;
      let date: Date;
      if (relativeDay < 1) date = new Date(year, month - 1, previousMonthDays + relativeDay);
      else if (relativeDay > monthDays) date = new Date(year, month + 1, relativeDay - monthDays);
      else date = new Date(year, month, relativeDay);
      const dayOrders = ordersByDate.get(dateKey(date)) ?? [];
      return {
        date,
        currentMonth: date.getMonth() === month,
        active: dayOrders.some((entry) => entry.active),
        finalized: dayOrders.some((entry) => !entry.active),
      };
    });
  }, [month, ordersByDate, year]);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthOrders = orders.filter((order) => {
    if (esPedidoActivo(order)) {
      const range = rangoPedido(order);
      return Boolean(range && range.inicio <= monthEnd && range.fin >= monthStart);
    }
    const date = fechaLocal(order.fechaEmision);
    return date?.getFullYear() === year && date.getMonth() === month;
  });
  const activeCount = monthOrders.filter(esPedidoActivo).length;
  const finalizedCount = monthOrders.length - activeCount;
  const selectedOrders = ordersByDate.get(`${year}-${month}-${selectedDay}`) ?? [];
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
    setSelectedDay(1);
  };

  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative flex min-h-[420px] w-full flex-col overflow-hidden rounded-[28px] border border-white/90 bg-white/80 p-6 text-left shadow-[0_1px_2px_rgba(15,23,42,.04),0_18px_50px_rgba(15,23,42,.08)] ring-1 ring-slate-200/55 backdrop-blur-xl transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,.05),0_24px_60px_rgba(15,23,42,.12)] active:scale-[.985] motion-reduce:transform-none sm:min-h-[460px] sm:p-7"
      >
        <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-danger/15 blur-3xl" />
        <span className="relative flex w-full items-start justify-between gap-3">
          <span className="flex items-center gap-3.5">
            <i className="relative flex h-12 w-12 shrink-0 flex-col overflow-hidden rounded-[13px] border border-black/5 bg-white shadow-[0_3px_10px_rgba(15,23,42,.12)]">
              <small className="flex h-[18px] items-center justify-center bg-danger text-[7px] font-bold uppercase tracking-[.08em] text-white">{MONTHS[month].slice(0, 3)}</small>
              <strong className="flex flex-1 items-center justify-center text-lg font-semibold tracking-[-.04em] text-slate-900">{selectedDay}</strong>
            </i>
            <span><strong className="block text-[22px] font-semibold leading-tight tracking-[-.025em] text-slate-950">Calendario</strong><small className="mt-0.5 block text-[12px] font-medium text-slate-500">Períodos activos · {MONTHS[month]} {year}</small></span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-600 transition-[transform,background-color] duration-200 group-hover:scale-105 group-hover:bg-slate-200/80"><Maximize2 className="h-4 w-4" /></span>
        </span>

        <span className="relative grid flex-1 items-center gap-6 py-6 sm:grid-cols-[minmax(0,1.2fr)_minmax(190px,.8fr)] sm:py-7">
          <span className="rounded-[22px] bg-slate-950/[.035] p-3.5 ring-1 ring-slate-950/[.045] sm:p-4">
            <span className="mb-3 flex items-center justify-between px-1">
              <strong className="text-[13px] font-semibold tracking-[-.01em] text-slate-800">{MONTHS[month]} {year}</strong>
              <small className="text-[10px] font-medium text-danger">Hoy {today.getDate()}</small>
            </span>
            <span className="mb-1 grid grid-cols-7 text-center">
              {WEEKDAYS.map((day, index) => <small key={`${day}-mini-${index}`} className="text-[8px] font-semibold text-slate-400">{day}</small>)}
            </span>
            <span className="grid grid-cols-7 gap-y-0.5 text-center">
              {cells.map((cell) => {
                const selected = cell.currentMonth && cell.date.getDate() === selectedDay;
                const isToday = cell.currentMonth && isCurrentMonth && cell.date.getDate() === today.getDate();
                return (
                  <span key={`mini-${dateKey(cell.date)}`} className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-medium ${!cell.currentMonth ? 'text-slate-300/70' : isToday || selected ? 'bg-danger font-semibold text-white shadow-sm' : 'text-slate-600'}`}>
                    {cell.date.getDate()}
                    {(cell.active || cell.finalized) && !isToday && !selected && <i className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand" />}
                  </span>
                );
              })}
            </span>
          </span>

          <span className="flex min-w-0 flex-col justify-center">
            <small className="text-[10px] font-semibold uppercase tracking-[.08em] text-danger">Resumen mensual</small>
            <strong className="mt-1 text-3xl font-semibold tracking-[-.035em] text-slate-950">{monthOrders.length}</strong>
            <small className="mt-0.5 text-[12px] font-medium text-slate-500">{monthOrders.length === 1 ? 'pedido en el período' : 'pedidos en el período'}</small>
            <span className="mt-5 space-y-3">
              <span className="flex items-center justify-between rounded-xl bg-brand/8 px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] font-semibold text-brand"><i className="h-2 w-2 rounded-full bg-brand" />Activos en el período</span><strong className="text-[12px] font-semibold text-brand">{activeCount}</strong></span>
              <span className="flex items-center justify-between rounded-xl bg-success/8 px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] font-semibold text-success"><i className="h-2 w-2 rounded-full bg-success" />Finalizados registrados</span><strong className="text-[12px] font-semibold text-success">{finalizedCount}</strong></span>
              <span className="flex items-center justify-between px-3 pt-1 text-[11px] font-medium text-slate-500"><span>Seleccionados hoy</span><strong className="font-semibold text-slate-800">{selectedOrders.length}</strong></span>
            </span>
          </span>
        </span>
        <span className="relative flex w-full items-center justify-between text-[12px]"><span className="font-medium text-slate-500">Selecciona una fecha para ver el detalle</span><span className="flex items-center gap-1 font-semibold text-brand">Abrir <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        labelledBy="orders-calendar-title"
        title="Calendario de pedidos"
        subtitle="Períodos de pedidos activos y pedidos finalizados por fecha de emisión"
        icon={<CalendarDays className="h-4 w-4" />}
        panelClass="max-w-5xl"
      >
        <div className="overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brand-deep" /><strong className="font-mono text-slate-800">{activeCount}</strong> Activos</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-success" /><strong className="font-mono text-success">{finalizedCount}</strong> Finalizados</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onGoToOrders} className="group flex items-center gap-1 text-[11px] font-bold text-brand">Ver todos los pedidos <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></button>
              <button type="button" onClick={goToday} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs ring-1 ring-slate-200 hover:bg-slate-100">Hoy</button>
              <span className="flex rounded-lg bg-white p-0.5 shadow-xs ring-1 ring-slate-200">
                <button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior" className="rounded-md p-1 text-slate-600 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente" className="rounded-md p-1 text-slate-600 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-12">
            <div className="border-b border-slate-200 p-5 sm:p-6 md:col-span-7 md:border-b-0 md:border-r">
              <div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-danger">{MONTHS[month]} {year}</p><h3 className="text-lg font-extrabold text-ink">Vista mensual</h3></div>
              <div className="mb-2 grid grid-cols-7 text-center">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="text-[10px] font-bold text-slate-400">{day}</span>)}</div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {cells.map((cell) => {
                  const selected = cell.currentMonth && cell.date.getDate() === selectedDay;
                  const isToday = cell.currentMonth && isCurrentMonth && cell.date.getDate() === today.getDate();
                  return (
                    <button key={dateKey(cell.date)} type="button" disabled={!cell.currentMonth} onClick={() => setSelectedDay(cell.date.getDate())} className={`relative flex h-12 flex-col items-center justify-center rounded-xl text-xs transition-colors ${!cell.currentMonth ? 'cursor-default text-slate-300 opacity-40' : isToday ? 'font-extrabold' : selected ? 'bg-brand font-bold text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isToday ? 'bg-danger text-white' : ''}`}>{cell.date.getDate()}</span>
                      {(cell.active || cell.finalized) && <span className="absolute bottom-1 flex gap-0.5">{cell.active && <i className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-highlight/55' : 'bg-brand-deep'}`} />}{cell.finalized && <i className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-success/20' : 'bg-success'}`} />}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-96 flex-col bg-slate-50/70 p-5 sm:p-6 md:col-span-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3"><div><p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">Detalle del día</p><h3 className="text-sm font-extrabold text-ink">{selectedDay} de {MONTHS[month]}, {year}</h3></div><span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-bold text-slate-600">{selectedOrders.length} pedidos</span></div>
              {selectedOrders.length > 0 ? (
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">{selectedOrders.map(({ order, active }) => <button key={`${order.id}-${active}`} type="button" onClick={onGoToOrders} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50"><span className="flex min-w-0 items-center gap-2.5"><i className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-brand-soft text-brand' : 'bg-success/10 text-success'}`}>{active ? <ClipboardList className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</i><span className="min-w-0"><strong className="block truncate font-mono text-[11px] text-ink">{order.numeroPedido}</strong><small className="block truncate text-[9px] text-slate-500">{order.motivoTraslado} · {order.cantidadProductos} equipos</small></span></span><span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${active ? 'bg-brand-soft text-brand-deep' : 'bg-success/10 text-success'}`}>{active ? 'ACTIVO' : 'FINALIZADO'}</span></button>)}</div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center"><CalendarDays className="h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-600">Sin pedidos para este día</p><p className="mt-0.5 text-[10px] text-slate-400">Selecciona una fecha con indicadores.</p></div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

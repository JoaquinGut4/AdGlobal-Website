import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  RotateCcw,
  TicketCheck,
  Users,
} from 'lucide-react';
import { FlotaChart } from '@/components/dashboard/FlotaChart';
import { InventoryDistribution } from '@/components/dashboard/InventoryDistribution';
import { OrdersCalendar } from '@/components/dashboard/OrdersCalendar';
import { Modal } from '@/components/ui/Modal';
import { esPedidoActivo, fechaLocal } from '@/lib/orderPeriods';
import { formatFecha, parseDireccionLlegada } from '@/lib/utils';
import type { AdminSection, DashboardResumen, PedidoRegistro } from '@/types';

interface DashboardPageProps {
  resumen: DashboardResumen | null;
  pedidos: PedidoRegistro[];
  onNavigate: (section: AdminSection) => void;
}

type DashboardCounter = 'inventory' | 'orders' | 'tickets' | 'clients' | 'returns' | 'renewals';

interface DevolucionVencida {
  code: string;
  client: string;
  detail: string;
  date: string;
  delay: string;
  delayDays: number;
}

/** Devoluciones de alquiler cuyo fin de período ya pasó y siguen activas. */
function calcularDevolucionesVencidas(pedidos: PedidoRegistro[]): DevolucionVencida[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return pedidos
    .filter((pedido) => esPedidoActivo(pedido) && pedido.motivoTraslado === 'Alquiler')
    .flatMap((pedido) => {
      const fin = fechaLocal(pedido.fechaFin);
      if (!fin || fin >= hoy) return [];
      const dias = Math.max(1, Math.round((hoy.getTime() - fin.getTime()) / 86_400_000));
      const cliente = parseDireccionLlegada(pedido.direccionLlegada).destinatario;
      return [{
        code: pedido.numeroPedido,
        client: cliente || 'Cliente sin identificar',
        detail: `${pedido.cantidadProductos} ${pedido.cantidadProductos === 1 ? 'equipo' : 'equipos'} · ${pedido.descripcionProductos.split('\n').filter(Boolean).join(', ')}`,
        date: formatFecha(pedido.fechaFin ?? ''),
        delay: `${dias} ${dias === 1 ? 'día' : 'días'}`,
        delayDays: dias,
      }];
    })
    .sort((a, b) => b.delayDays - a.delayDays);
}

interface ContratoPorRenovar {
  code: string;
  client: string;
  detail: string;
  date: string;
  days: number;
  label: string;
}

/** Pedidos de alquiler activos cuyo contrato vence en los próximos 15 días. */
function calcularContratosPorRenovar(pedidos: PedidoRegistro[]): ContratoPorRenovar[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return pedidos
    .filter((pedido) => (
      esPedidoActivo(pedido)
      && pedido.motivoTraslado === 'Alquiler'
      && ['Alquiler', 'Por devolver'].includes(pedido.estadoFlujo ?? '')
    ))
    .flatMap((pedido) => {
      const fin = fechaLocal(pedido.fechaFin);
      if (!fin) return [];
      const dias = Math.round((fin.getTime() - hoy.getTime()) / 86_400_000);
      if (dias < 0 || dias > 15) return [];
      const cliente = parseDireccionLlegada(pedido.direccionLlegada).destinatario;
      return [{
        code: pedido.numeroPedido,
        client: cliente || 'Cliente sin identificar',
        detail: `${pedido.cantidadProductos} ${pedido.cantidadProductos === 1 ? 'equipo' : 'equipos'} · ${pedido.descripcionProductos.split('\n').filter(Boolean).join(', ')}`,
        date: formatFecha(pedido.fechaFin ?? ''),
        days: dias,
        label: dias === 0 ? 'Vence hoy' : `En ${dias} ${dias === 1 ? 'día' : 'días'}`,
      }];
    })
    .sort((a, b) => a.days - b.days);
}

function CounterSummaryModal({
  counter,
  resumen,
  pedidos,
  onClose,
  onNavigate,
}: {
  counter: DashboardCounter | null;
  resumen: DashboardResumen;
  pedidos: PedidoRegistro[];
  onClose: () => void;
  onNavigate: (section: AdminSection) => void;
}) {
  const activeTickets = Object.entries(resumen.ticketsPorEstado).filter(([status]) => status !== 'Resuelto');
  const activeOrders = pedidos.filter(esPedidoActivo);
  const overdueReturns = calcularDevolucionesVencidas(pedidos);
  const contractsToRenew = calcularContratosPorRenovar(pedidos);
  const isDemo = false;
  const config = (() => {
    switch (counter) {
      case 'inventory':
        return {
          title: 'Total de equipos', subtitle: 'Distribución actual del inventario', total: resumen.inventarioTotal,
          icon: <Boxes className="h-4 w-4" />, headerClass: 'bg-brand', section: 'inventario' as AdminSection,
          rows: Object.entries(resumen.inventarioPorEstado).map(([label, value]) => ({ label, value, detail: `${Math.round((value / Math.max(resumen.inventarioTotal, 1)) * 100)}% del inventario` })),
        };
      case 'orders':
        return {
          title: 'Pedidos activos', subtitle: 'Operaciones que continúan en curso', total: resumen.pedidosActivos,
          icon: <ClipboardList className="h-4 w-4" />, headerClass: 'bg-brand', section: 'pedidos' as AdminSection,
          rows: activeOrders.slice(0, 6).map((pedido) => ({ label: pedido.numeroPedido, value: pedido.cantidadProductos, detail: pedido.descripcionProductos || 'Sin descripción', suffix: pedido.cantidadProductos === 1 ? 'equipo' : 'equipos' })),
        };
      case 'tickets':
        return {
          title: 'Tickets activos', subtitle: 'Casos de soporte pendientes de resolución',
          total: activeTickets.reduce((sum, [, value]) => sum + value, 0), icon: <TicketCheck className="h-4 w-4" />,
          headerClass: 'bg-warning', section: 'tickets' as AdminSection,
          rows: activeTickets.map(([label, value]) => ({ label, value, detail: 'Tickets en este estado' })),
        };
      case 'clients':
        return {
          title: 'Clientes activos', subtitle: 'Estado de la cartera de clientes', total: resumen.clientesActivos,
          icon: <Users className="h-4 w-4" />, headerClass: 'bg-success', section: 'clientes' as AdminSection,
          rows: [
            { label: 'Activos', value: resumen.clientesActivos, detail: 'Clientes con operaciones vigentes' },
            { label: 'Inactivos', value: resumen.clientesInactivos, detail: 'Clientes sin actividad vigente' },
            { label: 'Total registrados', value: resumen.clientesTotal, detail: 'Cartera histórica completa' },
          ],
        };
      case 'returns':
        return {
          title: 'Devoluciones vencidas', subtitle: 'Pedidos de alquiler activos con fecha de retorno pasada', total: overdueReturns.length,
          icon: <RotateCcw className="h-4 w-4" />, headerClass: 'bg-danger', section: 'pedidos' as AdminSection,
          rows: overdueReturns.map((item) => ({ label: item.client, value: item.delay, detail: `${item.code} · ${item.detail}`, footer: `Retorno programado: ${item.date}` })),
        };
      case 'renewals':
      default:
        return {
          title: 'Contratos por renovar', subtitle: 'Pedidos de alquiler activos que vencen en los próximos 15 días', total: contractsToRenew.length,
          icon: <CalendarClock className="h-4 w-4" />, headerClass: 'bg-warning', section: 'pedidos' as AdminSection,
          rows: contractsToRenew.map((item) => ({ label: item.client, value: item.label, detail: `${item.code} · ${item.detail}`, footer: `Fin del alquiler: ${item.date}` })),
        };
    }
  })();

  return (
    <Modal
      isOpen={counter !== null}
      onClose={onClose}
      labelledBy="counter-summary-title"
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      headerClass={config.headerClass}
      panelClass="max-w-2xl"
    >
      <div className="overflow-y-auto p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-highlight/50 bg-brand-soft/60 px-4 py-3">
          <div>
            <p className="font-mono text-2xl font-extrabold tracking-tight text-brand tabular-nums">{config.total}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">Resumen del indicador seleccionado</p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-brand shadow-xs">{isDemo ? 'Demo' : 'Actual'}</span>
        </div>

        <div className="space-y-2.5">
          {config.rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-xs font-semibold text-slate-500">No hay registros para mostrar.</div>
          ) : config.rows.map((item) => (
            <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 transition-[border-color,box-shadow] duration-150 hover:border-brand/25 hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    {counter === 'returns' ? <AlertTriangle className="h-4 w-4" /> : counter === 'renewals' || counter === 'clients' ? <Building2 className="h-4 w-4" /> : config.icon}
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-extrabold text-ink">{item.label}</h4>
                    <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${counter === 'returns' ? 'bg-danger/10 text-danger' : counter === 'tickets' || counter === 'renewals' ? 'bg-warning/10 text-warning' : 'bg-brand-soft text-brand'}`}>
                  {item.value} {'suffix' in item ? String(item.suffix) : ''}
                </span>
              </div>
              {'footer' in item && item.footer && <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500"><CalendarClock className="h-3.5 w-3.5" />{String(item.footer)}</div>}
            </article>
          ))}
        </div>
      </div>
      {'section' in config && config.section && (
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => { onClose(); onNavigate(config.section); }} className="group flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-bold text-white transition-transform duration-150 active:scale-[.97]">
            Ver módulo completo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </Modal>
  );
}

export function DashboardPage({ resumen, pedidos, onNavigate }: DashboardPageProps) {
  const [selectedCounter, setSelectedCounter] = useState<DashboardCounter | null>(null);
  const overdueReturns = useMemo(() => calcularDevolucionesVencidas(pedidos), [pedidos]);
  const contractsToRenew = useMemo(() => calcularContratosPorRenovar(pedidos), [pedidos]);

  if (!resumen) {
    return (
      <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Cargando dashboard">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-44 rounded-2xl border border-slate-200 bg-white" />)}
      </div>
    );
  }

  const activeTickets = Object.entries(resumen.ticketsPorEstado)
    .filter(([status]) => status !== 'Resuelto')
    .reduce((total, [, value]) => total + value, 0);
  const resolvedTickets = resumen.ticketsPorEstado.Resuelto ?? 0;
  const cards = [
    {
      label: 'Total de equipos', value: resumen.inventarioTotal, icon: Boxes, modal: 'inventory' as const,
      accent: 'brand', meta: `${Object.keys(resumen.inventarioPorEstado).length} estados operativos`, code: 'INVENTARIO',
    },
    {
      label: 'Pedidos activos', value: resumen.pedidosActivos, icon: ClipboardList, modal: 'orders' as const,
      accent: 'brand', meta: `${resumen.pedidosFinalizados} finalizados`, code: 'PEDIDOS',
    },
    {
      label: 'Tickets activos', value: activeTickets, icon: TicketCheck, modal: 'tickets' as const,
      accent: 'warning', meta: `${resolvedTickets} resueltos`, code: 'SOPORTE',
    },
    {
      label: 'Clientes activos', value: resumen.clientesActivos, icon: Users, modal: 'clients' as const,
      accent: 'success', meta: `${resumen.clientesTotal} registrados`, code: 'CLIENTES',
    },
    {
      label: 'Devoluciones vencidas', value: overdueReturns.length, icon: RotateCcw, modal: 'returns' as const,
      accent: 'danger', meta: overdueReturns.length === 0 ? 'Sin retrasos' : 'Requieren atención', code: 'DEVOLUCIONES',
    },
    {
      label: 'Contratos por renovar', value: contractsToRenew.length, icon: CalendarClock, modal: 'renewals' as const,
      accent: 'warning', meta: contractsToRenew.length === 0 ? 'Sin vencimientos próximos' : 'Próximos 15 días', code: 'CONTRATOS',
    },
  ];

  return (
    <div className="animate-in fade-in space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Indicadores principales">
        {cards.map(({ label, value, icon: Icon, modal, accent, meta, code }) => {
          const isWarning = accent === 'warning';
          const isSuccess = accent === 'success';
          const isDanger = accent === 'danger';
          const iconTone = isDanger
            ? 'bg-danger/10 text-danger group-hover:bg-danger'
            : isWarning
            ? 'bg-warning/10 text-warning group-hover:bg-warning'
            : isSuccess
              ? 'bg-success/10 text-success group-hover:bg-success'
              : 'bg-brand-soft text-brand group-hover:bg-brand';
          return (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedCounter(modal)}
              aria-haspopup="dialog"
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_16px_35px_rgba(0,24,48,.08)] active:scale-[.985]"
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 group-hover:text-white ${iconTone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[.13em] text-slate-500">{label}</p>
                <p className="mt-1 font-mono text-3xl font-extrabold tracking-[-0.04em] text-ink tabular-nums">{value}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                <span className="font-semibold text-slate-600">{meta}</span>
                <span className="font-mono text-[9px] tracking-wide text-slate-400">{code}</span>
              </div>
              <span className={`absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100 ${isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : isSuccess ? 'bg-success' : 'bg-brand'}`} />
            </button>
          );
        })}
      </section>

      <CounterSummaryModal
        counter={selectedCounter}
        resumen={resumen}
        pedidos={pedidos}
        onClose={() => setSelectedCounter(null)}
        onNavigate={onNavigate}
      />

      <div className="grid items-stretch gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <FlotaChart pedidos={pedidos} />
          <OrdersCalendar orders={pedidos} onGoToOrders={() => onNavigate('pedidos')} />
        </div>
        <div className="xl:col-span-4">
          <InventoryDistribution
            locations={resumen.inventarioPorUbicacion}
            totalEquipment={resumen.inventarioTotal}
            onGoToInventory={() => onNavigate('inventario')}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand"><History className="h-4 w-4" /></span>
              <div><h2 className="text-sm font-extrabold text-ink">Últimos movimientos</h2><p className="text-[11px] text-slate-500">Trazabilidad reciente de la operación</p></div>
            </div>
            <button type="button" onClick={() => onNavigate('movimientos')} className="group hidden items-center gap-1 text-xs font-bold text-brand sm:flex">Ver historial <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></button>
          </div>
          {resumen.movimientosRecientes.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center"><CheckCircle2 className="h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">Sin movimientos recientes</p><p className="mt-1 text-xs text-slate-500">Las nuevas operaciones aparecerán en este registro.</p></div>
          ) : (
            <div className="divide-y divide-slate-100 px-5 sm:px-6">
              {resumen.movimientosRecientes.map((item) => (
                <div key={item.id} className="group flex flex-col gap-2 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 font-mono text-[10px] font-bold text-brand">{item.usuario.slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0"><strong className="block text-slate-800">{item.usuario} <small className="ml-1 rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[9px] text-brand">{item.modulo}</small></strong><span className="mt-0.5 block truncate text-slate-500">{item.detalle}</span></span>
                  </div>
                  <time className="flex shrink-0 items-center gap-1.5 pl-11 font-mono text-[10px] text-slate-400 sm:pl-0"><Clock3 className="h-3 w-3" />{new Date(item.fecha).toLocaleString('es-PE')}</time>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

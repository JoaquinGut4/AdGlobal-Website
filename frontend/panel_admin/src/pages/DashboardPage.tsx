import { Boxes, ClipboardList, TicketCheck, Users } from 'lucide-react';
import { FlotaChart } from '@/components/dashboard/FlotaChart';
import type { DashboardResumen, PedidoRegistro } from '@/types';

interface DashboardPageProps {
  resumen: DashboardResumen | null;
  pedidos: PedidoRegistro[];
}

export function DashboardPage({ resumen, pedidos }: DashboardPageProps) {
  if (!resumen) return <div className="py-20 text-center text-sm text-slate-500">Cargando dashboard...</div>;
  const activeTickets = Object.entries(resumen.ticketsPorEstado)
    .filter(([status]) => status !== 'Resuelto')
    .reduce((total, [, value]) => total + value, 0);
  const cards = [
    { label: 'Equipos registrados', value: resumen.inventarioTotal, icon: Boxes, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Pedidos activos', value: resumen.pedidosActivos, icon: ClipboardList, tone: 'text-violet-700 bg-violet-50' },
    { label: 'Tickets activos', value: activeTickets, icon: TicketCheck, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Clientes activos', value: resumen.clientesActivos, icon: Users, tone: 'text-emerald-700 bg-emerald-50' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-slate-900">{value}</p></article>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <FlotaChart pedidos={pedidos} />
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Distribución de inventario</h2>
          <div className="mt-4 space-y-3">{Object.entries(resumen.inventarioPorEstado).map(([estado, total]) => <div key={estado} className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs"><span className="font-semibold text-slate-600">{estado}</span><strong className="font-mono text-slate-900">{total}</strong></div>)}</div>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><h2 className="text-sm font-bold text-slate-900">Últimos movimientos</h2><div className="mt-4 divide-y divide-slate-100">{resumen.movimientosRecientes.map((item) => <div key={item.id} className="flex flex-col gap-1 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"><span><strong className="text-slate-800">{item.usuario}</strong> · {item.detalle}</span><time className="text-slate-400">{new Date(item.fecha).toLocaleString('es-PE')}</time></div>)}</div></section>
    </div>
  );
}

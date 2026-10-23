import { useEffect, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import { ADMIN_CONFIG } from '@/config/site';
import { apiRequest } from '@/lib/api';
import type { MovimientoAuditoria, MovimientoModulo } from '@/types';
import type { PaginatedApi } from '@/lib/operationsApi';

type ModuloFiltro = 'Todos' | MovimientoModulo;
const formatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

export function MovimientosPage() {
  const [items, setItems] = useState<MovimientoAuditoria[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState<ModuloFiltro>('Todos');
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(false);

  const query = (includePage = true) => {
    const params = new URLSearchParams();
    if (module !== 'Todos') params.set('module', module);
    if (fecha) {
      params.set('desde', fecha);
      params.set('hasta', fecha);
    }
    if (search.trim()) params.set('search', search.trim());
    if (includePage) { params.set('page', String(page)); params.set('page_size', '50'); }
    return params.toString();
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<PaginatedApi<MovimientoAuditoria>>(`/movimientos?${query()}`);
      setItems(response.items); setTotal(response.total); setPages(response.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(timer); }, [page, module, fecha, search]);
  useEffect(() => setPage(1), [module, fecha, search]);

  const download = async (format: 'csv' | 'pdf') => {
    const response = await fetch(`${ADMIN_CONFIG.apiUrl}/movimientos/export?format=${format}&${query(false)}`, { credentials: 'include' });
    if (!response.ok) return;
    const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a');
    link.href = url; link.download = `movimientos.${format}`; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4"><div><h2 className="text-xl font-bold text-slate-900">Historial de Movimientos</h2><p className="mt-1 text-xs text-slate-500">Auditoría centralizada con IP, dispositivo, filtros y retención del servidor.</p></div><div className="flex gap-2"><button onClick={() => void download('csv')} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"><Download className="h-3.5 w-3.5" />CSV</button><button onClick={() => void download('pdf')} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"><Download className="h-3.5 w-3.5" />PDF</button><button onClick={() => void load()} className="rounded-lg border p-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div></header>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="grid gap-3 border-b bg-slate-50 p-4 md:grid-cols-[1fr_160px_170px]"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Usuario, acción, pedido, SKU..." className="h-9 w-full rounded-lg border pl-9 pr-3 text-xs" /></div><select value={module} onChange={e => setModule(e.target.value as ModuloFiltro)} className="h-9 rounded-lg border px-2 text-xs">{['Todos','Pedidos','Inventario','Tickets'].map(x => <option key={x}>{x}</option>)}</select><label className="flex items-center gap-2 text-xs font-bold text-slate-500"><span>Fecha</span><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border px-2 text-xs" /></label></div>
      <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Fecha','Usuario','Módulo','Acción','Elemento','Detalle','IP / dispositivo'].map(x => <th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody className="divide-y">{items.map(item => <tr key={item.id}><td className="whitespace-nowrap px-4 py-3">{formatter.format(new Date(item.fecha))}</td><td className="px-4 py-3 font-bold">{item.usuario}</td><td className="px-4 py-3">{item.modulo}</td><td className="px-4 py-3">{item.accion}</td><td className="px-4 py-3 font-mono text-[#2B5C94]">{item.elemento}</td><td className="min-w-72 px-4 py-3">{item.detalle}</td><td className="max-w-56 px-4 py-3 text-[10px] text-slate-400"><span className="block">{item.ip || '—'}</span><span className="block truncate" title={item.dispositivo}>{item.dispositivo || '—'}</span></td></tr>)}</tbody></table></div>
      <footer className="flex items-center justify-between border-t bg-slate-50 px-4 py-3 text-xs"><span>{total} movimientos</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Anterior</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Siguiente</button></div></footer>
    </section>
  </div>;
}

import { useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface Service {
  id: string;
  title: string;
  category: string;
  fullDescription: string;
  features: string[];
  specs: Array<{ label: string; value: string }>;
  idealFor: string[];
  activo: boolean;
  orden: number;
}

function splitLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function ServiciosEditor() {
  const { notify } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setServices(await apiRequest<Service[]>('/servicios'));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async (service: Service) => {
    try {
      const saved = await apiRequest<Service>(`/servicios/${service.id}`, { method: 'PUT', body: JSON.stringify(service) });
      setServices((current) => current.map((item) => item.id === saved.id ? saved : item));
      notify(`Servicio "${saved.title}" guardado.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo guardar el servicio.');
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Cargando servicios...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Catálogo de servicios</h3>
        <button onClick={() => void load()} className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /></button>
      </div>
      {services.map((service) => (
        <article key={service.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">Título<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={service.title} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, title: e.target.value } : s))} /></label>
            <label className="text-xs font-bold text-slate-600">Categoría<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={service.category} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, category: e.target.value } : s))} /></label>
            <label className="text-xs font-bold text-slate-600 sm:col-span-2">Descripción<textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" rows={3} value={service.fullDescription} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, fullDescription: e.target.value } : s))} /></label>
            <label className="text-xs font-bold text-slate-600">Características (una por línea)<textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" rows={4} value={service.features.join('\n')} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, features: splitLines(e.target.value) } : s))} /></label>
            <label className="text-xs font-bold text-slate-600">Ideal para (una por línea)<textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" rows={4} value={service.idealFor.join('\n')} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, idealFor: splitLines(e.target.value) } : s))} /></label>
            <label className="text-xs font-bold text-slate-600 sm:col-span-2">Especificaciones (una por línea: Etiqueta: Valor)<textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" rows={4} value={service.specs.map(s => `${s.label}: ${s.value}`).join('\n')} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, specs: splitLines(e.target.value).map(line => { const [label, ...rest] = line.split(':'); return { label: label.trim(), value: rest.join(':').trim() }; }) } : s))} /></label>
            <div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={service.activo} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, activo: e.target.checked } : s))} /> Activo</label>
              <label className="text-xs font-bold text-slate-600">Orden<input type="number" className="ml-2 w-20 rounded-lg border px-2 py-1 text-xs" value={service.orden} onChange={(e) => setServices(cur => cur.map(s => s.id === service.id ? { ...s, orden: Number(e.target.value) || 0 } : s))} /></label>
              <button onClick={() => void save(service)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

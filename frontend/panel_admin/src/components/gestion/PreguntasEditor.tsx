import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export function PreguntasEditor() {
  const { notify } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setFaqs(await apiRequest<FAQ[]>('/faqs'));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudieron cargar las preguntas.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const add = async () => {
    try {
      const created = await apiRequest<FAQ>('/faqs', { method: 'POST', body: JSON.stringify({ question: 'Nueva pregunta', answer: 'Respuesta', sortOrder: faqs.length, isActive: true }) });
      setFaqs((current) => [...current, created]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo crear la pregunta.');
    }
  };

  const save = async (faq: FAQ) => {
    try {
      const saved = await apiRequest<FAQ>(`/faqs/${faq.id}`, { method: 'PUT', body: JSON.stringify({ question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, isActive: faq.isActive }) });
      setFaqs((current) => current.map((item) => item.id === saved.id ? saved : item));
      notify('Pregunta guardada.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo guardar la pregunta.');
    }
  };

  const remove = async (faq: FAQ) => {
    if (!window.confirm(`¿Eliminar la pregunta "${faq.question}"?`)) return;
    try {
      await apiRequest<void>(`/faqs/${faq.id}`, { method: 'DELETE' });
      setFaqs((current) => current.filter((item) => item.id !== faq.id));
      notify('Pregunta eliminada.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo eliminar la pregunta.');
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Cargando preguntas...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Preguntas frecuentes</h3>
        <div className="flex gap-2"><button onClick={() => void load()} className="rounded-lg border p-2 text-slate-500"><RefreshCw className="h-4 w-4" /></button><button onClick={() => void add()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" />Agregar</button></div>
      </div>
      {faqs.map((faq) => (
        <article key={faq.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid gap-3">
            <label className="text-xs font-bold text-slate-600">Pregunta<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={faq.question} onChange={(e) => setFaqs(cur => cur.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))} /></label>
            <label className="text-xs font-bold text-slate-600">Respuesta<textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" rows={3} value={faq.answer} onChange={(e) => setFaqs(cur => cur.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f))} /></label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={faq.isActive} onChange={(e) => setFaqs(cur => cur.map(f => f.id === faq.id ? { ...f, isActive: e.target.checked } : f))} /> Activa</label>
              <label className="text-xs font-bold text-slate-600">Orden<input type="number" className="ml-2 w-20 rounded-lg border px-2 py-1 text-xs" value={faq.sortOrder} onChange={(e) => setFaqs(cur => cur.map(f => f.id === faq.id ? { ...f, sortOrder: Number(e.target.value) || 0 } : f))} /></label>
              <button onClick={() => void save(faq)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#2B5C94] px-4 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button>
              <button onClick={() => void remove(faq)} className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

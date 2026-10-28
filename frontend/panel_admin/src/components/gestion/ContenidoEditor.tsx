import { useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface ContentEntry {
  key: string;
  value: unknown;
}

interface HeroValue { headline: string; highlights: string[]; supporting: string; action: string; }
interface AboutValue { heading: string; statement: string; description: string; mission: { title: string; text: string }; vision: { title: string; text: string }; }
interface ContactValue { address: { full: string }; social: { facebook: string; instagram: string; linkedin: string; tiktok: string }; schedule: { weekdays: string; saturdays: string }; }

const initial: Record<string, unknown> = {
  hero: { headline: '', highlights: [], supporting: '', action: '' },
  about: { heading: '', statement: '', description: '', mission: { title: '', text: '' }, vision: { title: '', text: '' } },
  advantages: [],
  partners: [],
  industries: [],
  contact: { address: { full: '' }, social: { facebook: '', instagram: '', linkedin: '', tiktok: '' }, schedule: { weekdays: '', saturdays: '' } },
};

function splitLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function ContenidoEditor() {
  const { notify } = useToast();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const entries = await apiRequest<ContentEntry[]>('/site-content');
      const map = Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
      setValues({ ...initial, ...map });
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo cargar el contenido.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const saveKey = async (key: string, value: unknown) => {
    try {
      await apiRequest(`/site-content/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
      notify(`Contenido "${key}" guardado.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo guardar el contenido.');
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Cargando contenido...</div>;

  const hero = values.hero as HeroValue;
  const about = values.about as AboutValue;
  const contact = values.contact as ContactValue;
  const advantages = values.advantages as Array<{ title: string; text: string }>;
  const partners = values.partners as string[];
  const industries = values.industries as string[];

  const setValue = (key: string, value: unknown) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Contenido institucional</h3>
        <button onClick={() => void load()} className="rounded-lg border p-2 text-slate-500"><RefreshCw className="h-4 w-4" /></button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-black uppercase text-slate-500">Hero</h4><button onClick={() => void saveKey('hero', hero)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button></div>
        <div className="grid gap-3"><label className="text-xs font-bold text-slate-600">Titular<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={hero.headline} onChange={(e) => setValue('hero', { ...hero, headline: e.target.value })} /></label><label className="text-xs font-bold text-slate-600">Frase de apoyo<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={hero.supporting} onChange={(e) => setValue('hero', { ...hero, supporting: e.target.value })} /></label><label className="text-xs font-bold text-slate-600">Texto del botón<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={hero.action} onChange={(e) => setValue('hero', { ...hero, action: e.target.value })} /></label></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-black uppercase text-slate-500">Quiénes somos</h4><button onClick={() => void saveKey('about', about)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button></div>
        <div className="grid gap-3"><label className="text-xs font-bold text-slate-600">Título<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={about.heading} onChange={(e) => setValue('about', { ...about, heading: e.target.value })} /></label><label className="text-xs font-bold text-slate-600">Frase<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={about.statement} onChange={(e) => setValue('about', { ...about, statement: e.target.value })} /></label><label className="text-xs font-bold text-slate-600">Descripción<textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" rows={3} value={about.description} onChange={(e) => setValue('about', { ...about, description: e.target.value })} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Misión (título)<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={about.mission.title} onChange={(e) => setValue('about', { ...about, mission: { ...about.mission, title: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Misión (texto)<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={about.mission.text} onChange={(e) => setValue('about', { ...about, mission: { ...about.mission, text: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Visión (título)<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={about.vision.title} onChange={(e) => setValue('about', { ...about, vision: { ...about.vision, title: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Visión (texto)<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={about.vision.text} onChange={(e) => setValue('about', { ...about, vision: { ...about.vision, text: e.target.value } })} /></label></div></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-black uppercase text-slate-500">Ventajas (una por línea: Título: Texto)</h4><button onClick={() => void saveKey('advantages', advantages)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button></div>
        <textarea className="w-full rounded-lg border px-3 py-2 text-xs" rows={6} value={advantages.map((a) => `${a.title}: ${a.text}`).join('\n')} onChange={(e) => setValue('advantages', splitLines(e.target.value).map((line) => { const [title, ...rest] = line.split(':'); return { title: title.trim(), text: rest.join(':').trim() }; }))} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-black uppercase text-slate-500">Partners</h4><button onClick={() => void saveKey('partners', partners)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button></div><textarea className="w-full rounded-lg border px-3 py-2 text-xs" rows={6} value={partners.join('\n')} onChange={(e) => setValue('partners', splitLines(e.target.value))} /></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-black uppercase text-slate-500">Industrias</h4><button onClick={() => void saveKey('industries', industries)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button></div><textarea className="w-full rounded-lg border px-3 py-2 text-xs" rows={6} value={industries.join('\n')} onChange={(e) => setValue('industries', splitLines(e.target.value))} /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-black uppercase text-slate-500">Contacto y redes</h4><button onClick={() => void saveKey('contact', contact)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />Guardar</button></div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Dirección<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.address.full} onChange={(e) => setValue('contact', { ...contact, address: { ...contact.address, full: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Facebook<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.social.facebook} onChange={(e) => setValue('contact', { ...contact, social: { ...contact.social, facebook: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Instagram<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.social.instagram} onChange={(e) => setValue('contact', { ...contact, social: { ...contact.social, instagram: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">LinkedIn<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.social.linkedin} onChange={(e) => setValue('contact', { ...contact, social: { ...contact.social, linkedin: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">TikTok<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.social.tiktok} onChange={(e) => setValue('contact', { ...contact, social: { ...contact.social, tiktok: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Horario (lunes a viernes)<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.schedule.weekdays} onChange={(e) => setValue('contact', { ...contact, schedule: { ...contact.schedule, weekdays: e.target.value } })} /></label><label className="text-xs font-bold text-slate-600">Horario (sábados)<input className="mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={contact.schedule.saturdays} onChange={(e) => setValue('contact', { ...contact, schedule: { ...contact.schedule, saturdays: e.target.value } })} /></label></div>
      </section>
    </div>
  );
}

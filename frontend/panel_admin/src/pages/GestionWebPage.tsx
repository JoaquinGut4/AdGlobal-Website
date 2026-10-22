import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Film, Globe, ImagePlus, Images, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ServiciosEditor } from '@/components/gestion/ServiciosEditor';
import { ContenidoEditor } from '@/components/gestion/ContenidoEditor';
import { PreguntasEditor } from '@/components/gestion/PreguntasEditor';
import { ADMIN_CONFIG } from '@/config/site';
import { apiRequest } from '@/lib/api';
import type { WebAsset, WebImageSection } from '@/types';

type GestionTab = 'medios' | 'servicios' | 'contenido' | 'preguntas';

const SERVICES = [
  { id: 'laptops-computadores', label: 'Laptops y computadoras' },
  { id: 'tablets', label: 'Tablets' },
  { id: 'impresoras-multifuncionales', label: 'Impresoras multifuncionales' },
  { id: 'proyectores', label: 'Proyectores' },
  { id: 'equipos-audiovisuales', label: 'Equipos audiovisuales' },
  { id: 'totems-digitales', label: 'Tótems digitales' },
  { id: 'pantallas-led', label: 'Pantallas LED y televisores' },
  { id: 'desarrollo-web', label: 'Desarrollo web y soluciones digitales' },
];

const SECTIONS: Array<{ id: WebImageSection; label: string; description: string }> = [
  { id: 'hero', label: 'Banner hero', description: 'Imágenes y videos principales de la portada.' },
  { id: 'servicio', label: 'Servicios', description: 'Galerías específicas para cada línea de servicio.' },
  { id: 'faq', label: 'Preguntas frecuentes', description: 'Imágenes y videos del collage de preguntas frecuentes.' },
];

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5C94]';

const API_ORIGIN = ADMIN_CONFIG.apiUrl.replace(/\/api\/v1\/?$/, '');

function mediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function isVideo(asset: WebAsset): boolean {
  return asset.mimeType?.startsWith('video/') ?? /\.(mp4|webm|mov|ogv|m4v|mpeg)$/i.test(asset.dataUrl);
}

function sectionLabel(section: WebImageSection): string {
  return SECTIONS.find((item) => item.id === section)?.label ?? section;
}

function serviceLabel(serviceId?: string | null): string {
  return SERVICES.find((item) => item.id === serviceId)?.label ?? 'Sin servicio';
}

export function GestionWebPage() {
  const [assets, setAssets] = useState<WebAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<GestionTab>('medios');
  const [section, setSection] = useState<WebImageSection>('hero');
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingAsset, setEditingAsset] = useState<WebAsset | null>(null);
  const [editName, setEditName] = useState('');
  const [editSection, setEditSection] = useState<WebImageSection>('hero');
  const [editServiceId, setEditServiceId] = useState(SERVICES[0].id);
  const [editSortOrder, setEditSortOrder] = useState('0');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState('');

  const currentSection = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];
  const visibleAssets = assets.filter(
    (asset) => asset.section === section && (section !== 'servicio' || asset.serviceId === serviceId),
  );

  const loadAssets = async () => {
    try {
      const data = await apiRequest<WebAsset[]>('/web-assets');
      setAssets(data);
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los archivos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, []);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setProcessing(true);
    setMessage('');
    setError('');
    const uploaded: WebAsset[] = [];

    try {
      for (const [index, file] of Array.from(files).entries()) {
        const video = file.type.startsWith('video/');
        if (!video && !file.type.startsWith('image/')) {
          throw new Error(`${file.name} no es una imagen ni un video compatible.`);
        }
        const limitMb = video ? 100 : 10;
        if (file.size > limitMb * 1024 * 1024) {
          throw new Error(`${file.name} supera el límite de ${limitMb} MB.`);
        }

        const formData = new FormData();
        formData.append('section', section);
        if (section === 'servicio') formData.append('service_id', serviceId);
        formData.append('sort_order', String(visibleAssets.length + index));
        formData.append('file', file);

        const created = await apiRequest<WebAsset>('/web-assets', {
          method: 'POST',
          body: formData,
        });
        uploaded.push(created);
      }

      setAssets((current) => [...current, ...uploaded]);
      setMessage(
        `${uploaded.length} ${uploaded.length === 1 ? 'archivo agregado' : 'archivos agregados'} correctamente.`,
      );
    } catch (requestError) {
      if (uploaded.length > 0) {
        setAssets((current) => [...current, ...uploaded]);
      }
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron subir los archivos.');
    } finally {
      setProcessing(false);
    }
  };

  const removeAsset = async (asset: WebAsset) => {
    const confirmed = window.confirm(`¿Eliminar "${asset.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await apiRequest<void>(`/web-assets/${asset.id}`, { method: 'DELETE' });
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setMessage('Archivo eliminado correctamente.');
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo eliminar el archivo.');
    }
  };

  const openEdit = (asset: WebAsset) => {
    setEditingAsset(asset);
    setEditName(asset.name);
    setEditSection(asset.section);
    setEditServiceId(asset.serviceId ?? SERVICES[0].id);
    setEditSortOrder(String(asset.sortOrder));
    setEditActive(asset.isActive);
    setEditError('');
  };

  const closeEdit = () => {
    setEditingAsset(null);
    setEditError('');
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingAsset) return;
    if (!editName.trim()) {
      setEditError('Ingresa un nombre para el archivo.');
      return;
    }
    if (editSection === 'servicio' && !editServiceId) {
      setEditError('Selecciona el servicio al que pertenece el archivo.');
      return;
    }

    try {
      const saved = await apiRequest<WebAsset>(`/web-assets/${editingAsset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          section: editSection,
          serviceId: editSection === 'servicio' ? editServiceId : null,
          sortOrder: Math.max(0, Number(editSortOrder) || 0),
          isActive: editActive,
        }),
      });
      setAssets((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setMessage('Archivo actualizado correctamente.');
      setError('');
      closeEdit();
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el archivo.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Gestión de contenido de la web</h2>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
            {assets.length} archivos administrados
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Multimedia, catálogo de servicios, contenido institucional y preguntas frecuentes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {([['medios', 'Multimedia'], ['servicios', 'Servicios'], ['contenido', 'Contenido'], ['preguntas', 'Preguntas']] as Array<[GestionTab, string]>).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === id ? 'bg-[#2B5C94] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>
        ))}
      </div>

      {tab === 'servicios' && <ServiciosEditor />}
      {tab === 'contenido' && <ContenidoEditor />}
      {tab === 'preguntas' && <PreguntasEditor />}

      {tab === 'medios' && (<>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((item) => {
          const total = assets.filter((asset) => asset.section === item.id).length;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                active
                  ? 'border-[#2B5C94] bg-blue-50/80 ring-2 ring-[#2B5C94]/20'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#2B5C94]">
                  {item.id === 'hero' ? <Globe className="h-4 w-4" /> : <Images className="h-4 w-4" />}
                </div>
                <span className="text-2xl font-black text-slate-900">{total}</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-600">{item.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{item.description}</p>
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentSection.label}</h3>
            <p className="text-[11px] text-slate-500">{currentSection.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {section === 'servicio' && (
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#2B5C94] focus:outline-none"
              >
                {SERVICES.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}
              </select>
            )}
            <label className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold text-white ${
              processing ? 'cursor-not-allowed bg-slate-400' : 'bg-[#2B5C94] hover:bg-[#1F4778]'
            }`}>
              <ImagePlus className="h-4 w-4" />
              {processing ? 'Subiendo...' : 'Agregar imágenes o videos'}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                disabled={processing}
                onChange={(event) => {
                  void uploadFiles(event.target.files);
                  event.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {message && (
          <div className="border-b border-emerald-100 bg-emerald-50/60 px-4 py-2 text-xs font-semibold text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="border-b border-rose-100 bg-rose-50/60 px-4 py-2 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="p-4">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">Cargando archivos...</div>
          ) : visibleAssets.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <Images className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">No hay archivos administrados</p>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Mientras no agregues archivos, web_publica seguirá utilizando sus imágenes originales.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleAssets.map((asset, index) => {
                const video = isVideo(asset);
                return (
                  <article key={asset.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="relative aspect-[16/10] bg-slate-100">
                      {video ? (
                        <video
                          src={mediaUrl(asset.dataUrl)}
                          controls
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaUrl(asset.dataUrl)}
                          alt={asset.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <span className="absolute left-2 top-2 rounded-md bg-slate-900/75 px-2 py-1 text-[10px] font-bold text-white">
                        {video ? 'Video' : 'Imagen'} {index + 1}
                      </span>
                      {!asset.isActive && (
                        <span className="absolute right-2 top-2 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold text-white">
                          Oculto
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="min-w-0 truncate text-xs font-semibold text-slate-700" title={asset.name}>
                        {asset.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {sectionLabel(asset.section)}
                        {asset.section === 'servicio' ? ` · ${serviceLabel(asset.serviceId)}` : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(asset)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#2B5C94] hover:bg-blue-100"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeAsset(asset)}
                          aria-label={`Eliminar ${asset.name}`}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      </>)}

      <Modal
        isOpen={editingAsset !== null}
        onClose={closeEdit}
        labelledBy="web-asset-edit-title"
        title="Editar archivo multimedia"
        subtitle="Cambia el nombre, sección, servicio u orden de publicación"
        icon={<Film className="h-4 w-4" />}
        headerClass="bg-[#2B5C94]"
        panelClass="max-w-xl"
      >
        <form onSubmit={saveEdit} className="flex-1 space-y-4 overflow-y-auto p-6">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Nombre / descripción *</label>
            <input required value={editName} onChange={(event) => setEditName(event.target.value)} className={FIELD_CLASS} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Sección *</label>
              <select
                value={editSection}
                onChange={(event) => setEditSection(event.target.value as WebImageSection)}
                className={FIELD_CLASS}
              >
                {SECTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Orden</label>
              <input
                type="number"
                min="0"
                value={editSortOrder}
                onChange={(event) => setEditSortOrder(event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </div>

          {editSection === 'servicio' && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Servicio *</label>
              <select value={editServiceId} onChange={(event) => setEditServiceId(event.target.value)} className={FIELD_CLASS}>
                {SERVICES.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}
              </select>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
            <input type="checkbox" checked={editActive} onChange={(event) => setEditActive(event.target.checked)} />
            Visible en la web pública
          </label>

          {editError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {editError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button type="button" onClick={closeEdit} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" className="cursor-pointer rounded-xl bg-[#2B5C94] px-5 py-2 text-xs font-bold text-white hover:bg-[#1F4778]">
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

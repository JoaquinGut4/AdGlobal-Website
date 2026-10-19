import { useState } from 'react';
import { Globe, ImagePlus, Images, Trash2 } from 'lucide-react';
import { STORAGE_KEYS } from '@/config/site';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { WebImageAsset, WebImageSection } from '@/types';

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
  { id: 'hero', label: 'Banner hero', description: 'Imágenes principales que rotan en la portada.' },
  { id: 'servicio', label: 'Servicios', description: 'Galerías específicas para cada línea de servicio.' },
  { id: 'faq', label: 'Preguntas frecuentes', description: 'Imágenes del collage de preguntas frecuentes.' },
];

function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(`${file.name} no es una imagen válida.`));
      image.onload = () => {
        const maxSize = 1400;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('No se pudo procesar la imagen.'));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.76));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function GestionWebPage() {
  const [images, setImages] = useLocalStorage<WebImageAsset[]>(STORAGE_KEYS.webImagenes, []);
  const [section, setSection] = useState<WebImageSection>('hero');
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const visibleImages = images.filter(
    (image) => image.section === section && (section !== 'servicio' || image.serviceId === serviceId),
  );
  const currentSection = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setProcessing(true);
    setMessage('');
    const uploaded: WebImageAsset[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} supera el límite de 10 MB.`);
        uploaded.push({
          id: `web-img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          section,
          serviceId: section === 'servicio' ? serviceId : undefined,
          name: file.name,
          dataUrl: await optimizeImage(file),
          createdAt: new Date().toISOString(),
        });
      }
      setImages((current) => [...current, ...uploaded]);
      window.dispatchEvent(new Event('adglobal-web-images-updated'));
      setMessage(`${uploaded.length} ${uploaded.length === 1 ? 'imagen agregada' : 'imágenes agregadas'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron procesar las imágenes.');
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = (id: string) => {
    setImages((current) => current.filter((image) => image.id !== id));
    window.dispatchEvent(new Event('adglobal-web-images-updated'));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Gestión de imágenes de la web</h2>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
            {images.length} imágenes administradas
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Administra las imágenes dinámicas utilizadas por web_publica
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((item) => {
          const total = images.filter((image) => image.section === item.id).length;
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
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3.5 text-xs font-bold text-white hover:bg-[#1F4778]">
              <ImagePlus className="h-4 w-4" />
              {processing ? 'Procesando...' : 'Agregar imágenes'}
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif"
                disabled={processing}
                onChange={(event) => {
                  void uploadImages(event.target.files);
                  event.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {message && (
          <div className="border-b border-slate-100 bg-blue-50/60 px-4 py-2 text-xs font-semibold text-[#2B5C94]">
            {message}
          </div>
        )}

        <div className="p-4">
          {visibleImages.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <Images className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">No hay imágenes administradas</p>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Mientras no agregues imágenes, web_publica seguirá utilizando sus imágenes originales.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleImages.map((image, index) => (
                <article key={image.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-md bg-slate-900/75 px-2 py-1 text-[10px] font-bold text-white">
                      {index === 0 ? 'Principal' : `Imagen ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="min-w-0 truncate text-xs font-semibold text-slate-700" title={image.name}>{image.name}</p>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Eliminar ${image.name}`}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

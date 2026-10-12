/**
 * Escaneo automático de los medios (fotos y videos) de "Nuestros Servicios".
 *
 * ¿Dónde pongo los archivos?
 *   src/assets/servicios/<carpeta>/
 *
 * Reglas:
 *  - Se detectan solos en desarrollo y en el build (Vite `import.meta.glob`).
 *  - Fotos:  jpg, jpeg, png, webp, avif, gif, svg
 *  - Videos: mp4, webm, mov, ogv, m4v
 *  - Portada de la tarjeta: el archivo que empiece por `portada.` o `cover.`;
 *    si no existe, se usa la primera imagen.
 *  - Orden: alfabético natural. Usa prefijos `01-`, `02-` para forzar el orden.
 *  - Texto (caption): se deriva del nombre del archivo. Puedes sobrescribirlo
 *    creando un `_captions.json` dentro de la carpeta, con:
 *      { "archivo.jpg": "Texto de la foto" }
 *
 * Los componentes (ServicesSection / ServiceModal) NO necesitan cambios.
 */

import type { ServiceMedia } from './servicios';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'ogv', 'm4v'];
const COVER_REGEX = /^(portada|cover)[-_. ]/i;

const MEDIA_MODULES = import.meta.glob(
  '../assets/servicios/**/*.{jpg,jpeg,png,webp,avif,gif,svg,mp4,webm,mov,ogv,m4v}',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>;

const CAPTION_MODULES = import.meta.glob('../assets/servicios/*/_captions.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>;

/** Carpetas de las que se alimenta cada servicio (por `id`). */
const SERVICE_FOLDERS: Record<string, string[]> = {
  'pantallas-led': ['pantallas-led', 'televisores'],
  'laptops-computadores': ['laptops', 'computadoras'],
  'equipos-audiovisuales': ['audiovisuales'],
  tablets: ['tablets'],
  'impresoras-multifuncionales': ['impresoras'],
  'desarrollo-web': ['desarrollo-web'],
};

interface ScannedMedia {
  folder: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

const extensionOf = (file: string): string => file.split('.').pop()?.toLowerCase() ?? '';

const sortByNaturalName = (a: string, b: string): number =>
  a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });

const scanMedia = (): ScannedMedia[] => {
  const out: ScannedMedia[] = [];
  for (const [path, url] of Object.entries(MEDIA_MODULES)) {
    const match = path.match(/servicios\/([^/]+)\/(.+)$/);
    if (!match) continue;

    const [, folder, name] = match;
    if (name.startsWith('_')) continue;

    const ext = extensionOf(name);
    const type = VIDEO_EXTENSIONS.includes(ext)
      ? 'video'
      : IMAGE_EXTENSIONS.includes(ext)
        ? 'image'
        : null;
    if (!type) continue;

    out.push({ folder, name, url, type });
  }
  return out;
};

const SCANNED_MEDIA = scanMedia();

const CAPTIONS: Record<string, Record<string, string>> = {};
for (const [path, data] of Object.entries(CAPTION_MODULES)) {
  const match = path.match(/servicios\/([^/]+)\/_captions\.json$/);
  if (match && data) CAPTIONS[match[1]] = data;
}

const captionFromFilename = (file: string): string => {
  const base = file.replace(/\.[^.]+$/, '');
  const stripped = base.replace(/^\d+[-_. ]+/, '');
  const text = stripped.replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text || /^\d+$/.test(text)) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export interface ServiceMediaResult {
  featuredImage?: string;
  gallery: ServiceMedia[];
}

/**
 * Devuelve la portada y la galería de un servicio leídas desde su(s) carpeta(s).
 * @param serviceId    Debe coincidir con una clave de `SERVICE_FOLDERS`.
 * @param serviceTitle Se usa como texto por defecto cuando el nombre del
 *                     archivo no aporta información (ej. "1.jpg").
 */
export const getServiceMedia = (serviceId: string, serviceTitle: string): ServiceMediaResult => {
  const folders = SERVICE_FOLDERS[serviceId] ?? [];
  const folderOrder = new Map(folders.map((folder, index) => [folder, index]));

  const files = SCANNED_MEDIA.filter((file) => folderOrder.has(file.folder)).sort((a, b) => {
    const diff = (folderOrder.get(a.folder) ?? 0) - (folderOrder.get(b.folder) ?? 0);
    return diff !== 0 ? diff : sortByNaturalName(a.name, b.name);
  });

  const counters = { image: 0, video: 0 };
  const gallery: ServiceMedia[] = files.map((file) => {
    let caption = CAPTIONS[file.folder]?.[file.name] ?? captionFromFilename(file.name);
    if (!caption) {
      counters[file.type] += 1;
      caption = `${serviceTitle}${counters[file.type] > 1 ? ` ${counters[file.type]}` : ''}`;
    }
    return { type: file.type, url: file.url, caption };
  });

  const cover = files.find((file) => COVER_REGEX.test(file.name));
  const firstImage = files.find((file) => file.type === 'image');

  return { featuredImage: (cover ?? firstImage)?.url, gallery };
};

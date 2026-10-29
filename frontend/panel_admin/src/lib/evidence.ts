import { ADMIN_CONFIG } from '@/config/site';

/** URL absoluta del archivo, respetando si el panel usa un backend externo. */
export function resolveEvidenceUrl(url: string): string {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url;
  const origin = ADMIN_CONFIG.apiUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export type EvidenceKind = 'image' | 'video' | 'file';

export function evidenceKind(url: string): EvidenceKind {
  const path = url.split('?')[0].toLowerCase();
  if (/\.(jpe?g|png|webp|avif|gif|svg)$/.test(path)) return 'image';
  if (/\.(mp4|webm|mov|ogv|m4v|mpeg)$/.test(path)) return 'video';
  return 'file';
}

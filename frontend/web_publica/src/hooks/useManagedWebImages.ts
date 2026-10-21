import { useSyncExternalStore } from 'react';
import { SITE } from '@/config/site';

export type ManagedImageSection = 'hero' | 'servicio' | 'faq';
export type ManagedMediaType = 'image' | 'video';

export interface ManagedWebImage {
  id: string;
  section: ManagedImageSection;
  serviceId?: string | null;
  name: string;
  dataUrl: string;
  type: ManagedMediaType;
  createdAt: string;
}

interface ApiWebAsset {
  id: string;
  section: ManagedImageSection;
  serviceId?: string | null;
  name: string;
  dataUrl: string;
  mimeType?: string;
  sortOrder?: number;
  createdAt: string;
}

const API_ORIGIN = SITE.apiUrl.replace(/\/api\/v1\/?$/, '');
const VIDEO_PATTERN = /\.(mp4|webm|mov|ogv|m4v|mpeg)$/i;
const REFRESH_MS = 30_000;

function resolveUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapAsset(asset: ApiWebAsset): ManagedWebImage {
  const type: ManagedMediaType =
    asset.mimeType?.startsWith('video/') || VIDEO_PATTERN.test(asset.dataUrl) ? 'video' : 'image';
  return {
    id: asset.id,
    section: asset.section,
    serviceId: asset.serviceId ?? undefined,
    name: asset.name,
    dataUrl: resolveUrl(asset.dataUrl),
    type,
    createdAt: asset.createdAt,
  };
}

/**
 * Store compartido de medios administrados.
 *
 * Antes cada Hero/ServicePanel/FaqCollage instanciaba su propio fetch y su
 * propio intervalo: con 8 servicios se hacían 10 peticiones cada 30 segundos.
 * Ahora todos los componentes comparten una única lista y una única descarga.
 */
let snapshot: ManagedWebImage[] = [];
const listeners = new Set<() => void>();
let intervalId: number | null = null;
let inflight: Promise<void> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function sameImages(next: ManagedWebImage[]): boolean {
  if (next.length !== snapshot.length) return false;
  return next.every((item, index) => {
    const current = snapshot[index];
    return (
      item.id === current.id &&
      item.section === current.section &&
      item.serviceId === current.serviceId &&
      item.name === current.name &&
      item.dataUrl === current.dataUrl
    );
  });
}

async function loadImages(): Promise<void> {
  if (!SITE.apiUrl) return;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await fetch(`${SITE.apiUrl}/public/web-assets`);
      if (!response.ok) return;
      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload)) return;

      const next = payload
        .filter(
          (item): item is ApiWebAsset =>
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            'section' in item &&
            'dataUrl' in item,
        )
        .map(mapAsset);

      if (!sameImages(next)) {
        snapshot = next;
        emit();
      }
    } catch {
      // Si el backend no está disponible, la web conserva sus medios locales.
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

function handleFocus() {
  void loadImages();
}

function handleVisibility() {
  if (document.visibilityState === 'visible') void loadImages();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    void loadImages();
    if (SITE.apiUrl) {
      intervalId = window.setInterval(() => void loadImages(), REFRESH_MS);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);
    }
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  };
}

function getSnapshot(): ManagedWebImage[] {
  return snapshot;
}

export function useManagedWebImages(): ManagedWebImage[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

import { useEffect, useState } from 'react';
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

export function useManagedWebImages() {
  const [images, setImages] = useState<ManagedWebImage[]>([]);

  useEffect(() => {
    if (!SITE.apiUrl) return;

    let active = true;

    const loadImages = async () => {
      try {
        const response = await fetch(`${SITE.apiUrl}/public/web-assets`);
        if (!response.ok) return;
        const payload = (await response.json()) as unknown;
        if (!Array.isArray(payload) || !active) return;
        setImages(
          payload
            .filter(
              (item): item is ApiWebAsset =>
                typeof item === 'object' &&
                item !== null &&
                'id' in item &&
                'section' in item &&
                'dataUrl' in item,
            )
            .map(mapAsset),
        );
      } catch {
        // Si el backend no está disponible, la web conserva sus medios locales.
      }
    };

    void loadImages();
    const interval = window.setInterval(loadImages, 30000);
    const handleFocus = () => void loadImages();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void loadImages();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return images;
}

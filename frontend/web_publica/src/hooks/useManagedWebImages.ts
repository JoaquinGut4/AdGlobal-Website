import { useEffect, useState } from 'react';

export type ManagedImageSection = 'hero' | 'servicio' | 'faq';

export interface ManagedWebImage {
  id: string;
  section: ManagedImageSection;
  serviceId?: string;
  name: string;
  dataUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'adglobal_web_images_v1';
const UPDATE_EVENT = 'adglobal-web-images-updated';

function loadImages(): ManagedWebImage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data)
      ? data.filter(
          (item): item is ManagedWebImage =>
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            'section' in item &&
            'dataUrl' in item,
        )
      : [];
  } catch {
    return [];
  }
}

export function useManagedWebImages() {
  const [images, setImages] = useState<ManagedWebImage[]>(loadImages);

  useEffect(() => {
    const refresh = () => setImages(loadImages());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, []);

  return images;
}

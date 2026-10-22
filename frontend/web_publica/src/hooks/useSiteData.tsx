import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SITE } from '@/config/site';
import { SERVICIOS_DATA, type ServiceItem } from '@/data/servicios';
import { getServiceMedia } from '@/data/media';
import {
  HERO,
  ABOUT,
  VENTAJAS,
  PARTNERS,
  INDUSTRIAS,
  PREGUNTAS_FRECUENTES,
  CONTACTO_INFO,
  type FAQItem,
} from '@/data/contenido';

export interface SiteContent {
  hero: typeof HERO;
  about: typeof ABOUT;
  ventajas: typeof VENTAJAS;
  partners: string[];
  industrias: string[];
  contacto: typeof CONTACTO_INFO;
}

const DEFAULT_CONTENT: SiteContent = {
  hero: HERO,
  about: ABOUT,
  ventajas: VENTAJAS,
  partners: PARTNERS,
  industrias: INDUSTRIAS,
  contacto: CONTACTO_INFO,
};

interface SiteData {
  services: ServiceItem[];
  faqs: FAQItem[];
  content: SiteContent;
}

const SiteDataContext = createContext<SiteData>({
  services: SERVICIOS_DATA,
  faqs: PREGUNTAS_FRECUENTES,
  content: DEFAULT_CONTENT,
});

interface ApiService {
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

function mapService(item: ApiService): ServiceItem {
  const media = getServiceMedia(item.id, item.title);
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    fullDescription: item.fullDescription,
    featuredImage: media.featuredImage,
    gallery: media.gallery,
    features: item.features,
    specs: item.specs,
    idealFor: item.idealFor,
  };
}

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>({
    services: SERVICIOS_DATA,
    faqs: PREGUNTAS_FRECUENTES,
    content: DEFAULT_CONTENT,
  });

  useEffect(() => {
    if (!SITE.apiUrl) return;
    let active = true;
    const load = async () => {
      const [services, faqs, content] = await Promise.all([
        fetch(`${SITE.apiUrl}/public/services`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch(`${SITE.apiUrl}/public/faqs`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch(`${SITE.apiUrl}/public/content`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);
      if (!active) return;
      setData((current) => {
        const contentMap = new Map((content as Array<{ key: string; value: unknown }>).map((entry) => [entry.key, entry.value]));
        const nextContent: SiteContent = {
          hero: (contentMap.get('hero') as SiteContent['hero']) ?? current.content.hero,
          about: (contentMap.get('about') as SiteContent['about']) ?? current.content.about,
          ventajas: (contentMap.get('advantages') as SiteContent['ventajas']) ?? current.content.ventajas,
          partners: (contentMap.get('partners') as string[]) ?? current.content.partners,
          industrias: (contentMap.get('industries') as string[]) ?? current.content.industrias,
          contacto: (contentMap.get('contact') as SiteContent['contacto']) ?? current.content.contacto,
        };
        const mappedServices = (services as ApiService[]).filter((item) => item.activo).map(mapService);
        return {
          services: mappedServices.length ? mappedServices : current.services,
          faqs: (faqs as Array<{ id: string; question: string; answer: string }>).length
            ? (faqs as Array<{ id: string; question: string; answer: string }>)
            : current.faqs,
          content: nextContent,
        };
      });
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => data, [data]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteData {
  return useContext(SiteDataContext);
}

/**
 * Catálogo de servicios ofrecidos (versión ligera para el panel).
 * Solo se utiliza para etiquetar cotizaciones y filtrar por servicio.
 */

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
}

export const SERVICIOS_DATA: ServiceItem[] = [
  {
    id: 'pantallas-led',
    slug: 'pantallas-led',
    title: 'Pantallas LED y Televisores',
    shortDescription:
      'Módulos LED de pitch fino y Smart TV 4K con pedestales para stands, ferias y auditorios.',
    category: 'Visual & Pantallas',
  },
  {
    id: 'laptops-computadores',
    slug: 'laptops-computadores',
    title: 'Laptops y Computadores',
    shortDescription:
      'Flotas homogéneas de laptops corporativas, workstations y equipos All-in-One.',
    category: 'Cómputo & TI',
  },
  {
    id: 'equipos-audiovisuales',
    slug: 'equipos-audiovisuales',
    title: 'Equipos Audiovisuales',
    shortDescription:
      'Sonido profesional, microfonía inalámbrica, consolas digitales e iluminación escénica.',
    category: 'Audio & Iluminación',
  },
  {
    id: 'tablets',
    slug: 'tablets',
    title: 'Tablets',
    shortDescription:
      'Flotas iPad y Android con atriles antirrobo para acreditación, registro y encuestas.',
    category: 'Móvil & Acreditación',
  },
  {
    id: 'impresoras-multifuncionales',
    slug: 'impresoras-multifuncionales',
    title: 'Impresoras Multifuncionales',
    shortDescription: 'Equipos láser de alta velocidad con tóner ilimitado y monitoreo continuo.',
    category: 'Impresión & Oficina',
  },
  {
    id: 'desarrollo-web',
    slug: 'desarrollo-web',
    title: 'Desarrollo Web y Soluciones Digitales',
    shortDescription:
      'Plataformas web corporativas, sistemas de acreditación y aplicaciones a medida.',
    category: 'Software & Digital',
  },
];

/** Devuelve el nombre legible de un servicio a partir de su id. */
export const getServicioNombre = (servicioId: string): string =>
  SERVICIOS_DATA.find((servicio) => servicio.id === servicioId)?.title ?? servicioId;

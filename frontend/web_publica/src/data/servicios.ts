import { getServiceMedia } from './media';

export interface ServiceMedia {
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  /** Imagen de portada de la tarjeta. Si se omite, se muestra un degradado. */
  featuredImage?: string;
  gallery: ServiceMedia[];
  features: string[];
  specs: {
    label: string;
    value: string;
  }[];
  idealFor: string[];
}

export const SERVICIOS_DATA: ServiceItem[] = [
  {
    id: 'pantallas-led',
    slug: 'pantallas-led',
    title: 'Pantallas LED y Televisores',
    shortDescription:
      'Módulos LED gigantes de alta resolución y televisores Smart 4K de 55" a 85" con pedestales para stands, ferias y auditorios.',
    fullDescription:
      'Disponemos de la última generación en tecnología de visualización LED diseñada específicamente para congresos de alto nivel, ferias internacionales, lanzamientos de producto y escenarios multitudinarios. Asimismo, ofrecemos televisores Smart TV 4K de 55", 65", 75" y 85" con pedestales de diseño y soportes profesionales para stands y salas de reuniones.',
    category: 'Visual & Pantallas',
    ...getServiceMedia('pantallas-led', 'Pantallas LED y Televisores'),
    features: [
      'Pixel Pitch ultrafino: P1.9 indoor, P2.6 y P3.9 outdoor de alto brillo (5500 nits)',
      'Televisores Smart 4K UHD desde 55" hasta 85" con pedestales de altura regulable',
      'Procesadores de video de vanguardia con conmutación sin latencia y soporte 4K HDR',
      'Módulos de cambio rápido magnéticos con redundancia de señal y energía',
      'Personal técnico certificado presente durante todo el montaje, prueba y evento en vivo',
    ],
    specs: [
      { label: 'Pixel LED', value: '1.9mm / 2.6mm / 3.9mm' },
      { label: 'Smart TVs 4K', value: '55", 65", 75" y 85" UHD' },
      { label: 'Frecuencia de Actualización', value: '3,840 Hz' },
      { label: 'Procesamiento', value: 'Procesadores 4K HDR profesionales' },
    ],
    idealFor: [
      'Convenciones corporativas',
      'Congresos internacionales',
      'Ferias comerciales y exposiciones',
      'Stands para ferias comerciales y exposiciones',
      'Conferencias magistrales, asambleas ',
      'Lanzamientos de marca',
    ],
  },
  {
    id: 'laptops-computadores',
    slug: 'laptops-computadores',
    title: 'Laptops y Computadores',
    shortDescription:
      'Flotas de laptops corporativas de alto rendimiento, workstations y equipos para capacitaciones y eventos.',
    fullDescription:
      'Ofrecemos soluciones integrales de cómputo para empresas y eventos con flotas homogéneas de laptops profesionales (Dell, HP, Lenovo, Advance y Apple). Entregamos equipos completamente configurados, antivirus corporativo y soporte técnico inmediato.',
    category: 'Cómputo & TI',
    ...getServiceMedia('laptops-computadores', 'Laptops y Computadores'),
    features: [
      'Procesadores Intel Core i5, i7, i9 y Apple Silicon (M2/M3)',
      'Memoria RAM de 16GB a 64GB y unidades SSD y HDD',
    ],
    specs: [
      { label: 'Procesadores', value: 'Intel Core i5/i7/i9 (Gen 11-14) / Apple M2 Pro/Max' },
      { label: 'Memoria RAM', value: '16GB / 32GB / 64GB' },
      { label: 'Almacenamiento', value: '250GB a 2TB' },
      { label: 'Pantallas', value: '14" / 15.6" / 16" FHD & QHD' },
    ],
    idealFor: [
      'Capacitaciones corporativas',
      'Talleres intensivos',
      'Hackathons, bootcamps y certámenes de innovación tecnológica',
      'Salas de prensa y centros de acreditación de eventos',
    ],
  },
  {
    id: 'equipos-audiovisuales',
    slug: 'equipos-audiovisuales',
    title: 'Equipos Audiovisuales',
    shortDescription:
      'Sistemas de sonido profesional, microfonía inalámbrica, consolas digitales, iluminación escénica y transmisión en vivo para conferencias y eventos.',
    fullDescription:
      'Equipamiento audiovisual completo de estándar para conferencias, foros y eventos masivos. Incluye microfonía inalámbrica, sistemas de sonido, consolas digitales, focos de iluminación y conmutación de video.',
    category: 'Audio & Iluminación',
    ...getServiceMedia('equipos-audiovisuales', 'Equipos Audiovisuales'),
    features: [
      'Microfonía de mano, corbateros y vinchas inalámbricas de largo alcance',
      'Consolas digitales de mezcla con procesamiento DSP para alta inteligibilidad de voz',
      'Iluminación para escenarios, reflectores perimetrales y cabezales móviles',
    ],
    specs: [
      { label: 'Marcas de Audio', value: 'Yamaha / Shure / JBL / Sennheiser' },
      { label: 'Canales de Mezcla', value: 'Hasta 32 canales digitales simultáneos' },
      { label: 'Iluminación', value: 'LED RGBW / Cabezales móviles Beam' },
      { label: 'Soporte', value: 'Operador técnico presencial 100% garantizado' },
    ],
    idealFor: [
      'Asambleas corporativas y juntas de accionistas',
      'Lanzamientos de productos y cócteles institucionales',
      'Talleres interactivos y conferencias magistrales',
    ],
  },
  {
    id: 'tablets',
    slug: 'tablets',
    title: 'Tablets',
    shortDescription:
      'Flotas de tablets iPad, Microsoft y Android de última generación con atriles y soportes, registro y encuestas en ferias y congresos.',
    fullDescription:
      'Ponemos a su disposición lotes homogéneos de tablets Apple, Lenovo y Samsung configuradas para recepción de asistentes, lectura de credenciales QR, encuestas interactivas o firma electrónica. Incluyen pedestales de piso de alta seguridad, fundas reforzadas y soporte técnico.',
    category: 'Móvil & Acreditación',
    ...getServiceMedia('tablets', 'Tablets'),
    features: [
      'Modelos Apple, Lenovo y Samsung de alto rendimiento',
      'Soportes con cerradura de seguridad y ángulo regulable',
      'Batería de larga duración y cargadores múltiples incluidos',
    ],
    specs: [
      { label: 'Pantalla', value: '10.2" / 10.9" / 11" Retina & AMOLED' },
      { label: 'Sistemas Operativos', value: 'iPadOS / Android / Windows' },
      { label: 'Conectividad', value: 'Wi-Fi 6 + opción chip 4G/5G LTE' },
      { label: 'Seguridad', value: 'Carcasas de seguridad y cable reforzado' },
    ],
    idealFor: [
      'Mesas de bienvenida y acreditación de congresos',
      'Encuestas de satisfacción y recojo de leads comerciales en ferias',
      'Capacitaciones con evaluaciones interactivas',
    ],
  },
  {
    id: 'impresoras-multifuncionales',
    slug: 'impresoras-multifuncionales',
    title: 'Impresoras Multifuncionales',
    shortDescription:
      'Equipos láser de alta velocidad, escaneo duplex y copiado masivo.',
    fullDescription:
      'Garantice la continuidad operativa y la gestión documental de su oficina temporal, evento o proyecto con nuestras impresoras multifuncionales láser de alta demanda (HP, Canon y Xerox). Nuestro servicio incluye transporte (encaso lo necesite) e instalación en red.',
    category: 'Impresión & Oficina',
    ...getServiceMedia('impresoras-multifuncionales', 'Impresoras Multifuncionales'),
    features: [
      'Velocidades de hasta 55 páginas por minuto en color y monocromo',
      'Alimentador automático de documentos a doble cara',
      'Conectividad Ethernet Gigabit, Wi-Fi seguro e impresión móvil',
    ],
    specs: [
      { label: 'Velocidad de Impresión', value: '35 a 55 ppm (Páginas por minuto)' },
      { label: 'Resolución Óptica', value: '1,200 x 1,200 dpi de precisión láser' },
      { label: 'Formatos Soportados', value: 'A4, Carta, Oficio, A3 y Tabloide' },
    ],
    idealFor: [
      'Salas de redacción y centros de prensa en cumbres de gobierno',
      'Oficinas de obra, faenas mineras y plantas industriales temporales',
    ],
  },
  {
    id: 'desarrollo-web',
    slug: 'desarrollo-web',
    title: 'Desarrollo Web y Soluciones Digitales',
    shortDescription:
      'Plataformas web corporativas, landing pages para eventos, sistemas de logistica/inventario y aplicaciones web a medida.',
    fullDescription:
      'Complementamos su infraestructura física con soluciones tecnológicas digitales de vanguardia. Diseñamos y desarrollamos plataformas web corporativas de alto rendimiento, sistemas de registro y acreditación con código QR para congresos, landing pages de captación con analítica avanzada e intranets empresariales.',
    category: 'Software & Digital',
    ...getServiceMedia('desarrollo-web', 'Desarrollo Web y Soluciones Digitales'),
    features: [
      'Desarrollo con tecnologías modernas: React, TypeScript, Next.js, Node.js, Tailwind CSS, entre otros',
      'Sistemas de registro en línea, generación de credenciales y lectura QR para eventos',
      'Arquitectura segura en la nube con certificado SSL y alto rendimiento',
    ],
    specs: [
      { label: 'Frameworks', value: 'React / Next.js / Node.js / Express' },
      { label: 'Base de Datos', value: 'PostgreSQL / MySQL / MongoDB' },
      { label: 'Rendimiento', value: 'Core Web Vitals > 95/100 en Google PageSpeed' },
    ],
    idealFor: [
      'Empresas o Mipymes que requieren modernizar su portal web corporativo',
      'Eventos que necesitan plataforma de registro de asistentes y emisión de boletos',
    ],
  },
];

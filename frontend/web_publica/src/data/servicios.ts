import { asset } from '@/config/site';

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
      'Disponemos de la última generación en tecnología de visualización LED de pitch fino (P1.9, P2.6, P3.9) diseñada específicamente para congresos de alto nivel, ferias internacionales, lanzamientos de producto y escenarios multitudinarios. Asimismo, ofrecemos televisores Smart TV 4K de 55", 65", 75" y 85" con pedestales de diseño y soportes profesionales para stands y salas de reuniones.',
    category: 'Visual & Pantallas',
    featuredImage: asset('assets/pantallas-led/2.png'),
    gallery: [
      { type: 'image', url: asset('assets/pantallas-led/2.png'), caption: 'Muro LED de alta resolución en auditorio corporativo' },
      { type: 'image', url: asset('assets/pantallas-led/1.jpeg'), caption: 'Pantalla LED de gran formato para escenario principal' },
      { type: 'image', url: asset('assets/pantallas-led/3.png'), caption: 'Módulos LED de pitch fino en montaje de evento' },
      { type: 'image', url: asset('assets/pantallas-led/5.jpeg'), caption: 'Pantalla LED panorámica para congresos y ferias' },
      { type: 'image', url: asset('assets/televisores/1.jpeg'), caption: 'Televisor Smart 4K con pedestal profesional' },
      { type: 'image', url: asset('assets/televisores/2.jpeg'), caption: 'Smart TV para stands y salas de reuniones' },
      { type: 'video', url: asset('assets/pantallas-led/V1.mp4'), caption: 'Demostración de muro LED en funcionamiento' },
      { type: 'video', url: asset('assets/pantallas-led/V2.mp4'), caption: 'Montaje y calibración de pantallas LED' },
    ],
    features: [
      'Pixel Pitch ultrafino: P1.9 indoor, P2.6 y P3.9 outdoor de alto brillo (5500 nits)',
      'Televisores Smart 4K UHD desde 55" hasta 85" con pedestales de altura regulable',
      'Procesadores de video de vanguardia con conmutación sin latencia y soporte 4K HDR',
      'Módulos de cambio rápido magnéticos con redundancia de señal y energía',
      'Personal técnico certificado presente durante todo el montaje, prueba y evento en vivo',
    ],
    specs: [
      { label: 'Pixel Pitch LED', value: '1.9mm / 2.6mm / 3.9mm' },
      { label: 'Smart TVs 4K', value: '55", 65", 75" y 85" UHD' },
      { label: 'Frecuencia de Actualización', value: '3,840 Hz (Anti-flicker para cámaras)' },
      { label: 'Procesamiento', value: 'Procesadores 4K HDR profesionales' },
    ],
    idealFor: [
      'Convenciones corporativas y congresos internacionales',
      'Stands para ferias comerciales y exposiciones',
      'Conferencias magistrales, asambleas y lanzamientos de marca',
    ],
  },
  {
    id: 'laptops-computadores',
    slug: 'laptops-computadores',
    title: 'Laptops y Computadores',
    shortDescription:
      'Flotas de laptops corporativas de alto rendimiento, workstations y equipos All-in-One para capacitaciones y eventos.',
    fullDescription:
      'Ofrecemos soluciones integrales de cómputo para empresas y eventos con flotas homogéneas de laptops profesionales (Dell, HP, Lenovo y Apple MacBook). Entregamos equipos completamente configurados, clonados con la imagen de software de su empresa, antivirus corporativo y soporte técnico inmediato.',
    category: 'Cómputo & TI',
    featuredImage: asset('assets/laptops/2.webp'),
    gallery: [
      { type: 'image', url: asset('assets/laptops/2.webp'), caption: 'Flota corporativa de laptops empresariales de alta gama' },
      { type: 'image', url: asset('assets/laptops/1.webp'), caption: 'Laptops profesionales configuradas para capacitaciones' },
      { type: 'image', url: asset('assets/laptops/3.png'), caption: 'Workstations de alto rendimiento' },
      { type: 'image', url: asset('assets/laptops/6.jpg'), caption: 'Equipos listos para entrega y despliegue' },
      { type: 'image', url: asset('assets/computadoras/3.jpg'), caption: 'Computadoras de escritorio y estaciones de trabajo' },
      { type: 'image', url: asset('assets/computadoras/2.jpg'), caption: 'Equipos All-in-One para oficinas y eventos' },
    ],
    features: [
      'Procesadores Intel Core i5, i7, i9 y Apple Silicon (M2/M3)',
      'Memoria RAM de 16GB a 64GB y unidades SSD NVMe ultrarrápidas',
      'Clonación masiva de software con el sistema operativo que requiera su evento',
      'Equipos de respaldo (hot-swap) incluidos en cada lote entregado',
    ],
    specs: [
      { label: 'Procesadores', value: 'Intel Core i5/i7/i9 (Gen 12-14) / Apple M2 Pro/Max' },
      { label: 'Memoria RAM', value: '16GB / 32GB / 64GB DDR5' },
      { label: 'Almacenamiento', value: '512GB a 2TB NVMe PCIe Gen 4' },
      { label: 'Pantallas', value: '14" / 15.6" / 16" FHD & QHD IPS Antirreflejo' },
    ],
    idealFor: [
      'Capacitaciones corporativas y entrenamientos intensivos',
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
      'Equipamiento audiovisual completo de estándar broadcast para conferencias, foros y eventos masivos. Incluye microfonía inalámbrica, sistemas de sonido line-array, consolas digitales, focos robóticos de iluminación y conmutación de video.',
    category: 'Audio & Iluminación',
    gallery: [
      { type: 'image', url: asset('assets/pantallas-led/6.jpeg'), caption: 'Producción técnica integral para eventos y conferencias' },
      { type: 'image', url: asset('assets/pantallas-led/7.jpg'), caption: 'Iluminación escénica y montaje audiovisual' },
      { type: 'image', url: asset('assets/televisores/4.jpeg'), caption: 'Conmutación de video y despliegue de pantallas' },
      { type: 'video', url: asset('assets/pantallas-led/V3.mp4'), caption: 'Configuración y prueba de producción en vivo' },
    ],
    features: [
      'Microfonía de mano, corbateros y vinchas inalámbricas de largo alcance',
      'Consolas digitales de mezcla con procesamiento DSP para alta inteligibilidad de voz',
      'Iluminación para escenarios, reflectores perimetrales y cabezales móviles',
      'Ingenieros de sonido y operadores audiovisuales certificados durante el evento',
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
      'Flotas de tablets iPad y Android de última generación con atriles y soportes antirrobo para acreditación, registro y encuestas en ferias y congresos.',
    fullDescription:
      'Ponemos a su disposición lotes homogéneos de tablets Apple iPad y Samsung Galaxy Tab configuradas para recepción de asistentes, lectura de credenciales QR, encuestas interactivas o firma electrónica. Incluyen pedestales de piso de alta seguridad, fundas reforzadas y soporte técnico.',
    category: 'Móvil & Acreditación',
    featuredImage: asset('assets/tablets/1.jpg'),
    gallery: [
      { type: 'image', url: asset('assets/tablets/1.jpg'), caption: 'Mesa de acreditación con tablets y lectura de código QR' },
      { type: 'image', url: asset('assets/tablets/2.avif'), caption: 'Tablets configuradas en Modo Kiosco' },
      { type: 'image', url: asset('assets/tablets/3.webp'), caption: 'Soportes de seguridad con ángulo regulable' },
      { type: 'image', url: asset('assets/tablets/4.webp'), caption: 'Flota de tablets para registro de asistentes' },
    ],
    features: [
      'Modelos Apple iPad y Samsung Galaxy Tab de alto rendimiento',
      'Soportes metálicos con cerradura de seguridad y ángulo regulable',
      'Configuración en Modo Kiosco (bloqueo de aplicaciones no autorizadas)',
      'Batería de larga duración y cargadores múltiples incluidos',
    ],
    specs: [
      { label: 'Pantalla', value: '10.2" / 10.9" / 11" Retina & AMOLED' },
      { label: 'Sistemas Operativos', value: 'iPadOS 17+ / Android 13+' },
      { label: 'Conectividad', value: 'Wi-Fi 6 + opción chip 4G/5G LTE' },
      { label: 'Seguridad', value: 'Carcasas blindadas y cable de acero Kensington' },
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
      'Equipos láser de alta velocidad, escaneo duplex y copiado masivo. Suministros y tóner ilimitado con monitoreo continuo.',
    fullDescription:
      'Garantice la continuidad operativa y la gestión documental de su oficina temporal, evento o proyecto con nuestras impresoras multifuncionales láser de alta demanda (Ricoh, HP LaserJet Enterprise, Canon y Xerox). Nuestro servicio incluye transporte, instalación en red y suministros de tóner ilimitados.',
    category: 'Impresión & Oficina',
    featuredImage: asset('assets/impresoras/2.jpeg'),
    gallery: [
      { type: 'image', url: asset('assets/impresoras/2.jpeg'), caption: 'Equipo multifuncional láser empresarial de alta velocidad' },
      { type: 'image', url: asset('assets/impresoras/1.jpeg'), caption: 'Impresoras multifuncionales en red' },
      { type: 'image', url: asset('assets/impresoras/4.jpg'), caption: 'Escaneo duplex y copiado masivo de documentos' },
      { type: 'image', url: asset('assets/impresoras/5.jpg'), caption: 'Equipos de impresión para oficinas temporales' },
      { type: 'video', url: asset('assets/impresoras/V1.mp4'), caption: 'Impresión de alta velocidad y monitoreo continuo' },
    ],
    features: [
      'Velocidades de hasta 55 páginas por minuto en color y monocromo',
      'Alimentador automático de documentos a doble cara (RADF / SPDF)',
      'Conectividad Ethernet Gigabit, Wi-Fi seguro e impresión móvil',
      'Tóner y consumibles 100% cubiertos en el contrato de alquiler',
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
      'Plataformas web corporativas, landing pages para eventos, sistemas de acreditación y aplicaciones web a medida.',
    fullDescription:
      'Complementamos su infraestructura física con soluciones tecnológicas digitales de vanguardia. Diseñamos y desarrollamos plataformas web corporativas de alto rendimiento, sistemas de registro y acreditación con código QR para congresos, landing pages de captación con analítica avanzada e intranets empresariales.',
    category: 'Software & Digital',
    gallery: [],
    features: [
      'Desarrollo con tecnologías modernas: React, TypeScript, Next.js, Node.js y Tailwind CSS',
      'Sistemas de registro en línea, generación de credenciales y lectura QR para eventos',
      'Arquitectura segura en la nube con certificado SSL y alto rendimiento',
    ],
    specs: [
      { label: 'Frameworks', value: 'React / Next.js / Node.js / Express' },
      { label: 'Base de Datos', value: 'PostgreSQL / MySQL / MongoDB' },
      { label: 'Rendimiento', value: 'Core Web Vitals > 95/100 en Google PageSpeed' },
    ],
    idealFor: [
      'Empresas que requieren modernizar su portal web corporativo',
      'Eventos que necesitan plataforma de registro de asistentes y emisión de boletos',
    ],
  },
];

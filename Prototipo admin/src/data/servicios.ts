export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  featuredImage: string;
  gallery: {
    url: string;
    caption: string;
  }[];
  video?: {
    type: 'embed' | 'video';
    src: string;
    thumbnail: string;
    title: string;
  };
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
    shortDescription: 'Módulos LED gigantes de alta resolución y televisores Smart 4K de 55" a 85" con pedestales para stands, ferias y auditorios.',
    fullDescription: 'Disponemos de la última generación en tecnología de visualización LED de pitch fino (P1.9, P2.6, P3.9) diseñada específicamente para congresos de alto nivel, ferias internacionales, lanzamientos de producto y escenarios multitudinarios. Asimismo, ofrecemos televisores Smart TV 4K de 55", 65", 75" y 85" con pedestales de diseño y soportes profesionales para stands y salas de reuniones.',
    category: 'Visual & Pantallas',
    featuredImage: '/src/assets/images/service_led_screens_1791695540003.jpg',
    gallery: [
      {
        url: '/src/assets/images/service_led_screens_1791695540003.jpg',
        caption: 'Muro LED curvo de alta tasa de refresco en auditorio corporativo'
      },
      {
        url: '/src/assets/images/hero_tech_rental_stage_1791695531583.jpg',
        caption: 'Escenario principal con pantalla panorámica y procesador 4K'
      }
    ],
    video: {
      type: 'embed',
      src: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: '/src/assets/images/service_led_screens_1791695540003.jpg',
      title: 'Demostración de ensamblaje y calibración LED Novastar 4K'
    },
    features: [
      'Pixel Pitch ultrafino: P1.9 indoor, P2.6 y P3.9 outdoor de alto brillo (5500 nits)',
      'Televisores Smart 4K UHD desde 55" hasta 85" con pedestales cromados de altura regulable',
      'Procesadores de video de vanguardia Novastar con conmutación sin latencia y soporte 4K HDR',
      'Módulos de cambio rápido magnéticos con redundancia de señal y energía',
      'Personal técnico certificado presente durante todo el montaje, prueba y evento en vivo'
    ],
    specs: [
      { label: 'Pixel Pitch LED', value: '1.9mm / 2.6mm / 3.9mm' },
      { label: 'Smart TVs 4K', value: '55", 65", 75" y 85" UHD' },
      { label: 'Frecuencia de Actualización', value: '3,840 Hz (Anti-flicker para cámaras)' },
      { label: 'Procesamiento', value: 'Novastar VX1000 / NovaPro UHD Jr 4K' }
    ],
    idealFor: [
      'Convenciones corporativas y congresos internacionales',
      'Stands para ferias comerciales y exposiciones',
      'Conferencias magistrales, asambleas y lanzamientos de marca'
    ]
  },
  {
    id: 'laptops-computadores',
    slug: 'laptops-computadores',
    title: 'Laptops y Computadores',
    shortDescription: 'Flotas de laptops corporativas de alto rendimiento, workstations y equipos All-in-One para capacitaciones y eventos.',
    fullDescription: 'Ofrecemos soluciones integrales de cómputo para empresas y eventos con flotas homogéneas de laptops profesionales (Dell Latitude/Precision, HP EliteBook, Lenovo ThinkPad y Apple MacBook Pro). Entregamos equipos completamente configurados, clonados con la imagen de software de su empresa, antivirus corporativo y soporte técnico inmediato.',
    category: 'Cómputo & TI',
    featuredImage: '/src/assets/images/service_laptops_fleet_1791695548071.jpg',
    gallery: [
      {
        url: '/src/assets/images/service_laptops_fleet_1791695548071.jpg',
        caption: 'Flota corporativa de laptops empresariales de alta gama'
      },
      {
        url: '/src/assets/images/service_web_development_1791695566277.jpg',
        caption: 'Estaciones de trabajo de alto rendimiento para desarrolladores y analistas'
      }
    ],
    video: {
      type: 'embed',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: '/src/assets/images/service_laptops_fleet_1791695548071.jpg',
      title: 'Proceso de clonación masiva y control de calidad de equipos de cómputo'
    },
    features: [
      'Procesadores Intel Core i5, i7, i9 de 12va/13va generación y Apple Silicon (M2/M3)',
      'Memoria RAM de 16GB a 64GB y unidades SSD NVMe ultrarrápidas',
      'Clonación masiva de software con el sistema operativo que requiera su evento',
      'Equipos de respaldo (hot-swap) incluidos en cada lote entregado'
    ],
    specs: [
      { label: 'Procesadores', value: 'Intel Core i5/i7/i9 (Gen 12-14) / Apple M2 Pro/Max' },
      { label: 'Memoria RAM', value: '16GB / 32GB / 64GB DDR5' },
      { label: 'Almacenamiento', value: '512GB a 2TB NVMe PCIe Gen 4' },
      { label: 'Pantallas', value: '14" / 15.6" / 16" FHD & QHD IPS Antirreflejo' }
    ],
    idealFor: [
      'Capacitaciones corporativas y entrenamientos intensivos',
      'Hackathons, bootcamps y certámenes de innovación tecnológica',
      'Salas de prensa y centros de acreditación de eventos'
    ]
  },
  {
    id: 'equipos-audiovisuales',
    slug: 'equipos-audiovisuales',
    title: 'Equipos Audiovisuales',
    shortDescription: 'Sistemas de sonido profesional, microfonía inalámbrica, consolas digitales, iluminación escénica y transmisión en vivo para conferencias y eventos.',
    fullDescription: 'Equipamiento audiovisual completo de estándar broadcast para conferencias, foros y eventos masivos. Incluye microfonía Shure/Sennheiser inalámbrica, sistemas de sonido line-array, consolas digitales Yamaha/Behringer, focos robóticos de iluminación y conmutación de video.',
    category: 'Audio & Iluminación',
    featuredImage: '/src/assets/images/service_audiovisual_equipment_1791766322136.jpg',
    gallery: [
      {
        url: '/src/assets/images/service_audiovisual_equipment_1791766322136.jpg',
        caption: 'Consola de mezcla digital y sistema de audio en vivo para eventos'
      },
      {
        url: '/src/assets/images/hero_tech_rental_stage_1791695531583.jpg',
        caption: 'Iluminación escénica y producción técnica integral'
      }
    ],
    video: {
      type: 'embed',
      src: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: '/src/assets/images/service_audiovisual_equipment_1791766322136.jpg',
      title: 'Configuración y prueba de sonido e iluminación profesional'
    },
    features: [
      'Microfonía de mano, corbateros y vinchas inalámbricas de largo alcance',
      'Consolas digitales de mezcla con procesamiento DSP para alta inteligibilidad de voz',
      'Iluminación para escenarios, reflectores perimetrales y cabezales móviles',
      'Ingenieros de sonido y operadores audiovisuales certificados durante el evento'
    ],
    specs: [
      { label: 'Marcas de Audio', value: 'Yamaha / Shure / JBL / Sennheiser' },
      { label: 'Canales de Mezcla', value: 'Hasta 32 canales digitales simultáneos' },
      { label: 'Iluminación', value: 'LED RGBW / Cabezales móviles Beam 7R' },
      { label: 'Soporte', value: 'Operador técnico presencial 100% garantizado' }
    ],
    idealFor: [
      'Asambleas corporativas y juntas de accionistas',
      'Lanzamientos de productos y cócteles institucionales',
      'Talleres interactivos y conferencias magistrales'
    ]
  },
  {
    id: 'tablets',
    slug: 'tablets',
    title: 'Tablets',
    shortDescription: 'Flotas de tablets iPad y Android de última generación con atriles y soportes antirrobo para acreditación, registro y encuestas en ferias y congresos.',
    fullDescription: 'Ponemos a su disposición lotes homogéneos de tablets Apple iPad y Samsung Galaxy Tab configuradas para recepción de asistentes, lectura de credenciales QR, encuestas interactivas o firma electrónica. Incluyen pedestales de piso de alta seguridad, fundas reforzadas y soporte técnico.',
    category: 'Móvil & Acreditación',
    featuredImage: '/src/assets/images/service_tablets_fleet_1791766331928.jpg',
    gallery: [
      {
        url: '/src/assets/images/service_tablets_fleet_1791766331928.jpg',
        caption: 'Mesa de acreditación con tablets y lectura de código QR'
      }
    ],
    video: {
      type: 'embed',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: '/src/assets/images/service_tablets_fleet_1791766331928.jpg',
      title: 'Operación de tablets en puntos de acceso y registro'
    },
    features: [
      'Modelos Apple iPad 10.2"/10.9" y Samsung Galaxy Tab de alto rendimiento',
      'Soportes metálicos con cerradura de seguridad y ángulo regulable',
      'Configuración en Modo Kiosco (bloqueo de aplicaciones no autorizadas)',
      'Batería de larga duración y cargadores múltiples incluidos'
    ],
    specs: [
      { label: 'Pantalla', value: '10.2" / 10.9" / 11" Retina & AMOLED' },
      { label: 'Sistemas Operativos', value: 'iPadOS 17+ / Android 13+' },
      { label: 'Conectividad', value: 'Wi-Fi 6 + opción chip 4G/5G LTE' },
      { label: 'Seguridad', value: 'Carcasas blindadas y cable de acero Kensington' }
    ],
    idealFor: [
      'Mesas de bienvenida y acreditación de congresos',
      'Encuestas de satisfacción y recojo de leads comerciales en ferias',
      'Capacitaciones con evaluaciones interactivas'
    ]
  },
  {
    id: 'impresoras-multifuncionales',
    slug: 'impresoras-multifuncionales',
    title: 'Impresoras Multifuncionales',
    shortDescription: 'Equipos láser de alta velocidad, escaneo duplex y copiado masivo. Suministros y tóner ilimitado con monitoreo continuo.',
    fullDescription: 'Garantice la continuidad operativa y la gestión documental de su oficina temporal, evento o proyecto con nuestras impresoras multifuncionales láser de alta demanda (Ricoh, HP LaserJet Enterprise, Canon y Xerox). Nuestro servicio incluye transporte, instalación en red y suministros de tóner ilimitados.',
    category: 'Impresión & Oficina',
    featuredImage: '/src/assets/images/service_printers_1791695556482.jpg',
    gallery: [
      {
        url: '/src/assets/images/service_printers_1791695556482.jpg',
        caption: 'Equipo multifuncional láser empresarial de alta velocidad'
      }
    ],
    video: {
      type: 'embed',
      src: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: '/src/assets/images/service_printers_1791695556482.jpg',
      title: 'Configuración en red e impresión confidencial de alta velocidad'
    },
    features: [
      'Velocidades de hasta 55 páginas por minuto en color y monocromo',
      'Alimentador automático de documentos a doble cara (RADF / SPDF)',
      'Conectividad Ethernet Gigabit, Wi-Fi seguro e impresión móvil',
      'Tóner y consumibles 100% cubiertos en el contrato de alquiler'
    ],
    specs: [
      { label: 'Velocidad de Impresión', value: '35 a 55 ppm (Páginas por minuto)' },
      { label: 'Resolución Óptica', value: '1,200 x 1,200 dpi de precisión láser' },
      { label: 'Formatos Soportados', value: 'A4, Carta, Oficio, A3 y Tabloide' }
    ],
    idealFor: [
      'Salas de redacción y centros de prensa en cumbres de gobierno',
      'Oficinas de obra, faenas mineras y plantas industriales temporales'
    ]
  },
  {
    id: 'desarrollo-web',
    slug: 'desarrollo-web',
    title: 'Desarrollo Web y Soluciones Digitales',
    shortDescription: 'Plataformas web corporativas, landing pages para eventos, sistemas de acreditación y aplicaciones web a medida.',
    fullDescription: 'Complementamos su infraestructura física con soluciones tecnológicas digitales de vanguardia. Diseñamos y desarrollamos plataformas web corporativas de alto rendimiento, sistemas de registro y acreditación con código QR para congresos, landing pages de captación con analítica avanzada e intranets empresariales.',
    category: 'Software & Digital',
    featuredImage: '/src/assets/images/service_web_development_1791695566277.jpg',
    gallery: [
      {
        url: '/src/assets/images/service_web_development_1791695566277.jpg',
        caption: 'Diseño y desarrollo de plataformas web con interfaces modernas'
      }
    ],
    video: {
      type: 'embed',
      src: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: '/src/assets/images/service_web_development_1791695566277.jpg',
      title: 'Desarrollo de sistemas de registro de eventos y paneles de control'
    },
    features: [
      'Desarrollo con tecnologías modernas: React, TypeScript, Next.js, Node.js y Tailwind CSS',
      'Sistemas de registro en línea, generación de credenciales y lectura QR para eventos',
      'Arquitectura segura en la nube (AWS / GCP / Cloudflare) con certificado SSL'
    ],
    specs: [
      { label: 'Frameworks', value: 'React / Next.js / Node.js / Express' },
      { label: 'Base de Datos', value: 'PostgreSQL / MongoDB / Firebase Firestore' },
      { label: 'Rendimiento', value: 'Core Web Vitals > 95/100 en Google PageSpeed' }
    ],
    idealFor: [
      'Empresas que requieren modernizar su portal web corporativo',
      'Eventos que necesitan plataforma de registro de asistentes y emisión de boletos'
    ]
  }
];

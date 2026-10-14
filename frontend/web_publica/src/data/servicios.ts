import { getServiceMedia } from './media';

export interface ServiceMedia {
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export interface ServiceItem {
  id: string;
  /** Nombre corto, el que se muestra como título del panel. */
  title: string;
  /** Etiqueta breve de familia, se usa como dato secundario. */
  category: string;
  fullDescription: string;
  /** Imagen de portada. Si se omite, se muestra un degradado plano. */
  featuredImage?: string;
  gallery: ServiceMedia[];
  features: string[];
  specs: { label: string; value: string }[];
  idealFor: string[];
}

export const SERVICIOS_DATA: ServiceItem[] = [
  {
    id: 'laptops-computadores',
    title: 'Laptops y computadoras',
    category: 'Cómputo',
    fullDescription:
      'Alquilamos y vendemos flotas de laptops y computadoras de escritorio Dell, HP, Lenovo y Apple. Entregamos cada equipo con el sistema operativo, el software y el antivirus configurados para su empresa, con soporte técnico inmediato durante todo el plazo.',
    ...getServiceMedia('laptops-computadores', 'Laptops y computadoras'),
    features: [
      'Procesadores Intel Core i5, i7, i9 y Apple Silicon (M2/M3)',
      'Memoria de 16 GB a 64 GB y almacenamiento SSD',
      'Windows 11 o macOS actualizado, con paquete Office si se solicita',
      'Antivirus corporativo y configuración de red incluidas',
    ],
    specs: [
      { label: 'Procesadores', value: 'Intel Core i5 / i7 / i9 y Apple M2 / M3' },
      { label: 'Memoria', value: '16 GB / 32 GB / 64 GB' },
      { label: 'Almacenamiento', value: '250 GB a 2 TB SSD' },
      { label: 'Pantallas', value: '14" / 15.6" / 16" FHD y QHD, o monitor 21.5"–27"' },
    ],
    idealFor: [
      'Capacitaciones y talleres corporativos',
      'Hackathons, bootcamps y certámenes',
      'Salas de prensa y centros de acreditación',
      'Oficinas y proyectos temporales',
    ],
  },
  {
    id: 'tablets',
    title: 'Tablets',
    category: 'Móvil',
    fullDescription:
      'Lotes homogéneos de tablets Apple, Samsung y Lenovo configuradas para recepción de asistentes, lectura de credenciales QR, encuestas interactivas o firma electrónica. Incluyen soportes de seguridad con cerradura, fundas reforzadas y cargadores múltiples.',
    ...getServiceMedia('tablets', 'Tablets'),
    features: [
      'Modelos Apple iPad, Samsung Galaxy Tab y Lenovo de alto rendimiento',
      'Soportes con cerradura de seguridad y ángulo regulable',
      'Batería de larga duración y cargadores múltiples incluidos',
      'Configuración de apps, formularios y perfiles de uso',
    ],
    specs: [
      { label: 'Pantalla', value: '10.2" / 10.9" / 11" Retina y AMOLED' },
      { label: 'Sistemas', value: 'iPadOS / Android / Windows' },
      { label: 'Conectividad', value: 'Wi-Fi 6 y opción 4G / 5G LTE' },
      { label: 'Seguridad', value: 'Carcasas de seguridad y cable reforzado' },
    ],
    idealFor: [
      'Mesas de bienvenida y acreditación de congresos',
      'Encuestas de satisfacción y captura de leads',
      'Capacitaciones con evaluaciones interactivas',
    ],
  },
  {
    id: 'impresoras-multifuncionales',
    title: 'Impresoras multifuncionales',
    category: 'Oficina',
    fullDescription:
      'Impresoras multifuncionales láser de alta demanda, en monocromo o color, dimensionadas según el volumen de la operación. Entregamos el equipo instalado en red, con tóner y suministros incluidos, para garantizar la continuidad documental de su oficina temporal o permanente.',
    ...getServiceMedia('impresoras-multifuncionales', 'Impresoras multifuncionales'),
    features: [
      'Equipos multifuncionales de alta velocidad, monocromo y color',
      'Alimentador automático de documentos a doble cara',
      'Conectividad de red, Wi-Fi e impresión móvil',
      'Instalación en red y suministros incluidos',
    ],
    specs: [
      { label: 'Velocidad', value: 'Alta velocidad, según modelo' },
      { label: 'Resolución', value: 'Alta resolución láser' },
      { label: 'Formatos', value: 'A4, oficio y hasta A3' },
      { label: 'Funciones', value: 'Impresión, copia, escaneo y fax' },
    ],
    idealFor: [
      'Oficinas y centros de documentación',
      'Salas de redacción y centros de prensa',
      'Oficinas de obra y faenas mineras temporales',
    ],
  },
  {
    id: 'proyectores',
    title: 'Proyectores',
    category: 'Visual',
    fullDescription:
      'Proyectores de alto brillo para auditorios, salas de capacitación, museos y eventos, seleccionados según el tamaño del espacio y las condiciones de luz. Entregamos el proyector con la pantalla o el muro de proyección, los cables y la configuración de la señal, además del operador técnico cuando el montaje lo exige.',
    ...getServiceMedia('proyectores', 'Proyectores'),
    features: [
      'Proyectores de alto brillo, láser y LCD, según el espacio',
      'Pantallas de trípode, eléctricas y muros de proyección',
      'Conversión y distribución de señal HDMI, SDI y VGA',
      'Alineación y calibración en sitio antes de cada evento',
    ],
    specs: [
      { label: 'Luminosidad', value: 'Alta luminosidad, según modelo' },
      { label: 'Resolución', value: 'Full HD y 4K' },
      { label: 'Tecnología', value: 'Láser y LCD' },
      { label: 'Proyección', value: 'Tiro largo y tiro corto' },
    ],
    idealFor: [
      'Auditorios y salas de capacitación',
      'Museos, ferias y activaciones',
      'Aulas y salas de reunión',
    ],
  },
  {
    id: 'equipos-audiovisuales',
    title: 'Equipos audiovisuales',
    category: 'Audio',
    fullDescription:
      'Equipamiento audiovisual completo para conferencias, foros y eventos masivos. Incluye microfonía inalámbrica, sistemas de sonido, consolas digitales, iluminación escénica y conmutación de video, dimensionado según el aforo y el tipo de evento, con operador técnico presencial.',
    ...getServiceMedia('equipos-audiovisuales', 'Equipos audiovisuales'),
    features: [
      'Microfonía de mano, corbateros y vinchas inalámbricas de largo alcance',
      'Consolas digitales con procesamiento para alta inteligibilidad',
      'Iluminación de escenario, reflectores y cabezales móviles',
      'Conmutación y transmisión de video para eventos híbridos',
    ],
    specs: [
      { label: 'Audio', value: 'Sonido profesional y microfonía inalámbrica' },
      { label: 'Mezcla', value: 'Consolas digitales, según requerimiento' },
      { label: 'Iluminación', value: 'Iluminación LED y cabezales móviles' },
      { label: 'Soporte', value: 'Operador técnico presencial incluido' },
    ],
    idealFor: [
      'Asambleas corporativas y juntas de accionistas',
      'Lanzamientos de producto y cócteles institucionales',
      'Conferencias magistrales y eventos híbridos',
    ],
  },
  {
    id: 'totems-digitales',
    title: 'Tótems digitales',
    category: 'Visual',
    fullDescription:
      'Tótems digitales táctiles y de señalización para atención al público, registro de visitantes, encuestas y catálogos. Se entregan configurados con su contenido, con pedestal de piso o de mesa, y conectados a su red o con conectividad propia.',
    ...getServiceMedia('totems-digitales', 'Tótems digitales'),
    features: [
      'Pantallas táctiles capacitivas de 43" a 55" con marco delgado',
      'Contenido de señalización, encuestas, fichas y directorios',
      'Pedestal de piso o de mesa con cómputo integrado',
      'Gestión remota del contenido y actualizaciones programadas',
    ],
    specs: [
      { label: 'Pantalla', value: '43" / 49" / 55" táctil capacitiva' },
      { label: 'Resolución', value: 'Full HD 1080p' },
      { label: 'Formato', value: 'Tótem de piso y de mesa' },
      { label: 'Conectividad', value: 'Wi-Fi, Ethernet y reproductor integrado' },
    ],
    idealFor: [
      'Registro y acreditación de visitantes',
      'Ferias y activaciones de marca',
      'Catálogos y directorios en oficinas',
    ],
  },
  {
    id: 'pantallas-led',
    title: 'Pantallas LED y televisores',
    category: 'Visual',
    fullDescription:
      'Visualización LED de última generación para congresos, ferias internacionales, lanzamientos y escenarios multitudinarios, en formatos indoor y outdoor según el espacio. También ofrecemos televisores Smart 4K con pedestales y soportes profesionales para stands y salas de reuniones.',
    ...getServiceMedia('pantallas-led', 'Pantallas LED y televisores'),
    features: [
      'Módulos LED indoor y outdoor de alto brillo y cambio rápido',
      'Televisores Smart 4K con pedestales de altura regulable',
      'Procesadores de video 4K HDR con conmutación sin latencia',
      'Redundancia de señal para montajes críticos',
    ],
    specs: [
      { label: 'Pantalla LED', value: 'Alta resolución, indoor y outdoor' },
      { label: 'Televisores', value: 'Smart 4K, según tamaño requerido' },
      { label: 'Refresco', value: 'Alto refresco, según modelo' },
      { label: 'Procesamiento', value: 'Procesadores 4K HDR' },
    ],
    idealFor: [
      'Convenciones corporativas y congresos internacionales',
      'Ferias comerciales y stands',
      'Conferencias magistrales y asambleas',
      'Lanzamientos de marca',
    ],
  },
  {
    id: 'desarrollo-web',
    title: 'Desarrollo web y soluciones digitales',
    category: 'Digital',
    fullDescription:
      'Complementamos su infraestructura física con soluciones digitales. Diseñamos plataformas web corporativas, sistemas de registro y acreditación con código QR para congresos, landing pages de captación con analítica e intranets empresariales.',
    ...getServiceMedia('desarrollo-web', 'Desarrollo web'),
    features: [
      'Desarrollo con React, TypeScript, Next.js, Node.js y Tailwind CSS',
      'Sistemas de registro en línea, credenciales y lectura QR',
      'Plataformas de logística e inventario a medida',
      'Arquitectura segura en la nube con certificado SSL',
    ],
    specs: [
      { label: 'Stack', value: 'React / Next.js / Node.js / Express' },
      { label: 'Bases de datos', value: 'PostgreSQL / MySQL / MongoDB' },
      { label: 'Rendimiento', value: 'Core Web Vitals sobre 95/100 en PageSpeed' },
      { label: 'Entrega', value: 'Repositorio propio y soporte post-lanzamiento' },
    ],
    idealFor: [
      'Empresas y mipymes que modernizan su portal corporativo',
      'Eventos con registro de asistentes y emisión de boletos',
      'Operaciones que requieren logística e inventario a medida',
    ],
  },
];

import { SITE, asset } from '@/config/site';

export interface MetricItem {
  id: string;
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  description: string;
  iconName: 'calendar' | 'award' | 'users' | 'cpu' | 'mapPin' | 'globe';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Alquiler' | 'Logística' | 'Soporte' | 'Comercial';
}

export interface ClientItem {
  id: string;
  name: string;
  industry: string;
  logoText: string;
}

export interface ContactInfo {
  phones: {
    display: string;
    raw: string;
    type: 'fijo' | 'movil';
    isWhatsApp?: boolean;
  }[];
  email: string;
  address: {
    street: string;
    district: string;
    postalCode: string;
    country: string;
    full: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
  };
  schedule: {
    weekdays: string;
    saturdays: string;
  };
}

export const HERO_MEDIA = {
  video: asset('assets/pantallas-led/hero_video.mp4'),
  poster: asset('assets/pantallas-led/2.png'),
};

export const HERO_ROTATING_WORDS = [
  'Pantallas LED Gigantes',
  'Laptops y Computadoras',
  'Tablets',
  'Impresoras Multifuncionales',
  'Desarrollo Web & Apps',
];

export const METRICAS_DATA: MetricItem[] = [
  {
    id: 'anios',
    value: 12,
    prefix: '+',
    suffix: '',
    label: 'Años de Experiencia',
    description: 'Liderando el mercado corporativo con soluciones tecnológicas de vanguardia.',
    iconName: 'calendar',
  },
  {
    id: 'eventos',
    value: 2500,
    prefix: '+',
    suffix: '',
    label: 'Eventos Atendidos',
    description: 'Congresos, cumbres internacionales, foros de minería, ferias y asambleas.',
    iconName: 'award',
  },
  {
    id: 'clientes',
    value: 980,
    prefix: '+',
    suffix: '',
    label: 'Clientes Satisfechos',
    description: 'Empresas multinacionales, organismos públicos, agencias y productoras líderes.',
    iconName: 'users',
  },
  {
    id: 'equipos',
    value: 15000,
    prefix: '+',
    suffix: '',
    label: 'Equipos Disponibles',
    description: 'Stock propio permanente y renovado con marcas de primera línea tecnológica.',
    iconName: 'cpu',
  },
  {
    id: 'cobertura-nacional',
    value: 24,
    prefix: '',
    suffix: ' Regiones',
    label: 'Cobertura en Todo el Perú',
    description: 'Despliegue logístico y técnico directo de costa, sierra y selva.',
    iconName: 'mapPin',
  },
];

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Alquiler',
    question: '¿Cómo funciona el servicio de alquiler de equipos tecnológicos?',
    answer:
      'El proceso es ágil y seguro: 1) Nos envía su requerimiento indicando cantidad de equipos, fechas y lugar del evento; 2) Emitimos una cotización formal detallada en menos de 2 horas; 3) Confirmada la orden, preparamos, clonamos y testeamos cada equipo en nuestro laboratorio técnico; 4) Trasladamos, instalamos y dejamos los equipos 100% operativos antes de iniciar su actividad con personal técnico especializado.',
  },
  {
    id: 'faq-2',
    category: 'Logística',
    question: '¿Cuáles son los tiempos de entrega y disponibilidad de equipos?',
    answer:
      'Para Lima Metropolitana contamos con entregas programadas en 24 a 48 horas y un servicio exprés para emergencias de eventos en menos de 6 horas. Para provincias en el interior del Perú, coordinamos despachos vía aérea o terrestre consolidada en 48 a 72 horas con embalaje industrial flight-case de máxima protección.',
  },
  {
    id: 'faq-3',
    category: 'Logística',
    question: '¿Tienen cobertura a nivel nacional e internacional?',
    answer:
      'Sí. Contamos con logística propia para operar en las 24 regiones del Perú (Lima, Arequipa, Cusco, Trujillo, Piura, Chiclayo, Huancayo, Loreto, etc.). Asimismo, brindamos respaldo operativo y soporte técnico para proyectos y misiones corporativas en países de la región (Chile, Colombia, Ecuador, Bolivia) mediante gestión de internamiento temporal.',
  },
  {
    id: 'faq-4',
    category: 'Soporte',
    question: '¿Incluyen soporte técnico presencial durante la realización del evento?',
    answer:
      'Totalmente. Para pantallas LED, redes temporales y lotes mayores de cómputo asignamos operadores y técnicos residentes certificados durante toda la duración de su evento. Además, incluimos equipos de respaldo "hot-swap" (laptops e interfaces de video en standby) para garantizar continuidad absoluta y cero tiempo de inactividad.',
  },
  {
    id: 'faq-5',
    category: 'Comercial',
    question: '¿Cuáles son las formas de pago y condiciones comerciales?',
    answer:
      'Trabajamos con Factura Comercial electrónica y aceptamos transferencias bancarias directas, tarjetas corporativas de crédito o débito, y pagos internacionales en USD vía transferencias SWIFT. Para clientes corporativos frecuentes o contratos recurrentes ofrecemos líneas de crédito a 15 y 30 días previa evaluación crediticia.',
  },
  {
    id: 'faq-6',
    category: 'Comercial',
    question: '¿Cuál es la diferencia entre el alquiler y la venta con opción a compra?',
    answer:
      'El alquiler tradicional es 100% deducible como gasto operativo (OPEX) y le libera de costos de mantenimiento, depreciación o actualización tecnológica. La venta con opción a compra (Leasing Operativo) le permite utilizar los equipos durante un período contractual (ej. 12 a 24 meses) y luego adquirirlos por un valor residual pactado o renovarlos por modelos de última generación.',
  },
  {
    id: 'faq-7',
    category: 'Alquiler',
    question: '¿Qué requisitos se necesitan para solicitar una cotización formal?',
    answer:
      'Únicamente requerimos: Razón Social o RUC de su empresa/institución, nombre del contacto responsable, teléfono corporativo, fecha estimada de inicio y fin del servicio, ciudad/locación del evento, y la lista aproximada de equipos requeridos. Puede solicitarla directamente mediante nuestro formulario en línea o vía WhatsApp directo.',
  },
  {
    id: 'faq-8',
    category: 'Soporte',
    question: '¿Las laptops e impresoras vienen con software instalado y configurado?',
    answer:
      'Sí. Todas las laptops se entregan con Windows 11 Pro o macOS actualizado, licencia de Microsoft Office/365 si se solicita, antivirus corporativo y configuración de red. Si su empresa requiere una imagen de disco específica (software contable, navegadores con certificados, herramientas de evaluación o CRM), la clonamos masivamente sin costo adicional previo envío de la plantilla.',
  },
];

export const CLIENTES_LOGOS: ClientItem[] = [
  { id: 'c1', name: 'BBVA Continental', industry: 'Banca & Finanzas', logoText: 'BBVA' },
  { id: 'c2', name: 'Antamina', industry: 'Minería & Energía', logoText: 'ANTAMINA' },
  { id: 'c3', name: 'Intercorp', industry: 'Retail & Servicios', logoText: 'INTERCORP' },
  { id: 'c4', name: 'Ferreycorp', industry: 'Maquinaria Pesada', logoText: 'FERREYCORP' },
  { id: 'c5', name: 'Universidad de Lima', industry: 'Educación Superior', logoText: 'U. DE LIMA' },
  { id: 'c6', name: 'Alicorp', industry: 'Consumo Masivo', logoText: 'ALICORP' },
  { id: 'c7', name: 'Rimac Seguros', industry: 'Seguros & Salud', logoText: 'RIMAC' },
  { id: 'c8', name: 'Telefónica Tech', industry: 'Telecomunicaciones', logoText: 'TELEFÓNICA' },
  { id: 'c9', name: 'Sociedad Nacional de Minería', industry: 'Gremios & Eventos', logoText: 'SNMPE' },
  { id: 'c10', name: 'Cámara de Comercio de Lima', industry: 'Comercio Exterior', logoText: 'CCL' },
  { id: 'c11', name: 'KPMG Perú', industry: 'Auditoría & Consultoría', logoText: 'KPMG' },
  { id: 'c12', name: 'Scotiabank', industry: 'Servicios Financieros', logoText: 'SCOTIABANK' },
];

export const CONTACTO_INFO: ContactInfo = {
  phones: [
    { display: SITE.phoneDisplay, raw: `+${SITE.whatsappNumber}`, type: 'movil', isWhatsApp: true },
  ],
  email: SITE.email,
  address: {
    street: 'Av. Húsares de Junín 527',
    district: 'Jesús María',
    postalCode: '15072',
    country: 'Perú',
    full: 'Av. Húsares de Junín 527, Jesús María 15072, Lima',
  },
  social: {
    facebook: 'https://facebook.com/adglobalperu',
    instagram: 'https://www.instagram.com/adglobals/',
    linkedin: 'https://linkedin.com/company/adglobalperu',
    tiktok: 'https://www.tiktok.com/@adglobals',
  },
  schedule: {
    weekdays: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
    saturdays: 'Sábados: 9:00 AM - 1:00 PM',
  },
};

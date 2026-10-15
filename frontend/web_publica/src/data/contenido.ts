/* ---------------------------------------------------------------------------
   Textos del sitio. Todo lo que se ve en pantalla vive aquí o en servicios.ts.
   --------------------------------------------------------------------------- */

export const HERO = {
  headline: 'Potencia tu empresa con tecnología de punta',
  /** Frases de la línea principal que llevan el subrayado animado. */
  highlights: ['tecnología de punta'],
  supporting:
    'Alquiler y venta de equipos de cómputo, audiovisuales y desarrollo web para empresas, con soporte técnico propio en todo el Perú y Colombia. Respaldados por +10 años de experiencia.',
  action: 'Pedir cotización',
} as const;

export const ABOUT = {
  heading: 'Quiénes somos',
  statement: 'Alquilamos y vendemos equipos de cómputo y audiovisuales, con soporte técnico propio.',
  description:
    'Somos una corporación especializada en el arrendamiento de equipos informáticos y audiovisuales, mantenimiento, soporte técnico y proyectos a medida. Contamos con un equipo calificado de ingenieros y técnicos que garantizan la máxima calidad y la continuidad operativa de tu empresa.',
  mission: {
    title: 'Misión',
    text: 'Brindar soluciones tecnológicas de calidad, eficientes y flexibles en el arrendamiento de equipos de cómputo y audiovisuales, que garanticen la operatividad y la productividad de nuestros clientes.',
  },
  vision: {
    title: 'Visión',
    text: 'Ser una empresa líder en el arrendamiento de equipos tecnológicos de vanguardia y soluciones integrales competitivas, que contribuyan al crecimiento y la productividad de las empresas del Perú.',
  },
} as const;

export const VENTAJAS: { title: string; text: string }[] = [
  {
    title: 'Alquiler de equipos',
    text: 'Cómputo y audiovisuales por día, por mes o por proyecto, sin inversión inicial ni depreciación.',
  },
  {
    title: 'Venta de equipos',
    text: 'Equipos nuevos de las marcas líderes, con garantía y respaldo técnico.',
  },
  {
    title: 'Soporte y mantenimiento',
    text: 'Ingenieros y técnicos propios, con reemplazo inmediato ante cualquier falla.',
  },
  {
    title: 'Licencias Microsoft',
    text: 'Licenciamiento Microsoft 365 y Windows para su operación completa.',
  },
  {
    title: 'Proyectos a medida',
    text: 'Desarrollo de software, sistemas de registro y redes para su evento u operación.',
  },
];

export const PARTNERS: string[] = [
  'HP',
  'Dell',
  'Lenovo',
  'Asus',
  'Microsoft',
  'Deltron',
  'Brother',
  'LG',
  'Teros',
  'Samsung',
  'Canon',
];

export const INDUSTRIAS = [
  'Corporativos',
  'Estatales',
  'Minería',
  'Universidades',
  'Retail',
  'CPG',
  'Energía',
  'Consultoría',
  'Automotriz',
  'Manufactura',
  'Telecomunicaciones',
  'Servicios',
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Cómo alquilo equipos con AD GLOBAL?',
    answer:
      'Nos envías tu requerimiento con las cantidades, las fechas y la ciudad. En menos de 2 horas recibes una cotización formal. Confirmada la orden, preparamos los equipos, los trasladamos, los instalamos y los dejamos operativos.',
  },
  {
    id: 'faq-2',
    question: '¿Tienen cobertura fuera de Lima?',
    answer:
      'Sí. Operamos en las 24 regiones del Perú y atendemos proyectos en Colombia, con despacho aéreo o terrestre según la ciudad.',
  },
  {
    id: 'faq-3',
    question: '¿Qué incluye el servicio de alquiler?',
    answer:
      'Entrega, instalación, configuración, soporte técnico durante todo el plazo y equipos de reemplazo ante cualquier falla.',
  },
  {
    id: 'faq-4',
    question: '¿Venden equipos o solo alquilan?',
    answer:
      'Ambas cosas. Alquilamos y vendemos equipos de cómputo y audiovisuales, licencias Microsoft y proyectos de software a medida.',
  },
  {
    id: 'faq-5',
    question: '¿Qué necesito para pedir una cotización?',
    answer:
      'La razón social o el RUC, un contacto responsable, la ciudad, las fechas estimadas y la lista aproximada de equipos.',
  },
];

export interface ContactInfo {
  address: { full: string };
  social: { facebook: string; instagram: string; linkedin: string; tiktok: string };
  schedule: { weekdays: string; saturdays: string };
}

export const CONTACTO_INFO: ContactInfo = {
  address: {
    full: 'Av. Húsares de Junín 527, Jesús María 15072, Lima',
  },
  social: {
    facebook: 'https://www.facebook.com/people/AD-Global/61566838716640/',
    instagram: 'https://www.instagram.com/adglobals/',
    linkedin: 'https://linkedin.com/company/adglobalperu',
    tiktok: 'https://www.tiktok.com/@adglobals',
  },
  schedule: {
    weekdays: 'Lunes a viernes, 9:00 – 18:00',
    saturdays: 'Sábados, 9:00 – 13:00',
  },
};

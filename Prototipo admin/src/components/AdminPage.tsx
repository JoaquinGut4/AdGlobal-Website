import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Laptop,
  Monitor,
  Tablet,
  Volume2,
  Printer,
  ChevronRight,
  ChevronDown,
  Bell,
  Settings,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  DollarSign,
  Users,
  Activity,
  Layers,
  BarChart3,
  CheckSquare,
  FileSpreadsheet,
  Package,
  Sliders,
  Filter,
  Download,
  Info,
  Truck,
  Building2,
  Wrench,
  List,
  ChevronUp,
  X,
  Tag,
  Phone,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { AdGlobalLogo } from './AdGlobalLogo';
import { SERVICIOS_DATA } from '../data/servicios';

interface AdminPageProps {
  onBackToHome: () => void;
}

interface StoredQuote {
  id: string;
  nombre: string;
  empresa: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fechas: string;
  ciudad: string;
  mensaje: string;
  createdAt: string;
  status: 'pendiente' | 'atendido';
}

const DEFAULT_QUOTES: StoredQuote[] = [
  {
    id: 'cot-101',
    nombre: 'Valeria Salas',
    empresa: 'Corporación Minera del Sur',
    correo: 'vsalas@minsurcorp.pe',
    telefono: '+51 987 112 345',
    servicioId: 'pantallas-led',
    fechas: '18 al 22 de Noviembre',
    ciudad: 'Arequipa',
    mensaje: 'Requerimos 2 muros LED P2.6 de 6x3.5m con procesadores Novastar 4K y soporte técnico residente para asamblea anual.',
    createdAt: 'Hoy, 09:42 AM',
    status: 'pendiente'
  },
  {
    id: 'cot-102',
    nombre: 'Jorge Benavides',
    empresa: 'Banco de Crédito BCP',
    correo: 'jbenavides@bcp.com.pe',
    telefono: '+51 993 456 789',
    servicioId: 'laptops-computadores',
    fechas: '01 al 15 de Diciembre',
    ciudad: 'Lima - San Isidro',
    mensaje: 'Lote de 45 laptops Core i7 con 32GB RAM y Windows 11 Enterprise para capacitación nacional de analistas de riesgo.',
    createdAt: 'Hoy, 08:15 AM',
    status: 'atendido'
  },
  {
    id: 'cot-103',
    nombre: 'Lucía Montenegro',
    empresa: 'Productora Live Events SAC',
    correo: 'lucia@liveevents.pe',
    telefono: '+51 912 345 678',
    servicioId: 'tablets',
    fechas: '25 de Noviembre',
    ciudad: 'Lima - Jockey Plaza',
    mensaje: '30 tablets iPad 10.9" con atriles metálicos de piso y cerradura antirrobo para acreditación y check-in QR en feria comercial.',
    createdAt: 'Ayer, 04:30 PM',
    status: 'pendiente'
  }
];

export interface SupportTicket {
  id: string;
  codigo: string;
  area: 'Soporte In-Situ' | 'Reparación Taller' | 'Mantenimiento Preventivo' | 'Cambio Express';
  equipo: string;
  cliente: string;
  prioridad: 'Urgente' | 'Alta' | 'Media' | 'Baja';
  estado: 'Abierto' | 'En Diagnóstico' | 'En Reparación' | 'Resuelto';
  descripcion: string;
  tecnico: string;
  fecha: string;
}

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-01',
    codigo: 'TKT-2025-014',
    area: 'Reparación Taller',
    equipo: 'Laptop ThinkPad T14 (Serie: TP-2024-883)',
    cliente: 'Banco de Crédito BCP',
    prioridad: 'Alta',
    estado: 'En Diagnóstico',
    descripcion: 'Falla en conector USB-C Thunderbolt tras evento en auditorio. Requiere prueba de placa y cambio de módulo.',
    tecnico: 'Ing. Carlos Mendoza (Taller Central)',
    fecha: 'Hoy, 10:15 AM'
  },
  {
    id: 'tkt-02',
    codigo: 'TKT-2025-015',
    area: 'Soporte In-Situ',
    equipo: 'Pantalla LED P2.6 Módulo C3',
    cliente: 'Corporación Minera del Sur',
    prioridad: 'Urgente',
    estado: 'Abierto',
    descripcion: 'Píxel muerto en módulo central C3 para convención minera. Despacho de técnico con repuesto de recambio express.',
    tecnico: 'Téc. Miguel Alva (Soporte Campo)',
    fecha: 'Hoy, 09:30 AM'
  },
  {
    id: 'tkt-03',
    codigo: 'TKT-2025-016',
    area: 'Mantenimiento Preventivo',
    equipo: 'Sistema Line Array RCF (2 Subwoofers)',
    cliente: 'Productora Live Events SAC',
    prioridad: 'Media',
    estado: 'En Reparación',
    descripcion: 'Calibración acústica de crossovers y limpieza de filtros tras festival.',
    tecnico: 'Téc. Fernando Ruiz (Audio LAB)',
    fecha: 'Ayer, 16:45 PM'
  }
];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  iconName: 'laptop' | 'monitor' | 'tablet' | 'volume' | 'printer' | 'package';
  specs: string;
  total: number;
  unit: string;
  alquiler: number;
  oficina: number;
  taller: number;
  dispPercent: number;
  statusText: string;
  ubicacionOficina: string;
  proyectosAlquiler: string;
  diagnosticoTaller: string;
}

const INVENTORY_DATA: InventoryItem[] = [
  {
    id: 'laptops',
    name: 'Laptops & Cómputo Corporativo',
    category: 'Portátiles & Estaciones',
    iconName: 'laptop',
    specs: 'Dell Latitude 5420/5430 Core i5/i7, Lenovo ThinkPad T14s y Apple MacBook Pro M2/M3.',
    total: 335,
    unit: 'equipos',
    alquiler: 245,
    oficina: 75,
    taller: 15,
    dispPercent: 88,
    statusText: 'Alta rotación',
    ubicacionOficina: 'Almacén Central · Bahía B1 y B2',
    proyectosAlquiler: '38 proyectos activos (Minera Chinalco, BCP, CADE Ejecutivos, Interbank)',
    diagnosticoTaller: '10 mant. preventivo y optimización de SO, 5 recambio de batería'
  },
  {
    id: 'pantallas',
    name: 'Pantallas LED & Smart TVs 4K',
    category: 'Displays & Video Wall',
    iconName: 'monitor',
    specs: 'Módulos LED P1.9, P2.6, P3.9 Novastar 4K y TVs Smart 55"-85" de alta luminosidad.',
    total: 98,
    unit: 'm² / pantallas',
    alquiler: 68,
    oficina: 26,
    taller: 4,
    dispPercent: 95,
    statusText: 'Óptima disponibilidad',
    ubicacionOficina: 'Almacén Central · Rack Modular R1',
    proyectosAlquiler: 'Feria Minera PERUMIN (45m²), Jockey Plaza Expotech (23m²)',
    diagnosticoTaller: '4 calibración cromática y reemplazo de módulo receptor'
  },
  {
    id: 'tablets',
    name: 'Tablets & Atriles Antirrobo',
    category: 'Terminales & Movilidad',
    iconName: 'tablet',
    specs: 'iPad 10.2"/10.9" Retina y Samsung Galaxy Tab S8 con atriles metálicos antirrobo.',
    total: 94,
    unit: 'equipos',
    alquiler: 65,
    oficina: 25,
    taller: 4,
    dispPercent: 92,
    statusText: 'Alta demanda en eventos',
    ubicacionOficina: 'Almacén Central · Bahía T3',
    proyectosAlquiler: 'Acreditación Congreso Médico (40 uds), Encuestas de Satisfacción BCP (25 uds)',
    diagnosticoTaller: '4 sustitución de vidrio templado y actualización de MDM'
  },
  {
    id: 'audiovisuales',
    name: 'Equipos Audiovisuales & Sonido Pro',
    category: 'Audio & Microfonía',
    iconName: 'volume',
    specs: 'Microfonía inalámbrica Shure Axient/ULX-D, consolas digitales Yamaha y cabezas robóticas.',
    total: 18,
    unit: 'sets completos',
    alquiler: 12,
    oficina: 5,
    taller: 1,
    dispPercent: 94,
    statusText: 'Operatividad óptima',
    ubicacionOficina: 'Almacén Central · Flight Cases Zona A',
    proyectosAlquiler: 'Summit Telecomunicaciones Claro (6 sets), Plenaria Hotel Westin (6 sets)',
    diagnosticoTaller: '1 mantenimiento de conector XLR en consola'
  },
  {
    id: 'multifuncionales',
    name: 'Multifuncionales Láser de Alta Velocidad',
    category: 'Ofimática & Impresión',
    iconName: 'printer',
    specs: 'Impresoras Ricoh IM C3000 y HP Enterprise láser de 45-55 ppm con tóner ilimitado.',
    total: 23,
    unit: 'equipos',
    alquiler: 14,
    oficina: 7,
    taller: 2,
    dispPercent: 85,
    statusText: 'En servicio continuo',
    ubicacionOficina: 'Almacén Central · Bahía P1',
    proyectosAlquiler: 'Centro de Cómputo Elecciones (10 uds), Auditoría Corporativa PwC (4 uds)',
    diagnosticoTaller: '2 reemplazo de rodillo fusor y limpieza óptica'
  },
  {
    id: 'networking',
    name: 'Servidores & Redes de Alta Densidad',
    category: 'Infraestructura & Conectividad',
    iconName: 'package',
    specs: 'Routers Cisco Catalyst, Switches Gigabit PoE 48p y Access Points Wi-Fi 6 Ubiquiti UniFi.',
    total: 12,
    unit: 'racks / kits',
    alquiler: 8,
    oficina: 4,
    taller: 0,
    dispPercent: 100,
    statusText: '100% Disponible',
    ubicacionOficina: 'Almacén Central · Rack Comunicaciones C1',
    proyectosAlquiler: 'Red Temporal Centro Convenciones (6 kits), Respaldo Red Minera (2 kits)',
    diagnosticoTaller: 'Sin equipos en taller (100% operativos)'
  }
];

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('adglobal_admin_auth') === 'true';
  });

  const [corporateEmail, setCorporateEmail] = useState('admin@adglobalperu.com');
  const [username, setUsername] = useState('adglobal_admin');
  const [password, setPassword] = useState('admin2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active navigation section inside Admin Dashboard
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'quotes' | 'inventory' | 'presupuestos' | 'clientes' | 'configuracion' | 'tickets'
  >('dashboard');

  const [quotesList, setQuotesList] = useState<StoredQuote[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);

  // Modales de Apertura
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulario nuevo Ticket
  const [ticketArea, setTicketArea] = useState<SupportTicket['area']>('Reparación Taller');
  const [ticketEquipo, setTicketEquipo] = useState('');
  const [ticketCliente, setTicketCliente] = useState('');
  const [ticketPrioridad, setTicketPrioridad] = useState<SupportTicket['prioridad']>('Alta');
  const [ticketTecnico, setTicketTecnico] = useState('Ing. Carlos Mendoza (Taller Central)');
  const [ticketDescripcion, setTicketDescripcion] = useState('');

  // Formulario nueva Cotización
  const [quoteEmpresa, setQuoteEmpresa] = useState('');
  const [quoteNombre, setQuoteNombre] = useState('');
  const [quoteCorreo, setQuoteCorreo] = useState('');
  const [quoteTelefono, setQuoteTelefono] = useState('');
  const [quoteServicio, setQuoteServicio] = useState('laptops-computadores');
  const [quoteCiudad, setQuoteCiudad] = useState('Lima');
  const [quoteFechas, setQuoteFechas] = useState('');
  const [quoteMensaje, setQuoteMensaje] = useState('');

  // Filters & period selectors from mock
  const [selectedPeriod, setSelectedPeriod] = useState('Semestral');
  const [selectedSubTab, setSelectedSubTab] = useState<'mes' | 'semana' | 'trimestre'>('mes');

  // Estados para Control de Inventario
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'alquiler' | 'oficina' | 'taller'>('all');
  const [expandedInventoryId, setExpandedInventoryId] = useState<string | null>(null);

  // Load quotes and tickets from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('adglobal_quotes');
      if (raw) {
        const parsed = JSON.parse(raw);
        setQuotesList([...parsed, ...DEFAULT_QUOTES]);
      } else {
        setQuotesList(DEFAULT_QUOTES);
      }
    } catch {
      setQuotesList(DEFAULT_QUOTES);
    }

    try {
      const rawTickets = localStorage.getItem('adglobal_tickets');
      if (rawTickets) {
        setTicketsList(JSON.parse(rawTickets));
      } else {
        setTicketsList(DEFAULT_TICKETS);
      }
    } catch {
      setTicketsList(DEFAULT_TICKETS);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!corporateEmail.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('Todos los campos son obligatorios: Email corporativo, Usuario y Contraseña.');
      return;
    }

    if (!corporateEmail.includes('@') || !corporateEmail.includes('.')) {
      setErrorMessage('Por favor ingrese un email corporativo válido (ej. admin@adglobalperu.com).');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (password.length >= 4) {
        setIsAuthenticated(true);
        if (rememberMe) {
          localStorage.setItem('adglobal_admin_auth', 'true');
        }
      } else {
        setErrorMessage('Credenciales inválidas. (Demo: admin2025)');
      }
    }, 600);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adglobal_admin_auth');
  };

  const toggleQuoteStatus = (id: string) => {
    setQuotesList((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: q.status === 'pendiente' ? 'atendido' : 'pendiente' }
          : q
      )
    );
  };

  const toggleTicketStatus = (id: string) => {
    setTicketsList((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextEstado: SupportTicket['estado'] =
            t.estado === 'Abierto'
              ? 'En Diagnóstico'
              : t.estado === 'En Diagnóstico'
              ? 'En Reparación'
              : t.estado === 'En Reparación'
              ? 'Resuelto'
              : 'Abierto';
          return { ...t, estado: nextEstado };
        }
        return t;
      });
      try {
        localStorage.setItem('adglobal_tickets', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEquipo.trim() || !ticketCliente.trim() || !ticketDescripcion.trim()) return;

    const nextNum = ticketsList.length + 15;
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      codigo: `TKT-2025-0${nextNum}`,
      area: ticketArea,
      equipo: ticketEquipo.trim(),
      cliente: ticketCliente.trim(),
      prioridad: ticketPrioridad,
      estado: 'Abierto',
      descripcion: ticketDescripcion.trim(),
      tecnico: ticketTecnico,
      fecha: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newTicket, ...ticketsList];
    setTicketsList(updated);
    try {
      localStorage.setItem('adglobal_tickets', JSON.stringify(updated));
    } catch {}

    setTicketEquipo('');
    setTicketCliente('');
    setTicketDescripcion('');
    setIsTicketModalOpen(false);

    setToastMessage(`Ticket #${newTicket.codigo} aperturado con éxito para ${newTicket.area}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteEmpresa.trim() || !quoteNombre.trim() || !quoteCorreo.trim()) return;

    const newQuote: StoredQuote = {
      id: `cot-${Date.now().toString().slice(-4)}`,
      nombre: quoteNombre.trim(),
      empresa: quoteEmpresa.trim(),
      correo: quoteCorreo.trim(),
      telefono: quoteTelefono.trim() || '+51 900 000 000',
      servicioId: quoteServicio,
      fechas: quoteFechas.trim() || 'Próximos días',
      ciudad: quoteCiudad.trim() || 'Lima',
      mensaje: quoteMensaje.trim() || 'Apertura directa de cotización desde panel administrativo.',
      createdAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pendiente'
    };

    const updated = [newQuote, ...quotesList];
    setQuotesList(updated);
    try {
      localStorage.setItem('adglobal_quotes', JSON.stringify(updated));
    } catch {}

    setQuoteEmpresa('');
    setQuoteNombre('');
    setQuoteCorreo('');
    setQuoteTelefono('');
    setQuoteFechas('');
    setQuoteMensaje('');
    setIsQuoteModalOpen(false);

    setToastMessage(`Cotización aperturada exitosamente para ${newQuote.empresa}.`);
    setTimeout(() => setToastMessage(null), 4000);
    setActiveNav('quotes');
  };

  // Selector de periodo para estadísticas de Alquiler vs Ventas: 'semana' | 'mes' | 'año'
  const [statsPeriod, setStatsPeriod] = useState<'semana' | 'mes' | 'año'>('mes');
  // Filtro de tipo en el gráfico: 'todos' (ambos) | 'alquiler' | 'ventas'
  const [chartTypeFilter, setChartTypeFilter] = useState<'todos' | 'alquiler' | 'ventas'>('todos');

  // Datos del diagrama de barras por Semana, Mensual y Año para equipos en alquiler y ventas
  const chartDataByPeriod: Record<
    'semana' | 'mes' | 'año',
    {
      title: string;
      subtitle: string;
      periodLabel: string;
      maxVal: number;
      items: {
        label: string;
        sublabel?: string;
        alquiler: number;
        ventas: number;
        equiposAlquiler: string;
        equiposVenta: string;
      }[];
      resumen: {
        totalAlquiler: number;
        totalVentas: number;
        promedioAlquiler: number;
        promedioVentas: number;
      };
    }
  > = {
    semana: {
      title: 'Equipos en Alquiler vs Ventas por Semana',
      subtitle: 'Flujo operativo semanal (últimas 6 semanas activas)',
      periodLabel: 'Semana',
      maxVal: 150,
      items: [
        {
          label: 'Sem 36',
          sublabel: '01-07 Sep',
          alquiler: 82,
          ventas: 18,
          equiposAlquiler: '52 Laptops, 18 Pantallas LED, 12 Tablets',
          equiposVenta: '12 Laptops reacond., 6 Monitores'
        },
        {
          label: 'Sem 37',
          sublabel: '08-14 Sep',
          alquiler: 98,
          ventas: 24,
          equiposAlquiler: '64 Laptops, 22 Pantallas LED, 12 Proyectores',
          equiposVenta: '15 Laptops, 9 Accesorios de red'
        },
        {
          label: 'Sem 38',
          sublabel: '15-21 Sep',
          alquiler: 114,
          ventas: 29,
          equiposAlquiler: '75 Laptops, 25 Pantallas LED, 14 Tablets',
          equiposVenta: '18 Laptops, 11 Monitores'
        },
        {
          label: 'Sem 39',
          sublabel: '22-28 Sep',
          alquiler: 105,
          ventas: 22,
          equiposAlquiler: '70 Laptops, 20 Pantallas LED, 15 Racks',
          equiposVenta: '14 Laptops, 8 Impresoras'
        },
        {
          label: 'Sem 40',
          sublabel: '29 Sep - 05 Oct',
          alquiler: 128,
          ventas: 35,
          equiposAlquiler: '84 Laptops, 28 Pantallas LED, 16 Tablets',
          equiposVenta: '22 Laptops, 13 Monitores & Accesorios'
        },
        {
          label: 'Sem 41',
          sublabel: '06-12 Oct (Actual)',
          alquiler: 142,
          ventas: 41,
          equiposAlquiler: '96 Laptops, 32 Pantallas LED, 14 Tablets',
          equiposVenta: '26 Laptops, 15 Monitores & Redes'
        }
      ],
      resumen: {
        totalAlquiler: 669,
        totalVentas: 169,
        promedioAlquiler: 111,
        promedioVentas: 28
      }
    },
    mes: {
      title: 'Equipos en Alquiler vs Ventas por Mes',
      subtitle: 'Comportamiento mensual del año en curso (2025)',
      periodLabel: 'Mes',
      maxVal: 380,
      items: [
        {
          label: 'Mayo',
          sublabel: '2025',
          alquiler: 245,
          ventas: 62,
          equiposAlquiler: '160 Laptops, 55 Pantallas, 30 Tablets',
          equiposVenta: '40 Laptops, 22 Monitores'
        },
        {
          label: 'Junio',
          sublabel: '2025',
          alquiler: 278,
          ventas: 74,
          equiposAlquiler: '185 Laptops, 60 Pantallas, 33 Tablets',
          equiposVenta: '48 Laptops, 26 Equipos Red'
        },
        {
          label: 'Julio',
          sublabel: '2025',
          alquiler: 310,
          ventas: 88,
          equiposAlquiler: '205 Laptops, 70 Pantallas, 35 Audio/Video',
          equiposVenta: '58 Laptops, 30 Monitores'
        },
        {
          label: 'Agosto',
          sublabel: '2025',
          alquiler: 295,
          ventas: 79,
          equiposAlquiler: '195 Laptops, 68 Pantallas, 32 Tablets',
          equiposVenta: '50 Laptops, 29 Periféricos'
        },
        {
          label: 'Setiembre',
          sublabel: '2025',
          alquiler: 348,
          ventas: 95,
          equiposAlquiler: '230 Laptops, 78 Pantallas, 40 Tablets',
          equiposVenta: '62 Laptops, 33 Redes & Servidores'
        },
        {
          label: 'Octubre',
          sublabel: '2025 (En curso)',
          alquiler: 362,
          ventas: 108,
          equiposAlquiler: '240 Laptops, 82 Pantallas, 40 Equipos Audio',
          equiposVenta: '70 Laptops, 38 Monitores & Switches'
        }
      ],
      resumen: {
        totalAlquiler: 1838,
        totalVentas: 506,
        promedioAlquiler: 306,
        promedioVentas: 84
      }
    },
    año: {
      title: 'Equipos en Alquiler vs Ventas por Año',
      subtitle: 'Histórico consolidado multianual de AD GLOBAL PERÚ',
      periodLabel: 'Año',
      maxVal: 4200,
      items: [
        {
          label: '2021',
          sublabel: 'Post-Pandemia',
          alquiler: 1420,
          ventas: 340,
          equiposAlquiler: '920 Laptops, 300 Pantallas, 200 Tablets',
          equiposVenta: '220 Laptops, 120 Periféricos'
        },
        {
          label: '2022',
          sublabel: 'Crecimiento Corp.',
          alquiler: 2150,
          ventas: 510,
          equiposAlquiler: '1410 Laptops, 460 Pantallas, 280 Tablets',
          equiposVenta: '340 Laptops, 170 Monitores'
        },
        {
          label: '2023',
          sublabel: 'Expansión Eventos',
          alquiler: 2890,
          ventas: 720,
          equiposAlquiler: '1880 Laptops, 640 Pantallas, 370 Tablets',
          equiposVenta: '480 Laptops, 240 Redes/Servidores'
        },
        {
          label: '2024',
          sublabel: 'Consolidación',
          alquiler: 3480,
          ventas: 940,
          equiposAlquiler: '2280 Laptops, 780 Pantallas, 420 Audio/Video',
          equiposVenta: '620 Laptops, 320 Monitores'
        },
        {
          label: '2025',
          sublabel: 'Proyección Anual',
          alquiler: 3950,
          ventas: 1180,
          equiposAlquiler: '2600 Laptops, 890 Pantallas, 460 Tablets/Redes',
          equiposVenta: '780 Laptops, 400 Monitores & Equipos'
        }
      ],
      resumen: {
        totalAlquiler: 13890,
        totalVentas: 3690,
        promedioAlquiler: 2778,
        promedioVentas: 738
      }
    }
  };

  // If not authenticated, show corporate login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la web</span>
              </button>
              <span className="text-slate-300">|</span>
              <AdGlobalLogo variant="brand" height={28} />
            </div>
          </div>
        </header>

        {/* Login Box */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xl relative">
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B5C94] to-[#1F4778] flex items-center justify-center mx-auto mb-4 text-white shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Acceso al Sistema Administrativo
              </h1>
              <p className="text-xs text-slate-500 mt-1.5">
                Panel de control, cotizaciones e inventario de AD GLOBAL PERÚ
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Corporativo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    required
                    placeholder="admin@adglobalperu.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="adglobal_admin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#2B5C94] hover:bg-[#1F4778] active:scale-[0.99] transition-all duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-5"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando sesión...
                  </span>
                ) : (
                  <>
                    <span className="text-sm">Ingresar al Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500">
                Credenciales de prueba:{' '}
                <strong className="text-slate-700 font-mono">admin@adglobalperu.com</strong> ·{' '}
                <strong className="text-slate-700 font-mono">adglobal_admin</strong> ·{' '}
                <strong className="text-slate-700 font-mono">admin2025</strong>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // MAQUETA IDENTICA A LA IMAGEN (DASHBOARD SAAS LIMPIO EN BLANCO / GRIS CLARO)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex font-sans antialiased">
      {/* ------------------------------------------------------------------- */}
      {/* 1. SIDEBAR IZQUIERDO FIJO (IDENTICO A LA IMAGEN)                   */}
      {/* ------------------------------------------------------------------- */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 min-h-screen z-20 shadow-xs">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AdGlobalLogo variant="brand" height={30} />
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menú Principal
          </div>

          <button
            onClick={() => setActiveNav('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeNav === 'dashboard'
                ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard General</span>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('quotes')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeNav === 'quotes'
                ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Cotizaciones Web</span>
            </div>
            {quotesList.filter((q) => q.status === 'pendiente').length > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeNav === 'quotes'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {quotesList.filter((q) => q.status === 'pendiente').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveNav('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeNav === 'inventory'
                ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Laptop className="w-4 h-4" />
              <span>Control de Inventario</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeNav === 'inventory'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              6 Cat.
            </span>
          </button>

          <button
            onClick={() => setActiveNav('presupuestos')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeNav === 'presupuestos'
                ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Presupuestos & Proformas</span>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('tickets')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeNav === 'tickets'
                ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-4 h-4" />
              <span>Tickets Soporte & Taller</span>
            </div>
            {ticketsList.filter((t) => t.estado !== 'Resuelto').length > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeNav === 'tickets'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {ticketsList.filter((t) => t.estado !== 'Resuelto').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveNav('clientes')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeNav === 'clientes'
                ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Directorio de Clientes</span>
            </div>
          </button>

          <button
            onClick={onBackToHome}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Volver a la Web</span>
          </button>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2B5C94] to-[#3878BE] text-white flex items-center justify-center font-bold text-xs shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{username}</p>
                <p className="text-[10px] text-slate-400 truncate">{corporateEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* 2. ÁREA PRINCIPAL: TOP HEADER + DASHBOARD DE LA MAQUETA            */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Barra Superior */}
        <header className="bg-white border-b border-slate-200/90 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              AD GLOBAL PERÚ · Sistema Operativo
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente, serie o evento..."
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-60 focus:outline-none focus:ring-1 focus:ring-[#2B5C94] bg-slate-50/50"
              />
            </div>

            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2B5C94]" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              <Settings className="w-4 h-4" />
            </button>

            {/* Botón 1: Aperturar Tickets (Área de Soporte Técnico y Reparación) */}
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-700/80 group shrink-0"
              title="Aperturar Ticket para el área de soporte técnico y reparación"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Aperturar Ticket</span>
              <span className="hidden xl:inline-block text-[10px] font-medium text-slate-300 bg-slate-700/60 px-1.5 py-0.5 rounded">
                Soporte
              </span>
            </button>

            {/* Botón 2: Aperturar Cotización */}
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#2B5C94] hover:bg-[#1F4778] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
              title="Aperturar nueva cotización para cliente corporativo"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>Aperturar Cotización</span>
            </button>
          </div>
        </header>

        {/* CONTENIDO DEL DASHBOARD SEGÚN SECCIÓN SELECCIONADA */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB: DASHBOARD PRINCIPAL (REPRODUCCIÓN EXACTA DE LA MAQUETA DE LA IMAGEN) */}
          {activeNav === 'dashboard' && (
            <>
              {/* ========================================================= */}
              {/* ESTADÍSTICAS DE EQUIPOS: SOLO RECUADROS CON REDIRECCIÓN   */}
              {/* (Equipos en alquiler, Equipos en oficina, Equipos en taller) */}
              {/* ========================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Header de la sección */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2B5C94]/10 text-[#2B5C94] flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                          Distribución de Equipos en Flota
                        </h2>
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2B5C94] border border-blue-200">
                          Total: 580 unidades
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Haz clic en cualquier recuadro para ver el detalle en Control de Inventario
                      </p>
                    </div>
                  </div>

                  {/* Acceso directo a Control de Inventario */}
                  <button
                    onClick={() => {
                      setInventoryFilter('all');
                      setActiveNav('inventory');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2B5C94]/10 hover:bg-[#2B5C94] text-[#2B5C94] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto group"
                    title="Ver control de inventario completo"
                  >
                    <span>Ir a Control de Inventario</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* CONTENIDO: RECUADROS INTERACTIVOS */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 bg-slate-50/40">
                  {/* Recuadro 1: Equipos en alquiler */}
                  <div
                    onClick={() => {
                      setInventoryFilter('alquiler');
                      setActiveNav('inventory');
                    }}
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#2B5C94] transition-all flex flex-col justify-between cursor-pointer group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2B5C94] border border-blue-100 flex items-center justify-center shadow-2xs group-hover:bg-[#2B5C94] group-hover:text-white transition-colors">
                          <Truck className="w-4.5 h-4.5" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2B5C94] border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2B5C94] animate-pulse" />
                          71.0% de flota
                        </span>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-[#2B5C94] transition-colors">
                        Equipos en alquiler
                      </p>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                          412
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          / 580 equipos
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2B5C94] h-full rounded-full transition-all duration-500"
                            style={{ width: '71%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <span>38 servicios activos</span>
                        </span>
                        <span className="text-[#2B5C94] font-semibold">
                          En campo y eventos
                        </span>
                      </div>

                      {/* Botón ver más detalles */}
                      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2B5C94] group-hover:text-[#1F4778]">
                        <span>Ver más detalles en inventario</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Recuadro 2: Equipos en oficina */}
                  <div
                    onClick={() => {
                      setInventoryFilter('oficina');
                      setActiveNav('inventory');
                    }}
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between cursor-pointer group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Building2 className="w-4.5 h-4.5" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          24.5% de flota
                        </span>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 transition-colors">
                        Equipos en oficina
                      </p>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                          142
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          / 580 equipos
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: '24.5%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <span>Listos para entrega</span>
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          Almacén central
                        </span>
                      </div>

                      {/* Botón ver más detalles */}
                      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                        <span>Ver más detalles en inventario</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Recuadro 3: Equipos en taller */}
                  <div
                    onClick={() => {
                      setInventoryFilter('taller');
                      setActiveNav('inventory');
                    }}
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-500 transition-all flex flex-col justify-between cursor-pointer group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <Wrench className="w-4.5 h-4.5" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          4.5% de flota
                        </span>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-700 transition-colors">
                        Equipos en taller
                      </p>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                          26
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          / 580 equipos
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: '4.5%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <span>En revisión técnica</span>
                        </span>
                        <span className="text-amber-700 font-semibold">
                          Laboratorio & calibración
                        </span>
                      </div>

                      {/* Botón ver más detalles */}
                      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                        <span>Ver más detalles en inventario</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* FILA MEDIA: DIAGRAMA DE BARRAS DE EQUIPOS EN ALQUILER/VENTAS */}
              {/* (POR SEMANA, MENSUAL Y AÑO)                                 */}
              {/* ========================================================= */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2B5C94] flex items-center justify-center font-bold">
                        <BarChart3 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                          <span>{chartDataByPeriod[statsPeriod].title}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {chartDataByPeriod[statsPeriod].periodLabel}: {statsPeriod.toUpperCase()}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {chartDataByPeriod[statsPeriod].subtitle} · Comparativa en unidades operadas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selectores de Periodo y Filtro de Tipo (ambas barras lado a lado, sin apilarse una sobre otra) */}
                  <div className="flex items-center flex-nowrap gap-2.5 sm:gap-3 overflow-x-auto pb-0.5 max-w-full shrink-0">
                    {/* Barra 1: Selector de Modo (Semana / Mes / Año) */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shadow-2xs shrink-0">
                      <button
                        onClick={() => setStatsPeriod('semana')}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          statsPeriod === 'semana'
                            ? 'bg-white text-[#2B5C94] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Semana
                      </button>
                      <button
                        onClick={() => setStatsPeriod('mes')}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          statsPeriod === 'mes'
                            ? 'bg-white text-[#2B5C94] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Mensual
                      </button>
                      <button
                        onClick={() => setStatsPeriod('año')}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          statsPeriod === 'año'
                            ? 'bg-white text-[#2B5C94] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Año
                      </button>
                    </div>

                    {/* Barra 2: Filtro de Alquiler vs Ventas */}
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs shadow-2xs shrink-0">
                      <button
                        onClick={() => setChartTypeFilter('todos')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                          chartTypeFilter === 'todos'
                            ? 'bg-white text-slate-800 font-bold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Ver ambos"
                      >
                        Todos
                      </button>

                      <button
                        onClick={() => setChartTypeFilter(chartTypeFilter === 'alquiler' ? 'todos' : 'alquiler')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                          chartTypeFilter === 'alquiler'
                            ? 'bg-[#2B5C94] text-white shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#2B5C94]" />
                        <span>Alquiler</span>
                      </button>

                      <button
                        onClick={() => setChartTypeFilter(chartTypeFilter === 'ventas' ? 'todos' : 'ventas')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                          chartTypeFilter === 'ventas'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                        <span>Ventas</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tarjetas resumen del periodo actual */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Total en Alquiler</p>
                      <p className="text-xl font-black text-[#2B5C94] tracking-tight">
                        {chartDataByPeriod[statsPeriod].resumen.totalAlquiler.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">uds</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2B5C94] flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Total en Ventas</p>
                      <p className="text-xl font-black text-emerald-600 tracking-tight">
                        {chartDataByPeriod[statsPeriod].resumen.totalVentas.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">uds</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Laptop className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Promedio Alquiler</p>
                      <p className="text-lg font-extrabold text-slate-800 tracking-tight">
                        ~{chartDataByPeriod[statsPeriod].resumen.promedioAlquiler.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">/ {statsPeriod}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      {Math.round((chartDataByPeriod[statsPeriod].resumen.totalAlquiler / (chartDataByPeriod[statsPeriod].resumen.totalAlquiler + chartDataByPeriod[statsPeriod].resumen.totalVentas)) * 100)}%
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Promedio Ventas</p>
                      <p className="text-lg font-extrabold text-slate-800 tracking-tight">
                        ~{chartDataByPeriod[statsPeriod].resumen.promedioVentas.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">/ {statsPeriod}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {Math.round((chartDataByPeriod[statsPeriod].resumen.totalVentas / (chartDataByPeriod[statsPeriod].resumen.totalAlquiler + chartDataByPeriod[statsPeriod].resumen.totalVentas)) * 100)}%
                    </span>
                  </div>
                </div>

                {/* DIAGRAMA DE BARRAS INTERACTIVO */}
                <div className="pt-2">
                  <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2 relative">
                    {/* Líneas guía de fondo */}
                    <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-slate-400 border-dashed w-full" />
                      <div className="border-b border-slate-400 border-dashed w-full" />
                      <div className="border-b border-slate-400 border-dashed w-full" />
                      <div className="border-b border-slate-400 border-dashed w-full" />
                    </div>

                    {chartDataByPeriod[statsPeriod].items.map((item, idx) => {
                      const maxVal = chartDataByPeriod[statsPeriod].maxVal;
                      const hAlquiler = Math.min(100, Math.max(12, (item.alquiler / maxVal) * 100));
                      const hVentas = Math.min(100, Math.max(10, (item.ventas / maxVal) * 100));

                      const showAlquiler = chartTypeFilter === 'todos' || chartTypeFilter === 'alquiler';
                      const showVentas = chartTypeFilter === 'todos' || chartTypeFilter === 'ventas';

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center h-full justify-end group relative z-10"
                        >
                          {/* Tooltip flotante con detalles al pasar el cursor */}
                          <div className="absolute -top-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900 text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-xl whitespace-nowrap z-30">
                            <p className="font-bold text-white text-center border-b border-slate-700 pb-0.5 mb-1">
                              {item.label} {item.sublabel ? `· ${item.sublabel}` : ''}
                            </p>
                            <div className="space-y-0.5">
                              <p className="text-blue-300 flex items-center justify-between gap-3">
                                <span>Alquiler:</span>
                                <strong className="font-mono text-white">{item.alquiler} uds</strong>
                              </p>
                              <p className="text-emerald-300 flex items-center justify-between gap-3">
                                <span>Ventas:</span>
                                <strong className="font-mono text-white">{item.ventas} uds</strong>
                              </p>
                            </div>
                          </div>

                          {/* Contenedor de barras (lado a lado con separación clara) */}
                          <div className="w-full flex items-end justify-center gap-2 sm:gap-3.5 h-full pb-1">
                            {/* Barra: Equipos en Alquiler */}
                            {showAlquiler && (
                              <div
                                style={{ height: `${hAlquiler}%` }}
                                className="w-3.5 sm:w-6 bg-gradient-to-t from-[#1F4778] to-[#2B5C94] hover:to-[#3878BE] rounded-t-md transition-all duration-300 relative group/bar cursor-pointer shadow-xs flex flex-col justify-between items-center pb-1 shrink-0"
                              >
                                <span className="text-[9px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                  {item.alquiler}
                                </span>
                              </div>
                            )}

                            {/* Barra: Equipos en Ventas */}
                            {showVentas && (
                              <div
                                style={{ height: `${hVentas}%` }}
                                className="w-3.5 sm:w-6 bg-gradient-to-t from-emerald-700 to-emerald-500 hover:to-emerald-400 rounded-t-md transition-all duration-300 relative group/bar cursor-pointer shadow-xs flex flex-col justify-between items-center pb-1 shrink-0"
                              >
                                <span className="text-[9px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                  {item.ventas}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Etiqueta del Eje X */}
                          <div className="text-center mt-2">
                            <span className="block text-xs font-bold text-slate-800">
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span className="block text-[10px] text-slate-400 font-medium">
                                {item.sublabel}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer descriptivo y desglose adicional */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2B5C94]" />
                      <strong className="text-slate-700">Equipos en Alquiler:</strong> Laptops, Pantallas LED, Tablets, Sonido
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <strong className="text-slate-700">Equipos en Venta:</strong> Laptops corporativas, Monitores, Redes
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setInventoryFilter('all');
                      setActiveNav('inventory');
                    }}
                    className="text-[#2B5C94] hover:text-[#1F4778] font-bold inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto group"
                  >
                    <span>Ver stock detallado en Inventario</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* FILA INFERIOR: RESUMEN DE COTIZACIONES + ACCESOS RÁPIDOS */}
              {/* ========================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2 Columnas: Últimas cotizaciones recibidas */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Solicitudes Recientes de Cotización
                      </h3>
                      <p className="text-xs text-slate-500">
                        Atención prioritaria para alquiler corporativo de equipamiento
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveNav('quotes')}
                      className="text-xs font-bold text-[#2B5C94] hover:underline cursor-pointer"
                    >
                      Ver todas ({quotesList.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {quotesList.slice(0, 3).map((quote) => (
                      <div key={quote.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {quote.empresa}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                quote.status === 'atendido'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {quote.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {quote.mensaje}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                            <span>{quote.createdAt}</span>
                            <span>·</span>
                            <span>{quote.ciudad}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleQuoteStatus(quote.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                            quote.status === 'pendiente'
                              ? 'bg-[#2B5C94] text-white hover:bg-[#1F4778]'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {quote.status === 'pendiente' ? 'Atender' : 'Archivado'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1 Columna: Panel de Estado Operativo */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
                      Estado Operativo de Almacén
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Supervisión de parque informático listo para despacho
                    </p>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">Módulos LED Novastar 4K</span>
                          <span className="text-emerald-600">95% (120m²)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">Laptops Core i7 / ThinkPad</span>
                          <span className="text-sky-600">88% (450 uds)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: '88%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">Tablets & Atriles de Piso</span>
                          <span className="text-purple-600">92% (180 uds)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: BANDEJA COMPLETA DE COTIZACIONES */}
          {activeNav === 'quotes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Bandeja de Cotizaciones Web
                  </h2>
                  <p className="text-xs text-slate-500">
                    Todas las solicitudes enviadas por clientes a través del portal de AD GLOBAL
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Total: {quotesList.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {quotesList.map((quote) => {
                  const serviceObj = SERVICIOS_DATA.find((s) => s.id === quote.servicioId);

                  return (
                    <div
                      key={quote.id}
                      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-slate-900 text-lg">
                            {quote.empresa}
                          </span>
                          <span className="text-xs text-slate-500">Contacto: {quote.nombre}</span>
                          <span
                            className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                              quote.status === 'atendido'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {quote.status}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {quote.createdAt}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
                          <span className="text-[#2B5C94] font-semibold">
                            Servicio: {serviceObj?.title || quote.servicioId}
                          </span>
                          <span>Ciudad: {quote.ciudad}</span>
                          {quote.fechas && <span>Fechas tentativas: {quote.fechas}</span>}
                        </div>

                        <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans leading-relaxed">
                          "{quote.mensaje}"
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                          <a
                            href={`mailto:${quote.correo}`}
                            className="hover:text-[#2B5C94] transition-colors underline"
                          >
                            {quote.correo}
                          </a>
                          <span>·</span>
                          <a
                            href={`https://wa.me/${quote.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 transition-colors font-semibold"
                          >
                            WhatsApp: {quote.telefono}
                          </a>
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
                        <button
                          onClick={() => toggleQuoteStatus(quote.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            quote.status === 'pendiente'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {quote.status === 'pendiente' ? 'Marcar como Atendido' : 'Marcar como Pendiente'}
                        </button>

                        <a
                          href={`https://wa.me/${quote.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola ${quote.nombre}, te saludamos de AD GLOBAL respecto a tu solicitud de cotización para ${serviceObj?.title || 'equipamiento'}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200"
                        >
                          <span>Responder por WhatsApp</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: CONTROL DE INVENTARIO */}
          {activeNav === 'inventory' && (
            <div className="space-y-6">
              {/* Header con título */}
              <div className="pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Control de Inventario de Equipos
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2B5C94] border border-blue-200">
                    580 equipos registrados
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Disponibilidad y distribución en tiempo real: Equipos en Alquiler, Oficina y Taller
                </p>
              </div>

              {/* Tarjetas resumen con métricas clave (Equipos en alquiler, oficina y taller) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Resumen 1: Alquiler */}
                <button
                  type="button"
                  onClick={() => setInventoryFilter(inventoryFilter === 'alquiler' ? 'all' : 'alquiler')}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    inventoryFilter === 'alquiler'
                      ? 'bg-blue-50/80 border-[#2B5C94] ring-2 ring-[#2B5C94]/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2B5C94] border border-blue-100 flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2B5C94] border border-blue-200">
                      71.0% de flota
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Equipos en Alquiler
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">412</span>
                    <span className="text-xs text-slate-400">/ 580 unidades</span>
                  </div>
                  <p className="text-[11px] text-[#2B5C94] font-medium mt-1">
                    38 servicios activos en campo
                  </p>
                </button>

                {/* Resumen 2: Oficina */}
                <button
                  type="button"
                  onClick={() => setInventoryFilter(inventoryFilter === 'oficina' ? 'all' : 'oficina')}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    inventoryFilter === 'oficina'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      24.5% de flota
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Equipos en Oficina
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">142</span>
                    <span className="text-xs text-slate-400">/ 580 unidades</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Listos para despacho en almacén
                  </p>
                </button>

                {/* Resumen 3: Taller */}
                <button
                  type="button"
                  onClick={() => setInventoryFilter(inventoryFilter === 'taller' ? 'all' : 'taller')}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    inventoryFilter === 'taller'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      4.5% de flota
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Equipos en Taller
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">26</span>
                    <span className="text-xs text-slate-400">/ 580 unidades</span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    En calibración y mantenimiento
                  </p>
                </button>
              </div>

              {/* Barra de Búsqueda y Filtros Rápidos */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Buscar equipo, categoría o modelo..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2B5C94] focus:bg-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Filtrar:</span>
                  {[
                    { id: 'all', label: 'Todos (6)' },
                    { id: 'alquiler', label: 'En Alquiler' },
                    { id: 'oficina', label: 'En Oficina' },
                    { id: 'taller', label: 'En Taller' }
                  ].map((filterTab) => (
                    <button
                      key={filterTab.id}
                      onClick={() => setInventoryFilter(filterTab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        inventoryFilter === filterTab.id
                          ? 'bg-[#2B5C94] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                  {(inventorySearch || inventoryFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setInventorySearch('');
                        setInventoryFilter('all');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* VISTA EN FORMATO DE LISTA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Encabezado de la lista en pantallas medianas y grandes */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="col-span-4">Equipo / Especificación</div>
                    <div className="col-span-1 text-center">Total</div>
                    <div className="col-span-2 text-center text-[#2B5C94]">En Alquiler</div>
                    <div className="col-span-2 text-center text-emerald-700">En Oficina</div>
                    <div className="col-span-1 text-center text-amber-700">En Taller</div>
                    <div className="col-span-1 text-center">Disp.</div>
                    <div className="col-span-1 text-right">Detalle</div>
                  </div>

                  {/* Filas de la lista */}
                  <div className="divide-y divide-slate-100">
                    {INVENTORY_DATA.filter((item) => {
                      const matchesSearch =
                        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.specs.toLowerCase().includes(inventorySearch.toLowerCase());
                      if (!matchesSearch) return false;
                      if (inventoryFilter === 'alquiler') return item.alquiler > 0;
                      if (inventoryFilter === 'oficina') return item.oficina > 0;
                      if (inventoryFilter === 'taller') return item.taller > 0;
                      return true;
                    }).map((item) => {
                      const isExpanded = expandedInventoryId === item.id;
                      const alquilerPercent = Math.round((item.alquiler / item.total) * 100);
                      const oficinaPercent = Math.round((item.oficina / item.total) * 100);
                      const tallerPercent = Math.round((item.taller / item.total) * 100);

                      return (
                        <div key={item.id} className="transition-colors hover:bg-slate-50/60">
                          {/* Fila principal */}
                          <div className="p-4 sm:p-5 lg:grid lg:grid-cols-12 gap-3 items-center">
                            {/* Columna: Equipo & Especificaciones */}
                            <div className="lg:col-span-4 flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#2B5C94] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                {item.iconName === 'laptop' && <Laptop className="w-5 h-5" />}
                                {item.iconName === 'monitor' && <Monitor className="w-5 h-5" />}
                                {item.iconName === 'tablet' && <Tablet className="w-5 h-5" />}
                                {item.iconName === 'volume' && <Volume2 className="w-5 h-5" />}
                                {item.iconName === 'printer' && <Printer className="w-5 h-5" />}
                                {item.iconName === 'package' && <Package className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {item.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                  {item.specs}
                                </p>
                              </div>
                            </div>

                            {/* Columna: Total */}
                            <div className="mt-3 lg:mt-0 lg:col-span-1 text-left lg:text-center">
                              <span className="lg:hidden text-xs font-bold text-slate-400 mr-2">Total:</span>
                              <span className="font-mono font-black text-slate-800 text-sm">
                                {item.total}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{item.unit}</span>
                            </div>

                            {/* Columna: En Alquiler */}
                            <div className="mt-2 lg:mt-0 lg:col-span-2 text-left lg:text-center">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                                <Truck className="w-3.5 h-3.5 text-[#2B5C94]" />
                                <span className="font-bold text-[#2B5C94] text-xs font-mono">
                                  {item.alquiler} ({alquilerPercent}%)
                                </span>
                              </div>
                            </div>

                            {/* Columna: En Oficina */}
                            <div className="mt-2 lg:mt-0 lg:col-span-2 text-left lg:text-center">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span className="font-bold text-emerald-700 text-xs font-mono">
                                  {item.oficina} ({oficinaPercent}%)
                                </span>
                              </div>
                            </div>

                            {/* Columna: En Taller */}
                            <div className="mt-2 lg:mt-0 lg:col-span-1 text-left lg:text-center">
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                                <Wrench className="w-3 h-3 text-amber-700" />
                                <span className="font-bold text-amber-700 text-xs font-mono">
                                  {item.taller}
                                </span>
                              </div>
                            </div>

                            {/* Columna: Disponibilidad */}
                            <div className="mt-2 lg:mt-0 lg:col-span-1 text-left lg:text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {item.dispPercent}%
                              </span>
                            </div>

                            {/* Columna: Acción desplegar detalle */}
                            <div className="mt-3 lg:mt-0 lg:col-span-1 text-right">
                              <button
                                onClick={() => setExpandedInventoryId(isExpanded ? null : item.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#2B5C94] text-white shadow-2xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{isExpanded ? 'Ocultar' : 'Detalles'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Barra de progreso de distribución proporcional */}
                          <div className="px-4 sm:px-5 pb-2">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${alquilerPercent}%` }}
                                className="bg-[#2B5C94] h-full"
                                title={`En alquiler: ${alquilerPercent}%`}
                              />
                              <div
                                style={{ width: `${oficinaPercent}%` }}
                                className="bg-emerald-500 h-full"
                                title={`En oficina: ${oficinaPercent}%`}
                              />
                              <div
                                style={{ width: `${tallerPercent}%` }}
                                className="bg-amber-500 h-full"
                                title={`En taller: ${tallerPercent}%`}
                              />
                            </div>
                          </div>

                          {/* PANEL EXPANDIBLE CON DETALLES (KARDEX / ASIGNACIÓN) */}
                          {isExpanded && (
                            <div className="px-4 sm:px-5 pb-5 pt-2 bg-slate-50/70 border-t border-slate-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2">
                                {/* Detalle Alquiler */}
                                <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[#2B5C94] text-xs font-bold">
                                    <Truck className="w-4 h-4" />
                                    <span>Distribución en Alquiler ({item.alquiler} {item.unit})</span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {item.proyectosAlquiler}
                                  </p>
                                  <span className="inline-block text-[10px] font-semibold text-[#2B5C94] bg-blue-50 px-2 py-0.5 rounded">
                                    SLA activo 24/7 y reemplazo express
                                  </span>
                                </div>

                                {/* Detalle Oficina */}
                                <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                                    <Building2 className="w-4 h-4" />
                                    <span>Stock en Oficina ({item.oficina} {item.unit})</span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {item.ubicacionOficina}
                                  </p>
                                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    Listos para entrega inmediata y configuración previa
                                  </span>
                                </div>

                                {/* Detalle Taller */}
                                <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                                    <Wrench className="w-4 h-4" />
                                    <span>En Taller Técnico ({item.taller} {item.unit})</span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {item.diagnosticoTaller}
                                  </p>
                                  <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                    Retorno estimado: 24 a 48 horas
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
            </div>
          )}

          {/* TAB: PRESUPUESTOS Y PROFORMAS */}
          {activeNav === 'presupuestos' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Generador de Presupuestos & Proformas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Emisión instantánea con membrete de AD GLOBAL PERÚ, IGV y condiciones comerciales
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Módulo Integrado
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Proformas Emitidas Mes</span>
                  <p className="text-3xl font-extrabold text-slate-900 font-sans">34</p>
                  <p className="text-xs text-emerald-600 font-semibold">+18% respecto al mes anterior</p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Monto Total Cotizado</span>
                  <p className="text-3xl font-extrabold text-slate-900 font-sans">$56.800 USD</p>
                  <p className="text-xs text-slate-500">Promedio $1.670 por evento</p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tasa de Cierre</span>
                  <p className="text-3xl font-extrabold text-[#2B5C94] font-sans">68.5%</p>
                  <p className="text-xs text-emerald-600 font-semibold">Excelente conversión</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIRECTORIO DE CLIENTES */}
          {activeNav === 'clientes' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Directorio de Clientes Corporativos
                </h2>
                <p className="text-xs text-slate-500">
                  Historial de cuentas recurrentes en minería, banca, telecomunicaciones y eventos
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Banco de Crédito BCP', sector: 'Banca y Finanzas', eventos: 12, rating: 'VIP' },
                  { name: 'Corporación Minera del Sur', sector: 'Minería', eventos: 8, rating: 'A+' },
                  { name: 'Productora Live Events SAC', sector: 'Entretenimiento', eventos: 24, rating: 'VIP' },
                  { name: 'Claro Telecomunicaciones', sector: 'Telecomunicaciones', eventos: 15, rating: 'VIP' },
                  { name: 'Universidad Tecnológica UTP', sector: 'Educación', eventos: 9, rating: 'A+' },
                  { name: 'Ministerio de Transportes MTC', sector: 'Gobierno', eventos: 5, rating: 'Estándar' }
                ].map((cli, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{cli.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                        {cli.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{cli.sector}</p>
                    <p className="text-xs font-semibold text-[#2B5C94]">{cli.eventos} proyectos completados</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* TAB: TICKETS DE SOPORTE & TALLER */}
          {activeNav === 'tickets' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Wrench className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Tickets de Soporte Técnico & Reparación
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Control de incidencias, diagnósticos en taller, mantenimientos y reemplazos express SLA
                  </p>
                </div>

                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Aperturar Nuevo Ticket</span>
                </button>
              </div>

              {/* Métricas rápidas de tickets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Tickets Totales</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">{ticketsList.length}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Histórico registrado</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/30 shadow-2xs">
                  <p className="text-[11px] font-bold text-amber-700 uppercase">En Taller / Diagnóstico</p>
                  <p className="text-2xl font-black text-amber-600 mt-0.5">
                    {ticketsList.filter((t) => t.estado === 'En Diagnóstico' || t.estado === 'En Reparación').length}
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">En proceso técnico</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/30 shadow-2xs">
                  <p className="text-[11px] font-bold text-[#2B5C94] uppercase">Soporte In-Situ</p>
                  <p className="text-2xl font-black text-[#2B5C94] mt-0.5">
                    {ticketsList.filter((t) => t.area === 'Soporte In-Situ').length}
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Técnicos en campo</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/30 shadow-2xs">
                  <p className="text-[11px] font-bold text-rose-700 uppercase">Prioridad Urgente</p>
                  <p className="text-2xl font-black text-rose-600 mt-0.5">
                    {ticketsList.filter((t) => t.prioridad === 'Urgente' && t.estado !== 'Resuelto').length}
                  </p>
                  <p className="text-[10px] text-rose-600 mt-0.5">Atención inmediata SLA</p>
                </div>
              </div>

              {/* Listado de tickets */}
              <div className="space-y-3">
                {ticketsList.map((ticket) => {
                  const isUrgent = ticket.prioridad === 'Urgente';
                  const isAlta = ticket.prioridad === 'Alta';

                  return (
                    <div
                      key={ticket.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#2B5C94] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            {ticket.codigo}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {ticket.cliente}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {ticket.area}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUrgent
                                ? 'bg-rose-100 text-rose-700 font-mono'
                                : isAlta
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Prioridad: {ticket.prioridad}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              ticket.estado === 'Resuelto'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ticket.estado === 'En Reparación'
                                ? 'bg-amber-100 text-amber-800'
                                : ticket.estado === 'En Diagnóstico'
                                ? 'bg-blue-100 text-[#2B5C94]'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {ticket.estado}
                          </span>
                          <button
                            onClick={() => toggleTicketStatus(ticket.id)}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Avanzar etapa del ticket"
                          >
                            Avanzar etapa
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          <span>Equipo: {ticket.equipo}</span>
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-sans">
                          {ticket.descripcion}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 font-medium">Asignado a: {ticket.tecnico}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{ticket.fecha}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: APERTURAR TICKET (SOPORTE TÉCNICO & TALLER DE REPARACIÓN)    */}
      {/* ===================================================================== */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header del Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Aperturar Ticket de Soporte / Reparación
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Área técnica, servicio in-situ y taller de diagnóstico
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateTicketSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Área de Atención Técnica
                </label>
                <select
                  value={ticketArea}
                  onChange={(e) => setTicketArea(e.target.value as SupportTicket['area'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium"
                >
                  <option value="Reparación Taller">Reparación en Taller Central (Hardware / Falla)</option>
                  <option value="Soporte In-Situ">Soporte In-Situ / Campo (Evento o Sede de Cliente)</option>
                  <option value="Mantenimiento Preventivo">Mantenimiento Preventivo y Limpieza Técnica</option>
                  <option value="Cambio Express">Cambio Express de Equipo por SLA Activo</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Cliente / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketCliente}
                    onChange={(e) => setTicketCliente(e.target.value)}
                    placeholder="Ej. Banco de Crédito BCP"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Prioridad de Atención
                  </label>
                  <select
                    value={ticketPrioridad}
                    onChange={(e) => setTicketPrioridad(e.target.value as SupportTicket['prioridad'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium"
                  >
                    <option value="Urgente">Urgente (SLA 24/7 Crítico)</option>
                    <option value="Alta">Alta (Respuesta &lt; 4 horas)</option>
                    <option value="Media">Media (Atención estándar)</option>
                    <option value="Baja">Baja (Programable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Equipo Afectado / Serie / Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={ticketEquipo}
                  onChange={(e) => setTicketEquipo(e.target.value)}
                  placeholder="Ej. Laptop ThinkPad T14 / Pantalla LED P2.6 Módulo 4"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Técnico Asignado
                </label>
                <select
                  value={ticketTecnico}
                  onChange={(e) => setTicketTecnico(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium"
                >
                  <option value="Ing. Carlos Mendoza (Taller Central)">Ing. Carlos Mendoza (Taller Central)</option>
                  <option value="Téc. Miguel Alva (Soporte Campo)">Téc. Miguel Alva (Soporte Campo)</option>
                  <option value="Téc. Fernando Ruiz (Audio LAB)">Téc. Fernando Ruiz (Audio LAB)</option>
                  <option value="Ing. Roberto Quispe (Redes & Servidores)">Ing. Roberto Quispe (Redes & Servidores)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Descripción del Problema o Solicitud Técnica *
                </label>
                <textarea
                  rows={3}
                  required
                  value={ticketDescripcion}
                  onChange={(e) => setTicketDescripcion(e.target.value)}
                  placeholder="Detalla la falla encontrada, síntomas, daños visibles o requerimiento de soporte..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aperturar Ticket Ahora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: APERTURAR COTIZACIÓN (ÁREA COMERCIAL & ALQUILERES)           */}
      {/* ===================================================================== */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header del Modal */}
            <div className="px-6 py-4 bg-[#2B5C94] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Aperturar Cotización
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Registro de cotización comercial para eventos o alquiler corporativo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateQuoteSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Empresa / Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteEmpresa}
                    onChange={(e) => setQuoteEmpresa(e.target.value)}
                    placeholder="Ej. Interbank / Belcorp SAC"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Contacto Responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteNombre}
                    onChange={(e) => setQuoteNombre(e.target.value)}
                    placeholder="Ej. Andrea Morales"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={quoteCorreo}
                    onChange={(e) => setQuoteCorreo(e.target.value)}
                    placeholder="contacto@empresa.pe"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={quoteTelefono}
                    onChange={(e) => setQuoteTelefono(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Servicio Requerido
                  </label>
                  <select
                    value={quoteServicio}
                    onChange={(e) => setQuoteServicio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium"
                  >
                    {SERVICIOS_DATA.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Ciudad / Sede
                  </label>
                  <input
                    type="text"
                    value={quoteCiudad}
                    onChange={(e) => setQuoteCiudad(e.target.value)}
                    placeholder="Lima / Arequipa / Trujillo..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Fechas Tentativas del Alquiler / Evento
                </label>
                <input
                  type="text"
                  value={quoteFechas}
                  onChange={(e) => setQuoteFechas(e.target.value)}
                  placeholder="Ej. Del 10 al 14 de Noviembre (4 días)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Detalle del Requerimiento / Cantidades de Equipos
                </label>
                <textarea
                  rows={3}
                  value={quoteMensaje}
                  onChange={(e) => setQuoteMensaje(e.target.value)}
                  placeholder="Especifica modelos, cantidades, configuraciones o requerimientos técnicos..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2B5C94] hover:bg-[#1F4778] transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Aperturar Cotización</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificación Toast flotante de confirmación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 max-w-md">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-slate-200">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

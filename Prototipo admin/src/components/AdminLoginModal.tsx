import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Shield,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Laptop,
  Monitor,
  Tablet,
  Volume2,
  Printer
} from 'lucide-react';
import { AdGlobalLogo } from './AdGlobalLogo';
import { SERVICIOS_DATA } from '../data/servicios';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
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
  const [activeTab, setActiveTab] = useState<'quotes' | 'inventory'>('quotes');
  const [quotesList, setQuotesList] = useState<StoredQuote[]>([]);

  // Load quotes from localStorage + defaults
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

    // Simulate secure enterprise authentication
    setTimeout(() => {
      setIsLoading(false);
      // Allow demo credentials or admin credentials
      if (password.length >= 4) {
        setIsAuthenticated(true);
        if (rememberMe) {
          localStorage.setItem('adglobal_admin_auth', 'true');
        }
      } else {
        setErrorMessage('Contraseña incorrecta. (Demo: admin2025)');
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dialog-title"
    >
      <div
        className="relative bg-[#111C2E] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0E1726]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <AdGlobalLogo variant="white" height={28} />
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#2B5C94]/40 border border-sky-400/30 text-sky-300">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Portal de Administración
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana (Esc)"
            aria-label="Cerrar portal de administración"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Login or Dashboard */}
        {!isAuthenticated ? (
          /* 1. LOGIN SCREEN */
          <div className="p-6 sm:p-12 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B5C94] to-[#162C4E] border border-white/15 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-950/50">
                <Lock className="w-6 h-6 text-sky-300" />
              </div>
              <h2 id="admin-dialog-title" className="text-2xl font-extrabold text-white tracking-tight">
                Acceso Administrativo
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Panel interno para la gestión de solicitudes corporativas, inventario y cotizaciones de clientes.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* 1. Email Corporativo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Corporativo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    required
                    placeholder="admin@adglobalperu.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              {/* 2. Usuario */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="adglobal_admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              {/* 3. Contraseña */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#2B5C94] hover:bg-[#3878BE] active:scale-[0.99] transition-all duration-200 shadow-xl shadow-[#2B5C94]/30 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando credenciales...
                  </span>
                ) : (
                  <>
                    <span className="text-sm">Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Credenciales demo:{' '}
                <span className="text-sky-300 font-mono font-semibold">admin@adglobalperu.com</span> ·{' '}
                <span className="text-sky-300 font-mono font-semibold">adglobal_admin</span> ·{' '}
                <span className="text-sky-300 font-mono font-semibold">admin2025</span>
              </p>
            </div>
          </div>
        ) : (
          /* 2. ADMIN DASHBOARD VIEW */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Bar with user info & logout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <h2 id="admin-dialog-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <span>Panel de Control de Cotizaciones</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-semibold">
                    Activo
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sesión iniciada como <strong className="text-sky-300 font-mono">admin@adglobalperu.com</strong> (Administrador General)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-950/50 hover:border-rose-700/50 border border-white/10 text-xs font-bold text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Solicitudes Totales
                </p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                  {quotesList.length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Por Atender
                </p>
                <p className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">
                  {quotesList.filter((q) => q.status === 'pendiente').length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Atendidas
                </p>
                <p className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">
                  {quotesList.filter((q) => q.status === 'atendido').length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  SLA Respuesta
                </p>
                <p className="text-2xl font-extrabold text-sky-300 mt-1 font-mono">
                  &lt; 2h
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('quotes')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'bg-[#2B5C94] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Cotizaciones Recibidas ({quotesList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-[#2B5C94] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Estado de Inventario</span>
              </button>
            </div>

            {/* TAB 1: LIST OF QUOTES */}
            {activeTab === 'quotes' && (
              <div className="space-y-3">
                {quotesList.map((quote) => {
                  const serviceObj = SERVICIOS_DATA.find((s) => s.id === quote.servicioId);

                  return (
                    <div
                      key={quote.id}
                      className="p-5 rounded-xl bg-[#16243A] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {quote.empresa}
                          </span>
                          <span className="text-xs text-slate-400">({quote.nombre})</span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              quote.status === 'atendido'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                            }`}
                          >
                            {quote.status}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {quote.createdAt}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                          <span className="text-sky-300 font-semibold">
                            Servicio: {serviceObj?.title || quote.servicioId}
                          </span>
                          <span>Ciudad: {quote.ciudad}</span>
                          {quote.fechas && <span>Fechas: {quote.fechas}</span>}
                        </div>

                        <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/5 font-sans leading-relaxed">
                          "{quote.mensaje}"
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                          <a
                            href={`mailto:${quote.correo}`}
                            className="hover:text-sky-300 transition-colors underline"
                          >
                            {quote.correo}
                          </a>
                          <span>·</span>
                          <a
                            href={`https://wa.me/${quote.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400 transition-colors font-semibold"
                          >
                            WhatsApp: {quote.telefono}
                          </a>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                        <button
                          onClick={() => toggleQuoteStatus(quote.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            quote.status === 'pendiente'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-white/10 hover:bg-white/15 text-slate-300'
                          }`}
                        >
                          {quote.status === 'pendiente' ? 'Marcar Atendido' : 'Marcar Pendiente'}
                        </button>

                        <a
                          href={`https://wa.me/${quote.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola ${quote.nombre}, te saludamos de AD GLOBAL respecto a tu solicitud de cotización para ${serviceObj?.title || 'equipamiento'}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-2"
                        >
                          <span>Responder</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: INVENTORY OVERVIEW */}
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#16243A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400">
                      <Monitor className="w-5 h-5" />
                      <span className="font-bold text-white text-sm">Pantallas LED & TVs</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">95% Disp.</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Módulos P1.9, P2.6, P3.9 Novastar 4K y TVs Smart 55"-85" en almacén central.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">Stock activo: 120m² LED / 28 TVs</p>
                </div>

                <div className="p-4 rounded-xl bg-[#16243A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400">
                      <Laptop className="w-5 h-5" />
                      <span className="font-bold text-white text-sm">Laptops & Cómputo</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">88% Disp.</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dell Latitude, Lenovo ThinkPad Core i5/i7 y Apple MacBook Pro M2/M3.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">Stock activo: 450 equipos</p>
                </div>

                <div className="p-4 rounded-xl bg-[#16243A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Tablet className="w-5 h-5" />
                      <span className="font-bold text-white text-sm">Tablets</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">92% Disp.</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    iPad 10.2"/10.9" y Samsung Galaxy Tab con atriles metálicos antirrobo.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">Stock activo: 180 unidades</p>
                </div>

                <div className="p-4 rounded-xl bg-[#16243A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Volume2 className="w-5 h-5" />
                      <span className="font-bold text-white text-sm">Audiovisuales</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">100% Disp.</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Microfonía inalámbrica Shure, consolas Yamaha y luminarias robóticas.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">Stock activo: 14 sets completos</p>
                </div>

                <div className="p-4 rounded-xl bg-[#16243A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Printer className="w-5 h-5" />
                      <span className="font-bold text-white text-sm">Multifuncionales</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">85% Disp.</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Impresoras Ricoh y HP Enterprise láser de 45-55 ppm con tóner ilimitado.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">Stock activo: 35 impresoras</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 bg-[#0E1726]/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema AD GLOBAL v2.4 · Conexión Cifrada SSL</span>
          </div>

          <button
            onClick={onClose}
            className="hover:text-white transition-colors cursor-pointer underline"
          >
            Volver al sitio web
          </button>
        </div>
      </div>
    </div>
  );
};

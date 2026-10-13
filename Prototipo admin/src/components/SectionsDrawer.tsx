import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutGrid,
  Monitor,
  Laptop,
  Volume2,
  Tablet,
  Printer,
  Code2,
  Award,
  HelpCircle,
  Building2,
  Send,
  Shield,
  ChevronRight,
  Sparkles,
  Home,
  Clock,
  Compass,
  FileText,
  FileSpreadsheet,
  Truck,
  FolderKanban,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { SERVICIOS_DATA } from '../data/servicios';

interface SectionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onSelectServiceModal?: (serviceId: string) => void;
}

export const SectionsDrawer: React.FC<SectionsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
  onOpenAdmin,
  onSelectServiceModal
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'web'>('admin');

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const adminModules = [
    {
      id: 'quotes',
      title: 'Bandeja de Cotizaciones',
      description: 'Recepción y respuesta a requerimientos de empresas clientes recibidos desde la web.',
      icon: FileText,
      badge: '3 Pendientes',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60'
    },
    {
      id: 'inventory',
      title: 'Control de Inventario de Equipos',
      description: 'Disponibilidad en almacén de pantallas LED P2.6/P3.9, laptops i7, tablets y sonido.',
      icon: Laptop,
      badge: '6 Líneas TI',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
    },
    {
      id: 'proformas',
      title: 'Emisión de Proformas & Cotizaciones PDF',
      description: 'Cálculo de días de evento, personal in-situ, respaldo hot-swap e IGV corporativo.',
      icon: FileSpreadsheet,
      badge: 'En Desarrollo',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-700/60'
    },
    {
      id: 'despacho',
      title: 'Despacho Técnico & Guías de Remisión',
      description: 'Control de números de serie, órdenes de salida y entrega en el recinto del evento.',
      icon: Truck,
      badge: 'Planificado',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
    }
  ];

  const mainSections = [
    {
      id: 'inicio',
      title: 'Inicio & Presentación Principal',
      description: 'Banner corporativo con tecnologías rotativas y propuesta de valor.',
      icon: Home,
      badge: 'Principal',
      badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/50'
    },
    {
      id: 'servicios',
      title: 'Catálogo de Servicios (6 Módulos)',
      description: 'Equipos con galería fotográfica, ficha y video demostrativo.',
      icon: LayoutGrid,
      badge: '6 Equipos',
      badgeColor: 'bg-sky-900/60 text-sky-300 border-sky-700/50'
    },
    {
      id: 'experiencia',
      title: 'Nuestra Experiencia en Cifras',
      description: 'Carrusel dinámico interactivo con estadísticas y soporte in-situ.',
      icon: Award,
      badge: 'Métricas',
      badgeColor: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50'
    },
    {
      id: 'faqs',
      title: 'Preguntas Frecuentes (FAQs)',
      description: 'Respuestas a dudas sobre alquiler, transporte, garantías y soporte.',
      icon: HelpCircle,
      badge: 'Soporte',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'clientes',
      title: 'Confianza & Clientes',
      description: 'Carrusel infinito con corporaciones y entidades que confían en AD GLOBAL.',
      icon: Building2,
      badge: 'B2B',
      badgeColor: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50'
    },
    {
      id: 'contacto',
      title: 'Panel de Cotización y Contacto',
      description: 'Formulario con respuesta en menos de 2 horas y canales directos.',
      icon: Send,
      badge: 'Inmediato',
      badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
    }
  ];

  const futureModules = [
    {
      title: 'Calculadora de Medidas LED & Potencia',
      description: 'Herramienta interactiva para calcular m² y consumo eléctrico en eventos.',
      badge: 'Próximamente'
    },
    {
      title: 'Seguimiento de Despacho en Vivo',
      description: 'Monitoreo de estado de entrega de flotas de cómputo e instalación técnica.',
      badge: 'En Desarrollo'
    },
    {
      title: 'Descarga de Fichas Técnicas PDF',
      description: 'Brochure digital descargable por categoría de equipo.',
      badge: 'Planificado'
    }
  ];

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pantallas-led':
        return Monitor;
      case 'laptops-computadores':
        return Laptop;
      case 'equipos-audiovisuales':
        return Volume2;
      case 'tablets':
        return Tablet;
      case 'impresoras-multifuncionales':
        return Printer;
      case 'desarrollo-web':
        return Code2;
      default:
        return LayoutGrid;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panel deslizable de apartados"
    >
      {/* Sliding Drawer Container from the LEFT */}
      <div
        className="fixed inset-y-0 left-0 max-w-full flex pr-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md sm:max-w-lg bg-[#0E1726] border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 bg-[#111C2E]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2B5C94]/40 border border-sky-400/30 text-sky-300 shadow-md">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Apartados & Módulos</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/60 text-sky-300 font-semibold uppercase">
                      Panel Lateral
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Navegación completa por las áreas del sistema
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar panel (Esc)"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Switcher: Apartados Admin vs Secciones Web */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#2B5C94] text-white shadow-md shadow-sky-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-sky-300" />
                <span>Apartados Admin</span>
              </button>
              <button
                onClick={() => setActiveTab('web')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'web'
                    ? 'bg-[#2B5C94] text-white shadow-md shadow-sky-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-sky-300" />
                <span>Secciones Web</span>
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-7 [scrollbar-width:thin]">
            {activeTab === 'admin' ? (
              /* ==================================================== */
              /* TAB: APARTADOS DE ADMINISTRACIÓN                    */
              /* ==================================================== */
              <div className="space-y-6">
                {/* Hero Card for Admin Portal */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#14233C] to-[#1F3659] border border-sky-400/40 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Portal de Administración
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold">
                      Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mb-4">
                    Centro de control para atención de solicitudes de cotización, asignación de equipos de cómputo y seguimiento operativo.
                  </p>
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white text-[#14233C] hover:bg-slate-100 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-[#2B5C94]" />
                    <span>Abrir Módulo de Administración</span>
                    <ArrowRight className="w-4 h-4 text-[#2B5C94]" />
                  </button>
                </div>

                {/* Modules list */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Módulos Operativos del Admin
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {adminModules.length} módulos
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {adminModules.map((mod) => {
                      const Icon = mod.icon;
                      return (
                        <div
                          key={mod.id}
                          onClick={() => {
                            onOpenAdmin();
                            onClose();
                          }}
                          className="p-3.5 rounded-xl bg-white/5 hover:bg-[#1B2B44] border border-white/5 hover:border-sky-400/40 transition-all text-left group flex items-start gap-3.5 cursor-pointer"
                        >
                          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#2B5C94]/40 text-sky-400 group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                                {mod.title}
                              </p>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${mod.badgeColor}`}
                              >
                                {mod.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {mod.description}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Demo access hint */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300">Credenciales de Acceso Rápido:</p>
                  <p>
                    Usuario: <span className="text-sky-300 font-mono font-semibold">adglobal_admin</span> · Clave:{' '}
                    <span className="text-sky-300 font-mono font-semibold">admin2025</span>
                  </p>
                </div>
              </div>
            ) : (
              /* ==================================================== */
              /* TAB: SECCIONES DEL SITIO WEB                        */
              /* ==================================================== */
              <div className="space-y-7">
                {/* 1. Módulos Principales de la Página */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Secciones del Sitio Web
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {mainSections.length} apartados
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mainSections.map((sec) => {
                      const Icon = sec.icon;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => {
                            onNavigateToSection(sec.id);
                            onClose();
                          }}
                          className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-[#1B2B44] border border-white/5 hover:border-sky-400/40 transition-all text-left group flex items-start gap-3.5 cursor-pointer"
                        >
                          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#2B5C94]/40 text-sky-400 group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                                {sec.title}
                              </p>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${sec.badgeColor}`}
                              >
                                {sec.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                              {sec.description}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sub-apartados de Servicios Tecnológicos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Equipamiento Específico
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {SERVICIOS_DATA.length} servicios
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICIOS_DATA.map((srv) => {
                      const SrvIcon = getServiceIcon(srv.id);
                      return (
                        <button
                          key={srv.id}
                          onClick={() => {
                            if (onSelectServiceModal) {
                              onSelectServiceModal(srv.id);
                            } else {
                              onNavigateToSection('servicios');
                            }
                            onClose();
                          }}
                          className="p-3 rounded-xl bg-[#142236]/70 hover:bg-[#1B2B44] border border-white/5 hover:border-sky-400/30 transition-all text-left group flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-[#2B5C94]/40 text-sky-400 transition-colors shrink-0">
                            <SrvIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                            {srv.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Próximos Apartados */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Nuevos Apartados en Preparación
                    </span>
                  </div>

                  <div className="space-y-2">
                    {futureModules.map((mod, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 opacity-80 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {mod.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {mod.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700/50 text-amber-300 font-semibold shrink-0">
                          {mod.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-[#0A121E] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">AD GLOBAL · Sistema Modular</span>
            <button
              onClick={() => {
                if (activeTab === 'admin') {
                  onOpenAdmin();
                } else {
                  onNavigateToSection('contacto');
                }
                onClose();
              }}
              className="text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
            >
              {activeTab === 'admin' ? 'Entrar a Admin →' : 'Solicitar Cotización →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, PhoneCall, Shield, LayoutGrid } from 'lucide-react';
import { AdGlobalLogo } from './AdGlobalLogo';

interface NavbarProps {
  onOpenQuote: (serviceId?: string) => void;
  onOpenAdminLogin: () => void;
  onOpenDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuote, onOpenAdminLogin, onOpenDrawer }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Experiencia', href: '#experiencia' },
    { label: 'Preguntas frecuentes', href: '#faqs' },
    { label: 'Clientes', href: '#clientes' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#14233c]/95 backdrop-blur-md shadow-lg border-b border-white/10 py-3'
          : 'bg-gradient-to-b from-[#0e192c]/90 via-[#0e192c]/40 to-transparent py-5'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between gap-6">
          {/* Zone 1 & 2: Brand Wordmark / Logo + Navigation Links aligned to the left */}
          <div className="flex items-center gap-8 xl:gap-10">
            <a
              href="#inicio"
              className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-sm"
              aria-label="AD GLOBAL - Ir al inicio"
            >
              <AdGlobalLogo variant="white" height={34} />
            </a>

            {/* Zone 2: Navigation Links (Desktop) */}
            <nav
              aria-label="Navegación principal"
              className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium tracking-normal text-slate-200"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap shrink-0 hover:text-white transition-colors duration-150 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#3878BE] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Zone 3: Primary Action & Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+51957586421"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors mr-2"
              title="Llámanos a nuestra línea de atención"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono tabular-nums">+51 957 586 421</span>
            </a>

            <button
              onClick={() => onOpenQuote()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-[#2B5C94] hover:bg-[#3878BE] active:bg-[#1E4573] shadow-md shadow-[#2B5C94]/20 hover:shadow-lg hover:shadow-[#2B5C94]/30 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              <span>Cotizar</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {/* Botón Admin -> Redirige al login de administración */}
            <a
              href="#admin"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdminLogin();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 active:bg-white/5 border border-white/15 transition-all duration-200 shrink-0 cursor-pointer shadow-sm hover:shadow-sky-400/20"
              title="Portal de Administración"
              aria-label="Ir a administración"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin</span>
            </a>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101D33] border-b border-white/10 px-4 pt-3 pb-6 shadow-2xl transition-all animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-md text-base font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="text-xs text-slate-400 px-3">
                Línea de atención: <span className="text-white font-mono">+51 957 586 421</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuote();
                }}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#2B5C94] hover:bg-[#3878BE] text-white font-bold text-sm uppercase tracking-wider shadow-md"
              >
                <span>Solicitar Cotización Inmediata</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDrawer();
                }}
                className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 font-bold text-xs uppercase tracking-wider border border-sky-800/50 transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
                <span>Explorar Apartados</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

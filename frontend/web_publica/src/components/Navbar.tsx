import React, { useEffect, useState } from 'react';
import { Menu, Settings, X } from 'lucide-react';
import { SITE } from '@/config/site';
import { AdGlobalLogo } from './AdGlobalLogo';

interface NavbarProps {
  onQuote: () => void;
}

const LINKS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Preguntas', href: '#preguntas' },
  { label: 'Contacto', href: '#contacto' },
];

export const Navbar: React.FC<NavbarProps> = ({ onQuote }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? 'bg-ground/95' : 'bg-transparent'
        }`}
      >
        <div className="wrap flex h-[68px] items-center justify-between gap-6">
          <a href="#inicio" aria-label="AD GLOBAL, ir al inicio">
            <AdGlobalLogo height={26} />
          </a>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-8 text-small lg:flex"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted transition-colors duration-150 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block">
              <button onClick={onQuote} className="btn btn--quote btn--sm">
                Pedir cotización
              </button>
            </span>
            <span className="hidden sm:block">
              <a
                href={SITE.adminUrl}
                aria-label="Ir al panel administrativo"
                title="Panel administrativo"
                className="btn btn--gear"
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
              </a>
            </span>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 text-small text-ink lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
              Menú
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ground p-[var(--margin)]">
          <div className="flex h-[68px] items-center justify-between">
            <AdGlobalLogo height={26} />
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-small text-ink"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
              Cerrar
            </button>
          </div>

          <nav aria-label="Navegación móvil" className="mt-12 flex flex-col gap-5">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[clamp(2rem,8vw,3rem)] leading-none tracking-[-0.03em] text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            onClick={() => {
              setOpen(false);
              onQuote();
            }}
            className="btn btn--quote btn--full mt-auto"
          >
            Pedir cotización
          </button>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { AdGlobalLogo } from './AdGlobalLogo';
import { InfoModal } from './InfoModal';

interface FooterProps {
  onSelectService?: (serviceId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectService }) => {
  const [modalType, setModalType] = useState<'about' | 'privacy' | 'terms' | null>(null);

  const handleServiceClick = (serviceId: string) => {
    if (onSelectService) {
      onSelectService(serviceId);
    } else {
      const el = document.getElementById('servicios');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#233A5E] text-white pt-14 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Logo on Top-Left exactly as seen in 1778035716783_image.png */}
        <div className="mb-10">
          <a href="#inicio" className="inline-block" aria-label="AD GLOBAL - Volver al inicio">
            <AdGlobalLogo variant="white" height={40} />
          </a>
        </div>

        {/* 4 Columns Layout matching the exact provided mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Column 1: Nuestros servicios */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-wide">
              Nuestros servicios
            </h3>
            <ul className="space-y-3 text-sm text-slate-100">
              <li>
                <button
                  onClick={() => handleServiceClick('pantallas-led')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Pantallas LED y Televisores
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('laptops-computadores')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Laptops y Computadores
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('equipos-audiovisuales')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Equipos Audiovisuales
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('tablets')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Tablets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('impresoras-multifuncionales')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Impresoras Multifuncionales
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('desarrollo-web')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Desarrollo Web
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Compañía */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-wide">
              Compañía
            </h3>
            <ul className="space-y-3 text-sm text-slate-100">
              <li>
                <button
                  onClick={() => setModalType('about')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Acerca de nosotros
                </button>
              </li>
              <li>
                <a
                  href="#faqs"
                  className="hover:text-sky-300 transition-colors block text-left"
                >
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contáctanos */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-wide">
              Contáctanos
            </h3>
            <div className="space-y-2 text-sm text-slate-100 font-normal">
              <p>
                <a href="https://wa.me/51957586421" target="_blank" rel="noopener noreferrer" className="hover:text-sky-300 transition-colors">
                  +51 957 586 421
                </a>
              </p>
              <p className="pt-2">
                <a href="mailto:atencionalcliente@adglobalperu.com" className="hover:text-sky-300 transition-colors">
                  atencionalcliente@adglobalperu.com
                </a>
              </p>
              <p className="pt-2 text-slate-200 leading-snug">
                Av. Húsares de Junín 527, Jesús María 15072
              </p>
            </div>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-wide">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-slate-100">
              <li>
                <button
                  onClick={() => setModalType('privacy')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Política de privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalType('terms')}
                  className="hover:text-sky-300 transition-colors text-left"
                >
                  Términos y condiciones
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Bottom Copyright Bar faithfully reproduced from 1778035716783_image.png */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>
            © 2025 AD Global. Todos los derechos reservados. |{' '}
            <button
              onClick={() => setModalType('privacy')}
              className="hover:text-white transition-colors underline"
            >
              Política de Privacidad
            </button>{' '}
            |{' '}
            <button
              onClick={() => setModalType('terms')}
              className="hover:text-white transition-colors underline"
            >
              Términos y Condiciones
            </button>
          </p>
          <p className="text-slate-400">
            Lima, Perú · Cobertura Nacional e Internacional
          </p>
        </div>
      </div>

      {/* Interactive Modal for informational & legal links */}
      <InfoModal type={modalType} onClose={() => setModalType(null)} />
    </footer>
  );
};

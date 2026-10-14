import React, { useState } from 'react';
import { InfoModal } from './InfoModal';

type ModalType = 'privacy' | 'terms' | null;

export const Footer: React.FC = () => {
  const [modal, setModal] = useState<ModalType>(null);
  const year = new Date().getFullYear();
  const link = 'text-muted transition-colors duration-150 hover:text-ink';

  return (
    <footer>
      <div className="wrap grid gap-5 py-10 text-small sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8">
        <p className="text-ink">AD GLOBAL · Alquiler y venta de tecnología</p>

        <nav aria-label="Enlaces del pie" className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-self-center">
          <a href="#servicios" className={link}>
            Servicios
          </a>
          <a href="#nosotros" className={link}>
            Nosotros
          </a>
          <a href="#preguntas" className={link}>
            Preguntas
          </a>
          <a href="#contacto" className={link}>
            Contacto
          </a>
        </nav>

        <p className="text-muted sm:justify-self-end">
          © {year} AD GLOBAL ·{' '}
          <button
            onClick={() => setModal('privacy')}
            className="underline underline-offset-4 transition-colors hover:text-ink"
          >
            Privacidad
          </button>{' '}
          ·{' '}
          <button
            onClick={() => setModal('terms')}
            className="underline underline-offset-4 transition-colors hover:text-ink"
          >
            Términos
          </button>
        </p>
      </div>

      <InfoModal type={modal} onClose={() => setModal(null)} />
    </footer>
  );
};

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { SITE, whatsappLink } from '@/config/site';

export const WhatsAppFloat: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[300px] max-w-[calc(100vw-2.5rem)] bg-paper p-5 text-paper-ink">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body font-medium">Atención AD GLOBAL</p>
              <p className="mt-1 text-small text-paper-muted">
                Respuesta promedio en 5 minutos.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="text-paper-muted transition-colors hover:text-paper-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <a
            href={whatsappLink('Hola AD GLOBAL, deseo cotizar equipos para un proyecto.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--full mt-5"
          >
            Escribir por WhatsApp
          </a>
          <p className="figure mt-3 text-small text-paper-muted">{SITE.phoneDisplay}</p>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Contactar por WhatsApp"
        aria-expanded={open}
        className="btn btn--primary btn--icon"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

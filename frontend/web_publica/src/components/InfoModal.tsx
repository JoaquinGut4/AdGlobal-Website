import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SITE } from '@/config/site';

interface InfoModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

const PRIVACY_BODY = (
  <div className="space-y-4 text-body leading-relaxed text-paper-muted">
    <p>
      En cumplimiento de la Ley N° 29733 (Ley de Protección de Datos Personales del Perú), AD
      GLOBAL garantiza la confidencialidad de los datos que usted nos entrega.
    </p>
    <p>
      Los datos de nuestros formularios (nombre, razón social, correo y teléfono) se usan
      únicamente para elaborar cotizaciones, coordinar la logística y emitir comprobantes. No
      comercializamos ni cedemos bases de datos a terceros.
    </p>
    <p>
      Puede solicitar la rectificación o la supresión de sus datos escribiendo a{' '}
      <span className="text-paper-ink">{SITE.email}</span>.
    </p>
  </div>
);

const TERMS_BODY = (
  <div className="space-y-4 text-body leading-relaxed text-paper-muted">
    <p>
      El arrendamiento de equipos con AD GLOBAL se rige por las siguientes condiciones.
    </p>
    <p>
      <strong className="text-paper-ink">Entrega.</strong> Los equipos se entregan con acta de
      conformidad y pruebas de encendido. El cliente designa un representante acreditado para la
      firma.
    </p>
    <p>
      <strong className="text-paper-ink">Garantía.</strong> AD GLOBAL asume el mantenimiento
      correctivo y la sustitución inmediata de cualquier equipo con fallas durante el plazo del
      alquiler, sin costo adicional.
    </p>
    <p>
      <strong className="text-paper-ink">Facturación.</strong> Los comprobantes se emiten en soles
      o dólares según el acuerdo comercial, sujetos a las detracciones de ley vigentes.
    </p>
  </div>
);

const CONTENT = {
  privacy: { title: 'Política de privacidad', body: PRIVACY_BODY },
  terms: { title: 'Términos y condiciones', body: TERMS_BODY },
} as const;

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    if (!type) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [type, onClose]);

  if (!type) return null;
  const content = CONTENT[type];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      <div
        className="w-full max-w-2xl bg-paper p-6 text-paper-ink sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <h3 className="title">{content.title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-paper-muted transition-colors hover:text-paper-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6">{content.body}</div>
        <button onClick={onClose} className="btn btn--dark mt-8">
          Entendido
        </button>
      </div>
    </div>
  );
};

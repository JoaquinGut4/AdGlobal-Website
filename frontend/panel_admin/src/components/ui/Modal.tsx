import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  /** Clases de color del encabezado (ej. "bg-brand"). */
  headerClass?: string;
  /** Ancho máximo u otras clases del panel. */
  panelClass?: string;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  labelledBy,
  title,
  subtitle,
  icon,
  headerClass = 'bg-brand',
  panelClass = 'max-w-lg',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${panelClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`px-6 py-4 text-white flex items-center justify-between ${headerClass}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold">
              {icon}
            </div>
            <div>
              <h3 id={labelledBy} className="text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              {subtitle && <p className="text-[11px] text-white/80">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

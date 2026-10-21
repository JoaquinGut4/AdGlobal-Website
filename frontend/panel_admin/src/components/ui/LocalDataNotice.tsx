import { HardDrive } from 'lucide-react';

/**
 * Marca los módulos que todavía guardan su operación en este navegador.
 * Los tickets, usuarios y la gestión web sí se sincronizan con la API.
 */
export function LocalDataNotice({ className = '' }: { className?: string }) {
  return (
    <span
      title="Los cambios se guardan en este navegador y aún no se sincronizan con la API."
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ${className}`}
    >
      <HardDrive className="h-3 w-3" aria-hidden="true" />
      Solo este navegador
    </span>
  );
}

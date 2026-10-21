interface ProgressBarProps {
  /** Porcentaje (0-100). Se recorta al rango válido. */
  percent: number;
  /** Clases del relleno (color). */
  fillClass?: string;
  /** Clases del contenedor (alto, fondo). */
  className?: string;
}

export function ProgressBar({
  percent,
  fillClass = 'bg-[#2B5C94]',
  className = 'h-1.5 bg-slate-100',
}: ProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

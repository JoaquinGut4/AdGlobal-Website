import React from 'react';
import logo from '@/assets/logo/adglobal-logo.png';

interface AdGlobalLogoProps {
  className?: string;
  /** Alto del logotipo en píxeles. El ancho se ajusta solo. */
  height?: number;
}

/**
 * Logotipo oficial de AD GLOBAL.
 *
 * El archivo entregado (`src/assets/Logo web/Logo.jpg`) es el logo blanco sobre
 * fondo negro; se convirtió a PNG con transparencia (`src/assets/logo/adglobal-logo.png`)
 * usando la luminancia como canal alfa, para poder colocarlo sobre el fondo oscuro.
 * Es una marca blanca: úsalo solo sobre fondos oscuros.
 */
export const AdGlobalLogo: React.FC<AdGlobalLogoProps> = ({ className = '', height = 26 }) => (
  <img
    src={logo}
    alt="AD GLOBAL"
    width={2200}
    height={512}
    decoding="async"
    className={`block w-auto select-none ${className}`}
    style={{ height: `${height}px` }}
  />
);

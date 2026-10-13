/** Utilidades compartidas del panel administrativo. */

/** Elimina todo lo que no sea dígito (formato requerido por WhatsApp). */
export const digitsOnly = (value: string): string => value.replace(/\D+/g, '');

/** Construye un enlace de WhatsApp con mensaje pre-cargado. */
export const whatsappLink = (telefono: string, message: string): string =>
  `https://wa.me/${digitsOnly(telefono)}?text=${encodeURIComponent(message)}`;

/** Hora actual en formato corto (ej. "03:45 PM"). */
export const horaActual = (): string =>
  new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

/** Antepone "Hoy, " a la hora actual. */
export const marcaTemporalHoy = (): string => `Hoy, ${horaActual()}`;

/** Formatea un número con separadores de miles. */
export const formatNumber = (value: number): string => value.toLocaleString('es-PE');

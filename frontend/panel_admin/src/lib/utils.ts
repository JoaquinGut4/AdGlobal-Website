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

/** Formatea una fecha ISO (YYYY-MM-DD) como DD/MM/AAAA. */
export const formatFecha = (fecha: string): string => {
  if (!fecha) return '';
  const date = new Date(`${fecha}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? fecha
    : date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export interface DireccionLlegada {
  destinatario: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

/** Separa el texto combinado de "dirección de llegada" en sus campos. */
export const parseDireccionLlegada = (direccionLlegada: string): DireccionLlegada => {
  const prefijos = ['Dirección:', 'Distrito:', 'Provincia:', 'Departamento:'];
  const partes = direccionLlegada.split(' · ');
  const obtener = (prefijo: string) => {
    const parte = partes.find((item) => item.trim().startsWith(prefijo));
    return parte ? parte.trim().slice(prefijo.length).trim() : '';
  };
  const destinatarioRaw = partes.find(
    (item) => !prefijos.some((prefijo) => item.trim().startsWith(prefijo)),
  );
  const destinatario = (destinatarioRaw ?? '')
    .replace(/^(Empresa|Persona natural|Persona jurídica):\s*/i, '')
    .trim();
  return {
    destinatario,
    direccion: obtener('Dirección:'),
    distrito: obtener('Distrito:'),
    provincia: obtener('Provincia:'),
    departamento: obtener('Departamento:'),
  };
};

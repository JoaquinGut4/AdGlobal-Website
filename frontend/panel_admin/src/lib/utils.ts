/** Utilidades compartidas del panel administrativo. */

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

/** Dirección legible del destino del pedido, sin repetir el nombre del cliente. */
export const formatDireccionLlegada = (direccionLlegada: string): string => {
  const { direccion, distrito, provincia, departamento } = parseDireccionLlegada(direccionLlegada);
  if (direccion) return [direccion, distrito, provincia, departamento].filter(Boolean).join(', ');
  const raw = direccionLlegada.trim();
  return /(?:Dirección|Distrito|Provincia|Departamento):/i.test(raw) ? '' : raw;
};

import type { ClienteDerivado, ClienteEstado, PedidoRegistro } from '@/types';
import { parseDireccionLlegada } from './utils.ts';

/** Normaliza texto para comparaciones: sin tildes, minúsculas y sin espacios extra. */
export function normalizarTexto(value: unknown): string {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Versión sin espacios ni signos, útil para buscar teléfonos y números de pedido. */
function compactar(value: unknown): string {
  return normalizarTexto(value).replace(/[^a-z0-9]/g, '');
}

function fechaMs(fecha: string): number {
  const time = new Date(fecha).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function tipoCliente(direccionLlegada: string): 'Empresa' | 'Persona natural' {
  const primerSegmento = direccionLlegada.split(' · ')[0] ?? '';
  return /^persona natural:/i.test(primerSegmento.trim()) ? 'Persona natural' : 'Empresa';
}

function ubicacionCliente(direccionLlegada: string): string {
  const { direccion, distrito, provincia, departamento } = parseDireccionLlegada(direccionLlegada);
  const partes = [...new Set([distrito, provincia, departamento].filter(Boolean))];
  return partes.length > 0 ? partes.join(', ') : direccion;
}

function idCliente(nombre: string): string {
  const base = normalizarTexto(nombre)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'cliente-sin-identificar';
}

interface Acumulado {
  nombre: string;
  tipo: ClienteDerivado['tipo'];
  telefono: string;
  telefonoMs: number;
  ubicacion: string;
  ubicacionMs: number;
  pedidos: number;
  pedidosVigentes: number;
  ultimaActividad: string;
  ultimaActividadMs: number;
  numerosPedido: string[];
}

/**
 * Construye el directorio de clientes a partir de los pedidos.
 * El nombre del cliente se toma del destinatario de la dirección de llegada.
 * Un cliente está activo mientras tenga al menos un pedido sin finalizar.
 */
export function derivarClientes(pedidos: PedidoRegistro[]): ClienteDerivado[] {
  const acumulados = new Map<string, Acumulado>();

  for (const pedido of pedidos) {
    const direccionLlegada = pedido.direccionLlegada ?? '';
    const destino = parseDireccionLlegada(direccionLlegada);
    const nombre = destino.destinatario || 'Cliente sin identificar';
    const clave = normalizarTexto(nombre);
    const pedidoMs = fechaMs(pedido.fechaEmision);
    const telefono = pedido.telefonoContacto?.trim() ?? '';
    const ubicacion = ubicacionCliente(direccionLlegada);
    const vigente = pedido.estadoPedido === 'Finalizado' ? 0 : 1;

    const actual = acumulados.get(clave);
    if (!actual) {
      acumulados.set(clave, {
        nombre,
        tipo: tipoCliente(direccionLlegada),
        telefono,
        telefonoMs: pedidoMs,
        ubicacion,
        ubicacionMs: pedidoMs,
        pedidos: 1,
        pedidosVigentes: vigente,
        ultimaActividad: pedido.fechaEmision,
        ultimaActividadMs: pedidoMs,
        numerosPedido: [pedido.numeroPedido],
      });
      continue;
    }

    actual.pedidos += 1;
    actual.pedidosVigentes += vigente;
    if (pedidoMs >= actual.ultimaActividadMs) {
      actual.ultimaActividad = pedido.fechaEmision;
      actual.ultimaActividadMs = pedidoMs;
    }
    if (ubicacion && pedidoMs >= actual.ubicacionMs) {
      actual.ubicacion = ubicacion;
      actual.ubicacionMs = pedidoMs;
    }
    if (telefono && pedidoMs >= actual.telefonoMs) {
      actual.telefono = telefono;
      actual.telefonoMs = pedidoMs;
    }
    if (!actual.numerosPedido.includes(pedido.numeroPedido)) {
      actual.numerosPedido.push(pedido.numeroPedido);
    }
  }

  const idsUsados = new Set<string>();
  return [...acumulados.values()]
    .map((cliente): ClienteDerivado => {
      const base = idCliente(cliente.nombre);
      let id = base;
      let sufijo = 2;
      while (idsUsados.has(id)) id = `${base}-${sufijo++}`;
      idsUsados.add(id);

      const estado: ClienteEstado = cliente.pedidosVigentes > 0 ? 'Activo' : 'Inactivo';
      return {
        id,
        nombre: cliente.nombre,
        tipo: cliente.tipo,
        telefono: cliente.telefono,
        ubicacion: cliente.ubicacion,
        pedidos: cliente.pedidos,
        pedidosVigentes: cliente.pedidosVigentes,
        ultimaActividad: cliente.ultimaActividad,
        estado,
        numerosPedido: [...cliente.numerosPedido].sort(),
      };
    })
    .sort(
      (a, b) =>
        fechaMs(b.ultimaActividad) - fechaMs(a.ultimaActividad) ||
        a.nombre.localeCompare(b.nombre, 'es'),
    );
}

/**
 * Busca clientes por nombre, tipo, ubicación, teléfono, estado o número de pedido.
 * Ignora tildes, mayúsculas y separadores (por ejemplo, teléfonos escritos sin espacios).
 */
export function filtrarClientes(clientes: ClienteDerivado[], busqueda: string): ClienteDerivado[] {
  const terminos = normalizarTexto(busqueda).split(' ').filter(Boolean);
  if (terminos.length === 0) return clientes;

  return clientes.filter((cliente) => {
    const texto = normalizarTexto(
      [
        cliente.nombre,
        cliente.tipo,
        cliente.ubicacion,
        cliente.telefono,
        cliente.estado,
        cliente.numerosPedido.join(' '),
      ].join(' '),
    );
    const textoCompacto = compactar(texto);
    return terminos.every((termino) => {
      const terminoCompacto = termino.replace(/[^a-z0-9]/g, '');
      return (
        texto.includes(termino) ||
        (terminoCompacto.length > 0 && textoCompacto.includes(terminoCompacto))
      );
    });
  });
}

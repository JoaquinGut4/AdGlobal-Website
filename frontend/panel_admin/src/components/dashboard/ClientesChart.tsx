import { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, Search, UserCheck, UserX, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { derivarClientes, filtrarClientes } from '@/lib/clientes';
import { formatFecha } from '@/lib/utils';
import type { ClienteEstado, PedidoRegistro } from '@/types';

interface ClientesChartProps {
  pedidos: PedidoRegistro[];
  onVerDirectorio?: () => void;
}

const CENTRO = 80;
const RADIO_EXTERNO = 67;
const RADIO_INTERNO = 45;
const ANGULO_INICIO = -Math.PI / 2;
const ANGULO_FIN = ANGULO_INICIO + 2 * Math.PI;

function punto(radio: number, angulo: number): string {
  return `${(CENTRO + radio * Math.cos(angulo)).toFixed(2)} ${(CENTRO + radio * Math.sin(angulo)).toFixed(2)}`;
}

/** Sector de dona entre dos ángulos (radianes). */
function segmentoDonut(anguloInicio: number, anguloFin: number): string {
  const arcoGrande = anguloFin - anguloInicio > Math.PI ? 1 : 0;
  return [
    `M ${punto(RADIO_EXTERNO, anguloInicio)}`,
    `A ${RADIO_EXTERNO} ${RADIO_EXTERNO} 0 ${arcoGrande} 1 ${punto(RADIO_EXTERNO, anguloFin)}`,
    `L ${punto(RADIO_INTERNO, anguloFin)}`,
    `A ${RADIO_INTERNO} ${RADIO_INTERNO} 0 ${arcoGrande} 0 ${punto(RADIO_INTERNO, anguloInicio)}`,
    'Z',
  ].join(' ');
}

/** Anillo completo (cuando un único estado concentra el 100 %). */
function donutCompleto(): string {
  return [
    `M ${CENTRO - RADIO_EXTERNO} ${CENTRO}`,
    `A ${RADIO_EXTERNO} ${RADIO_EXTERNO} 0 1 0 ${CENTRO + RADIO_EXTERNO} ${CENTRO}`,
    `A ${RADIO_EXTERNO} ${RADIO_EXTERNO} 0 1 0 ${CENTRO - RADIO_EXTERNO} ${CENTRO}`,
    `M ${CENTRO - RADIO_INTERNO} ${CENTRO}`,
    `A ${RADIO_INTERNO} ${RADIO_INTERNO} 0 1 1 ${CENTRO + RADIO_INTERNO} ${CENTRO}`,
    `A ${RADIO_INTERNO} ${RADIO_INTERNO} 0 1 1 ${CENTRO - RADIO_INTERNO} ${CENTRO}`,
    'Z',
  ].join(' ');
}

/** Gráfico circular de clientes activos/inactivos con la relación filtrable al hacer clic. */
export function ClientesChart({ pedidos, onVerDirectorio }: ClientesChartProps) {
  const clientes = useMemo(() => derivarClientes(pedidos), [pedidos]);
  const activos = clientes.filter((cliente) => cliente.estado === 'Activo').length;
  const inactivos = clientes.length - activos;
  const total = clientes.length;
  const pctActivos = total === 0 ? 0 : Math.round((activos / total) * 100);
  const pctInactivos = total === 0 ? 0 : 100 - pctActivos;

  const [hover, setHover] = useState<ClienteEstado | null>(null);
  const [estadoAbierto, setEstadoAbierto] = useState<ClienteEstado | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const anguloActivoFin =
    total === 0 ? ANGULO_INICIO : ANGULO_INICIO + (2 * Math.PI * activos) / total;

  const abrirRelacion = (estado: ClienteEstado) => {
    setBusqueda('');
    setEstadoAbierto(estado);
  };

  const cerrarRelacion = () => {
    setBusqueda('');
    setEstadoAbierto(null);
  };

  const clientesDelEstado = estadoAbierto
    ? clientes.filter((cliente) => cliente.estado === estadoAbierto)
    : [];
  const visibles = filtrarClientes(clientesDelEstado, busqueda);
  const tituloRelacion = estadoAbierto === 'Inactivo' ? 'Clientes inactivos' : 'Clientes activos';
  const porcentajeRelacion = estadoAbierto === 'Inactivo' ? pctInactivos : pctActivos;

  return (
    <>
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 font-bold text-[#2B5C94]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="flex flex-wrap items-center gap-2 text-base font-bold tracking-tight text-slate-900">
                Clientes por actividad
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {total} {total === 1 ? 'cliente' : 'clientes'} desde pedidos
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Se generan automáticamente a partir de los pedidos registrados.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {activos} activos · {inactivos} inactivos
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <div className="flex flex-col items-center">
            <div className="relative h-48 w-48 sm:h-56 sm:w-56">
              <svg
                viewBox="0 0 160 160"
                className="h-full w-full"
                role="group"
                aria-label={`Distribución de ${total} clientes: ${activos} activos y ${inactivos} inactivos`}
              >
                {total === 0 ? (
                  <circle
                    cx={CENTRO}
                    cy={CENTRO}
                    r={(RADIO_EXTERNO + RADIO_INTERNO) / 2}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={RADIO_EXTERNO - RADIO_INTERNO}
                  />
                ) : (
                  <>
                    {inactivos > 0 && (
                      <path
                        d={
                          inactivos === total
                            ? donutCompleto()
                            : segmentoDonut(anguloActivoFin, ANGULO_FIN)
                        }
                        fill="#94a3b8"
                        fillRule="evenodd"
                        opacity={hover === 'Inactivo' ? 0.75 : 1}
                        className="cursor-pointer transition-opacity duration-200"
                        role="button"
                        tabIndex={0}
                        aria-label={`Ver ${inactivos} clientes inactivos`}
                        onClick={() => abrirRelacion('Inactivo')}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            abrirRelacion('Inactivo');
                          }
                        }}
                        onMouseEnter={() => setHover('Inactivo')}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover('Inactivo')}
                        onBlur={() => setHover(null)}
                      />
                    )}

                    {activos > 0 && (
                      <path
                        d={
                          activos === total
                            ? donutCompleto()
                            : segmentoDonut(ANGULO_INICIO, anguloActivoFin)
                        }
                        fill="#10b981"
                        fillRule="evenodd"
                        opacity={hover === 'Activo' ? 0.8 : 1}
                        className="cursor-pointer transition-opacity duration-200"
                        role="button"
                        tabIndex={0}
                        aria-label={`Ver ${activos} clientes activos`}
                        onClick={() => abrirRelacion('Activo')}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            abrirRelacion('Activo');
                          }
                        }}
                        onMouseEnter={() => setHover('Activo')}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover('Activo')}
                        onBlur={() => setHover(null)}
                      />
                    )}
                  </>
                )}
              </svg>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{total}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {total === 1 ? 'cliente' : 'clientes'}
                </span>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
              Haz clic en un segmento del gráfico
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => abrirRelacion('Activo')}
              disabled={activos === 0}
              className="group flex cursor-pointer flex-col rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600">
                    <UserCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Clientes activos</p>
                    <p className="text-[11px] text-slate-500">Con al menos un pedido vigente</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="block text-2xl font-black text-slate-900">{activos}</span>
                    <span className="text-[10px] font-bold text-emerald-700">{pctActivos}%</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => abrirRelacion('Inactivo')}
              disabled={inactivos === 0}
              className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                    <UserX className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Clientes inactivos</p>
                    <p className="text-[11px] text-slate-500">Todos sus pedidos están finalizados</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="block text-2xl font-black text-slate-900">{inactivos}</span>
                    <span className="text-[10px] font-bold text-slate-500">{pctInactivos}%</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>

            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] leading-relaxed text-slate-500 sm:col-span-2">
              La relación se calcula desde el destinatario de cada pedido. Un cliente pasa a inactivo cuando
              todos sus pedidos han sido finalizados.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">
            {total === 0
              ? 'Aún no hay clientes: registra un pedido para generarlos automáticamente.'
              : 'Selecciona un segmento o una tarjeta para ver la relación y buscar dentro de ella.'}
          </p>
          {onVerDirectorio && (
            <button
              type="button"
              onClick={onVerDirectorio}
              className="group inline-flex cursor-pointer items-center gap-1 self-start text-xs font-bold text-[#2B5C94] hover:text-[#1F4778] sm:self-auto"
            >
              <span>Ver directorio de clientes</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </section>

      <Modal
        isOpen={estadoAbierto !== null}
        onClose={cerrarRelacion}
        labelledBy="clientes-relacion-title"
        title={tituloRelacion}
        subtitle={`${clientesDelEstado.length} ${clientesDelEstado.length === 1 ? 'cliente' : 'clientes'} · ${porcentajeRelacion}% del total · desde pedidos`}
        icon={estadoAbierto === 'Activo' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
        headerClass={estadoAbierto === 'Activo' ? 'bg-emerald-600' : 'bg-slate-600'}
        panelClass="max-w-4xl"
      >
        <div className="flex min-h-0 flex-1 flex-col bg-slate-50/70">
          <div className="border-b border-slate-200 bg-white p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                autoFocus
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar cliente, ubicación, teléfono o número de pedido..."
                aria-label="Buscar dentro de la relación de clientes"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-[#2B5C94] focus:outline-none"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                {visibles.length} de {clientesDelEstado.length}{' '}
                {clientesDelEstado.length === 1 ? 'cliente visible' : 'clientes visibles'}
              </span>
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="cursor-pointer font-semibold text-[#2B5C94] hover:underline"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {visibles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <Users className="h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-600">
                  {clientesDelEstado.length === 0
                    ? `No hay clientes ${estadoAbierto === 'Activo' ? 'activos' : 'inactivos'} registrados`
                    : 'Sin coincidencias para la búsqueda'}
                </p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  {clientesDelEstado.length === 0
                    ? 'La relación se genera automáticamente cuando se registran pedidos.'
                    : 'Prueba con el nombre del cliente, su ubicación, teléfono o número de pedido.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="min-w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {['Cliente', 'Ubicación', 'Contacto', 'Pedidos', 'Última actividad'].map((label) => (
                        <th key={label} className="whitespace-nowrap px-4 py-3">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {visibles.map((cliente) => (
                      <tr key={cliente.id} className="align-top hover:bg-blue-50/30">
                        <td className="min-w-44 px-4 py-3">
                          <p className="font-bold text-slate-800">{cliente.nombre}</p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {cliente.tipo}
                          </p>
                        </td>
                        <td className="min-w-36 px-4 py-3">{cliente.ubicacion || '—'}</td>
                        <td className="min-w-28 whitespace-nowrap px-4 py-3">{cliente.telefono || '—'}</td>
                        <td className="min-w-40 px-4 py-3">
                          <span className="font-mono font-bold text-slate-800">{cliente.pedidos}</span>
                          <span className="ml-1 text-[10px] text-slate-400">
                            ({cliente.pedidosVigentes} {cliente.pedidosVigentes === 1 ? 'vigente' : 'vigentes'})
                          </span>
                          <p
                            className="mt-0.5 max-w-48 truncate font-mono text-[10px] text-slate-400"
                            title={cliente.numerosPedido.join(', ')}
                          >
                            {cliente.numerosPedido.join(' · ')}
                          </p>
                        </td>
                        <td className="min-w-24 px-4 py-3">
                          {formatFecha(cliente.ultimaActividad) || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

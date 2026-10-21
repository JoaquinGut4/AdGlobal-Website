import { useMemo, useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { derivarClientes, filtrarClientes } from '@/lib/clientes';
import { formatFecha } from '@/lib/utils';
import type { ClienteEstado, PedidoRegistro } from '@/types';

type EstadoFiltro = 'Todos' | ClienteEstado;

interface ClientesPageProps {
  pedidos: PedidoRegistro[];
}

export function ClientesPage({ pedidos }: ClientesPageProps) {
  const clientes = useMemo(() => derivarClientes(pedidos), [pedidos]);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('Todos');

  const activos = clientes.filter((cliente) => cliente.estado === 'Activo').length;
  const inactivos = clientes.length - activos;
  const porcentajeActivos = clientes.length === 0 ? 0 : Math.round((activos / clientes.length) * 100);
  const porcentajeInactivos = clientes.length === 0 ? 0 : 100 - porcentajeActivos;

  const clientesDelEstado =
    estadoFiltro === 'Todos'
      ? clientes
      : clientes.filter((cliente) => cliente.estado === estadoFiltro);
  const visibles = filtrarClientes(clientesDelEstado, search);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Directorio de Clientes Corporativos
          </h2>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
            {clientes.length} clientes desde pedidos
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Relación generada automáticamente a partir de los pedidos. Un cliente está activo mientras tenga
          al menos un pedido vigente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setEstadoFiltro(estadoFiltro === 'Activo' ? 'Todos' : 'Activo')}
          className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
            estadoFiltro === 'Activo'
              ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              {porcentajeActivos}% del total
            </span>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Clientes activos</p>
          <span className="mt-1 block text-2xl font-black text-slate-900">{activos}</span>
          <p className="mt-1 text-[11px] text-slate-500">Con al menos un pedido vigente</p>
        </button>

        <button
          type="button"
          onClick={() => setEstadoFiltro(estadoFiltro === 'Inactivo' ? 'Todos' : 'Inactivo')}
          className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
            estadoFiltro === 'Inactivo'
              ? 'border-slate-500 bg-slate-100 ring-2 ring-slate-400/20'
              : 'border-slate-200 bg-white hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600">
              <UserX className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {porcentajeInactivos}% del total
            </span>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Clientes inactivos</p>
          <span className="mt-1 block text-2xl font-black text-slate-900">{inactivos}</span>
          <p className="mt-1 text-[11px] text-slate-500">Todos sus pedidos están finalizados</p>
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="relative w-full sm:max-w-xl sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente, ubicación, teléfono o pedido..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-[#2B5C94] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(['Todos', 'Activo', 'Inactivo'] as EstadoFiltro[]).map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setEstadoFiltro(estado)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  estadoFiltro === estado
                    ? 'bg-[#2B5C94] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {estado === 'Todos' ? 'Todos' : `${estado}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <span className="text-xs font-bold text-slate-800">
            {estadoFiltro === 'Todos' ? 'Todos los clientes' : `Clientes ${estadoFiltro.toLowerCase()}s`}
          </span>
          <span className="text-[11px] text-slate-500">{visibles.length} clientes visibles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {['Cliente', 'Ubicación', 'Contacto', 'Pedidos', 'Última actividad', 'Estado'].map((label) => (
                  <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    {clientes.length === 0
                      ? 'Aún no hay clientes. Se generan automáticamente al registrar pedidos.'
                      : 'No se encontraron clientes con los criterios seleccionados.'}
                  </td>
                </tr>
              ) : visibles.map((cliente) => (
                <tr key={cliente.id} className="align-top hover:bg-blue-50/30">
                  <td className="min-w-56 px-4 py-3">
                    <p className="font-bold text-slate-800">{cliente.nombre}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {cliente.tipo}
                    </p>
                  </td>
                  <td className="min-w-44 px-4 py-3">{cliente.ubicacion || '—'}</td>
                  <td className="min-w-32 whitespace-nowrap px-4 py-3">{cliente.telefono || '—'}</td>
                  <td className="min-w-44 px-4 py-3">
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
                  <td className="min-w-28 whitespace-nowrap px-4 py-3">
                    {formatFecha(cliente.ultimaActividad) || '—'}
                  </td>
                  <td className="min-w-24 px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                        cliente.estado === 'Activo'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cliente.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

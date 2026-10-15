import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  Laptop,
  Monitor,
  Package,
  Plus,
  Printer,
  Search,
  Tablet,
  Truck,
  Tv,
  Wrench,
} from 'lucide-react';
import { InventoryModal } from '@/components/modals/InventoryModal';
import { STORAGE_KEYS } from '@/config/site';
import {
  FLOTA_RESUMEN,
  INVENTARIO_REGISTROS,
  porcentajeFlota,
} from '@/data/inventario';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type {
  InventarioCategoria,
  InventarioCategoriaBaseId,
  InventarioCategoriaId,
  InventarioFiltro,
  InventarioRegistro,
} from '@/types';

interface InventarioPageProps {
  filtro: InventarioFiltro;
  onFiltroChange: (filtro: InventarioFiltro) => void;
  categoriasPersonalizadas: InventarioCategoria[];
  onAgregarCategoria: (categoria: InventarioCategoria) => void;
}

type CampoInventario = keyof InventarioRegistro;

interface ColumnaInventario {
  key: CampoInventario;
  label: string;
  width?: string;
}

const COLUMNAS_COMUNES: ColumnaInventario[] = [
  { key: 'sku', label: 'SKU', width: 'min-w-28' },
  { key: 'categoria', label: 'Categoría', width: 'min-w-24' },
];

const COLUMNAS_COMPRA: ColumnaInventario[] = [
  { key: 'fechaCompra', label: 'Fecha de compra', width: 'min-w-32' },
  { key: 'facturaGuiaCompra', label: 'Factura/Guía compra', width: 'min-w-40' },
  { key: 'precio', label: 'Precio', width: 'min-w-28' },
  { key: 'proveedor', label: 'Proveedor', width: 'min-w-36' },
];

const COLUMNAS_CIERRE: ColumnaInventario[] = [
  { key: 'estado', label: 'Estado', width: 'min-w-32' },
  { key: 'observaciones', label: 'Observaciones', width: 'min-w-56' },
];

const COLUMNAS_POR_CATEGORIA: Record<InventarioCategoriaBaseId, ColumnaInventario[]> = {
  laptops: [
    ...COLUMNAS_COMUNES,
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Número serial', width: 'min-w-36' },
    { key: 'procesador', label: 'Procesador', width: 'min-w-36' },
    { key: 'ghz', label: 'GHz' },
    { key: 'generacion', label: 'Generación' },
    { key: 'pantalla', label: 'Pantalla' },
    { key: 'memoriaRam', label: 'Memoria RAM' },
    { key: 'memoriaInterna', label: 'Memoria interna' },
    { key: 'tipoMemoriaInterna', label: 'Tipo de memoria interna', width: 'min-w-44' },
    ...COLUMNAS_COMPRA,
    ...COLUMNAS_CIERRE,
  ],
  computadoras: [
    ...COLUMNAS_COMUNES,
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Número serial', width: 'min-w-36' },
    { key: 'procesador', label: 'Procesador', width: 'min-w-36' },
    { key: 'ghz', label: 'GHz' },
    { key: 'generacion', label: 'Generación' },
    { key: 'memoriaRam', label: 'Memoria RAM' },
    { key: 'memoriaInterna', label: 'Memoria interna' },
    { key: 'tipoMemoriaInterna', label: 'Tipo de memoria interna', width: 'min-w-44' },
    ...COLUMNAS_COMPRA,
    ...COLUMNAS_CIERRE,
  ],
  monitores: [
    ...COLUMNAS_COMUNES,
    { key: 'item', label: 'Item' },
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Número serial', width: 'min-w-36' },
    { key: 'pantalla', label: 'Pantalla' },
    ...COLUMNAS_COMPRA,
    { key: 'alquiler', label: 'Alquiler' },
    ...COLUMNAS_CIERRE,
  ],
  tablets: [
    ...COLUMNAS_COMUNES,
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Núm. serial', width: 'min-w-36' },
    { key: 'procesador', label: 'Procesador', width: 'min-w-40' },
    { key: 'generacion', label: 'Generación' },
    { key: 'pantalla', label: 'Pantalla' },
    { key: 'memoriaRam', label: 'Memoria RAM' },
    { key: 'memoriaInterna', label: 'Memoria interna' },
    ...COLUMNAS_COMPRA,
    ...COLUMNAS_CIERRE,
  ],
  televisores: [
    ...COLUMNAS_COMUNES,
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Núm. serial', width: 'min-w-36' },
    { key: 'modelo', label: 'Modelo', width: 'min-w-32' },
    { key: 'pantalla', label: 'Pantalla' },
    ...COLUMNAS_COMPRA,
    ...COLUMNAS_CIERRE,
  ],
  impresoras: [
    ...COLUMNAS_COMUNES,
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Núm. serial', width: 'min-w-36' },
    { key: 'modelo', label: 'Modelo', width: 'min-w-32' },
    ...COLUMNAS_COMPRA,
    ...COLUMNAS_CIERRE,
  ],
  proyectores: [
    ...COLUMNAS_COMUNES,
    { key: 'item', label: 'Item' },
    { key: 'marca', label: 'Marca' },
    { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
    { key: 'numeroSerial', label: 'Núm. serial', width: 'min-w-36' },
    { key: 'modelo', label: 'Modelo', width: 'min-w-32' },
    ...COLUMNAS_COMPRA,
    ...COLUMNAS_CIERRE,
  ],
};

const CATEGORIAS_BASE: Array<{
  id: InventarioCategoriaBaseId;
  label: string;
  codigo: number;
  icon: typeof Laptop;
}> = [
  { id: 'laptops', label: 'Laptops', codigo: 1, icon: Laptop },
  { id: 'computadoras', label: 'Computadoras', codigo: 2, icon: Package },
  { id: 'monitores', label: 'Monitores', codigo: 3, icon: Monitor },
  { id: 'tablets', label: 'Tablets', codigo: 4, icon: Tablet },
  { id: 'televisores', label: 'Televisores', codigo: 5, icon: Tv },
  { id: 'impresoras', label: 'Impresoras', codigo: 6, icon: Printer },
  { id: 'proyectores', label: 'Proyectores', codigo: 7, icon: Monitor },
];

const FILTROS: { id: InventarioFiltro; label: string }[] = [
  { id: 'all', label: 'Todos los estados' },
  { id: 'alquiler', label: 'En alquiler' },
  { id: 'oficina', label: 'En oficina/almacén' },
  { id: 'taller', label: 'En taller' },
];

const precioFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

function normalizarBusqueda(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function coincideEstado(registro: InventarioRegistro, filtro: InventarioFiltro) {
  if (filtro === 'all') return true;
  const estado = registro.estado.toLowerCase();
  if (filtro === 'alquiler') return estado.includes('alquiler');
  if (filtro === 'oficina') return estado.includes('oficina') || estado.includes('almacén');
  return estado.includes('taller') || estado.includes('reparación') || estado.includes('mantenimiento');
}

function EstadoBadge({ estado }: { estado: string }) {
  const normalizado = estado.toLowerCase();
  const tone = normalizado.includes('alquiler')
    ? 'bg-blue-50 text-[#2B5C94] border-blue-200'
    : normalizado.includes('reparación') || normalizado.includes('taller')
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone}`}>
      {estado}
    </span>
  );
}

function valorCelda(registro: InventarioRegistro, campo: CampoInventario) {
  if (campo === 'precio') return precioFormatter.format(registro.precio);
  if (campo === 'estado') return <EstadoBadge estado={registro.estado} />;
  const value = registro[campo];
  return value === undefined || value === '' ? '—' : String(value);
}

function InventarioResumen({
  filtro,
  onFiltroChange,
}: {
  filtro: InventarioFiltro;
  onFiltroChange: (filtro: InventarioFiltro) => void;
}) {
  const tarjetas = [
    {
      id: 'alquiler' as const,
      label: 'Equipos en alquiler',
      value: FLOTA_RESUMEN.alquiler,
      icon: Truck,
      color: 'blue',
      detail: 'Servicios activos en campo',
    },
    {
      id: 'oficina' as const,
      label: 'Equipos en oficina',
      value: FLOTA_RESUMEN.oficina,
      icon: Building2,
      color: 'emerald',
      detail: 'Listos para despacho en almacén',
    },
    {
      id: 'taller' as const,
      label: 'Equipos en taller',
      value: FLOTA_RESUMEN.taller,
      icon: Wrench,
      color: 'amber',
      detail: 'En reparación o mantenimiento',
    },
  ];

  const tones = {
    blue: {
      active: 'bg-blue-50/80 border-[#2B5C94] ring-[#2B5C94]/20',
      hover: 'hover:border-blue-300',
      icon: 'bg-blue-50 text-[#2B5C94] border-blue-100',
      badge: 'bg-blue-50 text-[#2B5C94] border-blue-200',
    },
    emerald: {
      active: 'bg-emerald-50/80 border-emerald-500 ring-emerald-500/20',
      hover: 'hover:border-emerald-300',
      icon: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    amber: {
      active: 'bg-amber-50/80 border-amber-500 ring-amber-500/20',
      hover: 'hover:border-amber-300',
      icon: 'bg-amber-50 text-amber-700 border-amber-100',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tarjetas.map((tarjeta) => {
        const Icon = tarjeta.icon;
        const tone = tones[tarjeta.color as keyof typeof tones];
        const active = filtro === tarjeta.id;
        const pct = Math.round(porcentajeFlota(tarjeta.value) * 10) / 10;
        return (
          <button
            key={tarjeta.id}
            type="button"
            onClick={() => onFiltroChange(active ? 'all' : tarjeta.id)}
            className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
              active
                ? `${tone.active} ring-2 shadow-xs`
                : `border-slate-200 bg-white ${tone.hover} hover:shadow-2xs`
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tone.icon}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone.badge}`}>
                {pct}% de flota
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{tarjeta.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{tarjeta.value}</span>
              <span className="text-xs text-slate-400">/ {FLOTA_RESUMEN.total} unidades</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">{tarjeta.detail}</p>
          </button>
        );
      })}
    </div>
  );
}

export function InventarioPage({
  filtro,
  onFiltroChange,
  categoriasPersonalizadas,
  onAgregarCategoria,
}: InventarioPageProps) {
  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<InventarioCategoriaId>('laptops');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [registrosInventario, setRegistrosInventario] = useLocalStorage<InventarioRegistro[]>(
    STORAGE_KEYS.inventario,
    INVENTARIO_REGISTROS,
  );
  const categorias = [
    ...CATEGORIAS_BASE,
    ...categoriasPersonalizadas.map((item) => ({ ...item, icon: Package })),
  ];
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoria = categorias.find((item) => item.id === categoriaActiva) ?? categorias[0];
  const CategoriaIcon = categoria.icon;
  const columnas =
    COLUMNAS_POR_CATEGORIA[categoriaActiva as InventarioCategoriaBaseId] ?? [
      ...COLUMNAS_COMUNES,
      { key: 'marca' as const, label: 'Marca' },
      { key: 'descripcion' as const, label: 'Descripción del equipo', width: 'min-w-52' },
      { key: 'numeroSerial' as const, label: 'Número serial', width: 'min-w-36' },
      ...COLUMNAS_COMPRA,
      ...COLUMNAS_CIERRE,
    ];
  const terminosBusqueda = normalizarBusqueda(search).split(/\s+/).filter(Boolean);

  const registros = registrosInventario.filter((registro) => {
    if (registro.categoriaId !== categoriaActiva || !coincideEstado(registro, filtro)) return false;
    if (terminosBusqueda.length === 0) return true;

    const especificaciones = normalizarBusqueda([
      ...Object.values(registro),
      precioFormatter.format(registro.precio),
      categoria.label,
    ].join(' '));

    return terminosBusqueda.every((termino) => especificaciones.includes(termino));
  });
  const productosAgregados = registrosInventario.filter((registro) => registro.id.startsWith('inv-')).length;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Control de Inventario de Equipos
              </h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
                {FLOTA_RESUMEN.total + productosAgregados} equipos registrados
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Fichas técnicas y distribución operativa por categoría de activo
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInventoryModalOpen(true)}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1F4778]"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <InventarioResumen filtro={filtro} onFiltroChange={onFiltroChange} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventario por categoría</h3>
              <p className="text-[11px] text-slate-500">
                Selecciona un tipo de equipo para consultar sus campos específicos.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
              {categorias.length} categorías
            </span>
          </div>

        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="flex w-full min-w-0 items-center gap-2 sm:max-w-2xl sm:flex-1">
            <div ref={categoryMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={isCategoryMenuOpen}
                className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
                  isCategoryMenuOpen
                    ? 'border-[#2B5C94] bg-blue-50 text-[#2B5C94]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <CategoriaIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{categoria.label}</span>
                <span className="text-slate-400">#{categoria.codigo}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isCategoryMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                >
                  <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Filtrar categoría
                  </div>
                  {categorias.map((item) => {
                    const Icon = item.icon;
                    const active = categoriaActiva === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          setCategoriaActiva(item.id);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          active
                            ? 'bg-blue-50 font-bold text-[#2B5C94]'
                            : 'font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <span className={active ? 'text-blue-400' : 'text-slate-400'}>
                          #{item.codigo}
                        </span>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="SKU, serie, marca, procesador, RAM..."
                aria-label={`Buscar por especificaciones en ${categoria.label}`}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-[#2B5C94] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {FILTROS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onFiltroChange(item.id)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filtro === item.id
                    ? 'bg-[#2B5C94] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">{categoria.label}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              Categoría {categoria.codigo}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {registros.length} {registros.length === 1 ? 'registro visible' : 'registros visibles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {columnas.map((columna, index) => (
                  <th
                    key={columna.key}
                    scope="col"
                    className={`whitespace-nowrap px-3 py-3 ${columna.width ?? 'min-w-28'} ${
                      index === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : ''
                    }`}
                  >
                    {columna.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={columnas.length} className="px-6 py-12 text-center text-sm text-slate-500">
                    No se encontraron activos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                registros.map((registro) => (
                  <tr key={registro.id} className="group hover:bg-blue-50/30">
                    {columnas.map((columna, index) => (
                      <td
                        key={columna.key}
                        className={`px-3 py-3 align-top ${columna.width ?? 'min-w-28'} ${
                          index === 0
                            ? 'sticky left-0 z-10 bg-white font-mono font-bold text-[#2B5C94] shadow-[1px_0_0_#f1f5f9] group-hover:bg-[#f8fbff]'
                            : columna.key === 'descripcion' || columna.key === 'observaciones'
                              ? 'whitespace-normal leading-relaxed'
                              : 'whitespace-nowrap'
                        }`}
                      >
                        {valorCelda(registro, columna.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px] text-slate-500">
          <span className="font-bold text-slate-600">Consejo:</span>
          Desplázate horizontalmente para consultar todos los campos de la ficha técnica.
        </div>
      </section>

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onCreate={(registro) => {
          setRegistrosInventario((current) => [registro, ...current]);
          setCategoriaActiva(registro.categoriaId);
          onFiltroChange('all');
          setSearch('');
          setIsInventoryModalOpen(false);
        }}
        categorias={categorias.map(({ id, label, codigo }) => ({ id, label, codigo }))}
        onCreateCategory={onAgregarCategoria}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Laptop,
  Monitor,
  Package,
  Pencil,
  Plus,
  Printer,
  Search,
  Tablet,
  Trash2,
  Tv,
} from 'lucide-react';
import { InventoryModal } from '@/components/modals/InventoryModal';
import { Modal } from '@/components/ui/Modal';
import { STORAGE_KEYS } from '@/config/site';
import {
  FLOTA_RESUMEN,
  INVENTARIO_REGISTROS,
} from '@/data/inventario';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type {
  InventarioCategoria,
  InventarioCategoriaBaseId,
  InventarioCategoriaId,
  InventarioFiltro,
  InventarioRegistro,
  MovimientoAccion,
} from '@/types';

interface InventarioPageProps {
  filtro: InventarioFiltro;
  onFiltroChange: (filtro: InventarioFiltro) => void;
  categoriasPersonalizadas: InventarioCategoria[];
  onAgregarCategoria: (categoria: InventarioCategoria) => void;
  onRegistrarMovimiento: (
    accion: Extract<MovimientoAccion, 'Agregó' | 'Modificó' | 'Eliminó'>,
    registro: InventarioRegistro,
  ) => void;
}

type CampoInventario = keyof InventarioRegistro;
type CampoInventarioTabla = CampoInventario | `custom:${string}`;

interface ColumnaInventario {
  key: CampoInventarioTabla;
  label: string;
  width?: string;
}

const COLUMNAS_COMUNES: ColumnaInventario[] = [
  { key: 'sku', label: 'SKU', width: 'min-w-28' },
  { key: 'qr', label: 'Código QR', width: 'min-w-32' },
  { key: 'foto', label: 'Foto', width: 'min-w-24' },
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

const COLUMNAS_CATEGORIA_PERSONALIZADA: ColumnaInventario[] = [
  ...COLUMNAS_COMUNES,
  { key: 'marca', label: 'Marca' },
  { key: 'descripcion', label: 'Descripción del equipo', width: 'min-w-52' },
  { key: 'numeroSerial', label: 'Número serial', width: 'min-w-36' },
  ...COLUMNAS_COMPRA,
  ...COLUMNAS_CIERRE,
];

function obtenerColumnas(
  categoriaId: InventarioCategoriaId,
  categoriasPersonalizadas: InventarioCategoria[] = [],
) {
  const columnasBase = COLUMNAS_POR_CATEGORIA[categoriaId as InventarioCategoriaBaseId];
  if (columnasBase) return columnasBase;

  const categoria = categoriasPersonalizadas.find((item) => item.id === categoriaId);
  const columnasPersonalizadas: ColumnaInventario[] = (categoria?.camposPersonalizados ?? []).map(
    (field) => ({ key: `custom:${field.id}`, label: field.label, width: 'min-w-32' }),
  );

  return [
    ...COLUMNAS_CATEGORIA_PERSONALIZADA.slice(0, 7),
    ...columnasPersonalizadas,
    ...COLUMNAS_CATEGORIA_PERSONALIZADA.slice(7),
  ];
}

const CATEGORIAS_BASE: Array<InventarioCategoria & { icon: typeof Laptop }> = [
  { id: 'laptops', label: 'Laptops', codigo: 1, icon: Laptop },
  { id: 'computadoras', label: 'Computadoras', codigo: 2, icon: Package },
  { id: 'monitores', label: 'Monitores', codigo: 3, icon: Monitor },
  { id: 'tablets', label: 'Tablets', codigo: 4, icon: Tablet },
  { id: 'televisores', label: 'Televisores', codigo: 5, icon: Tv },
  { id: 'impresoras', label: 'Impresoras', codigo: 6, icon: Printer },
  { id: 'proyectores', label: 'Proyectores', codigo: 7, icon: Monitor },
];

const ESTADOS_BASE = [
  { id: 'all', label: 'Todos los estados' },
  { id: 'alquiler', label: 'En alquiler' },
  { id: 'oficina', label: 'En oficina/almacén' },
  { id: 'taller', label: 'En taller' },
] as const;

const ESTADOS_REGISTRO_BASE = [
  'Almacén 1',
  'Oficina',
  'Alquiler',
  'Reparación',
  'Taller',
  'Mantenimiento',
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

function coincideEstado(registro: InventarioRegistro, filtro: string) {
  if (filtro === 'all') return true;
  const estado = registro.estado.toLowerCase();
  if (filtro === 'alquiler') return estado.includes('alquiler');
  if (filtro === 'oficina') return estado.includes('oficina') || estado.includes('almacén');
  if (filtro === 'taller') {
    return estado.includes('taller') || estado.includes('reparación') || estado.includes('mantenimiento');
  }
  return estado === filtro.replace(/^custom:/, '').toLowerCase();
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

function valorCelda(registro: InventarioRegistro, campo: CampoInventarioTabla, detail = false) {
  if (campo.startsWith('custom:')) {
    return registro.especificacionesPersonalizadas?.[campo.replace('custom:', '')] || '—';
  }
  const campoBase = campo as CampoInventario;
  if (campoBase === 'foto') {
    return registro.foto ? (
      <img
        src={registro.foto}
        alt={`Foto de ${registro.descripcion}`}
        className={detail ? 'max-h-64 max-w-full rounded-xl object-contain' : 'h-8 w-10 rounded-md object-cover'}
      />
    ) : (
      <span className="text-slate-400">Sin foto</span>
    );
  }
  if (campoBase === 'precio') return precioFormatter.format(registro.precio);
  if (campoBase === 'estado') return <EstadoBadge estado={registro.estado} />;
  const value = registro[campoBase];
  return value === undefined || value === '' ? '—' : String(value);
}

function DetallesInventario({
  registro,
  categoriasPersonalizadas,
}: {
  registro: InventarioRegistro;
  categoriasPersonalizadas: InventarioCategoria[];
}) {
  const columnas = obtenerColumnas(registro.categoriaId, categoriasPersonalizadas);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="w-56 px-4 py-3">Campo</th>
              <th className="px-4 py-3">Información</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {columnas.map((columna) => (
              <tr key={columna.key} className="align-top hover:bg-slate-50/70">
                <th scope="row" className="w-56 bg-slate-50/50 px-4 py-3 font-bold text-slate-500">
                  {columna.label}
                </th>
                <td className="px-4 py-3 leading-relaxed text-slate-700">
                  {valorCelda(registro, columna.key, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventarioPage({
  filtro,
  onFiltroChange,
  categoriasPersonalizadas,
  onAgregarCategoria,
  onRegistrarMovimiento,
}: InventarioPageProps) {
  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<InventarioCategoriaId>('laptops');
  const [estadoActivo, setEstadoActivo] = useState<string>(filtro);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<InventarioRegistro | null>(null);
  const [selectedRegistro, setSelectedRegistro] = useState<InventarioRegistro | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [registrosInventario, setRegistrosInventario] = useLocalStorage<InventarioRegistro[]>(
    STORAGE_KEYS.inventario,
    INVENTARIO_REGISTROS,
  );
  const categorias = [
    ...CATEGORIAS_BASE,
    ...categoriasPersonalizadas.map((item) => ({ ...item, icon: Package })),
  ];
  const [estadosPersonalizados, setEstadosPersonalizados] = useLocalStorage<string[]>(
    STORAGE_KEYS.inventarioEstados,
    [],
  );
  const estadosRegistro = [...ESTADOS_REGISTRO_BASE, ...estadosPersonalizados];
  const filtrosEstado = [
    ...ESTADOS_BASE,
    ...estadosPersonalizados.map((estado) => ({ id: `custom:${estado}`, label: estado })),
  ];
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const categoria = categorias.find((item) => item.id === categoriaActiva) ?? categorias[0];
  const CategoriaIcon = categoria.icon;
  const columnas = obtenerColumnas(categoriaActiva, categoriasPersonalizadas);
  const columnasVisibles = columnas.slice(0, 8);
  const terminosBusqueda = normalizarBusqueda(search).split(/\s+/).filter(Boolean);

  const registros = registrosInventario.filter((registro) => {
    if (registro.categoriaId !== categoriaActiva || !coincideEstado(registro, estadoActivo)) return false;
    if (terminosBusqueda.length === 0) return true;

    const especificaciones = normalizarBusqueda([
      ...Object.values(registro),
      precioFormatter.format(registro.precio),
      categoria.label,
    ].join(' '));

    return terminosBusqueda.every((termino) => especificaciones.includes(termino));
  });
  const productosAgregados = registrosInventario.filter((registro) => registro.id.startsWith('inv-')).length;
  const estadoLabel = filtrosEstado.find((item) => item.id === estadoActivo)?.label ?? 'Estados';

  const agregarEstado = () => {
    const estado = nuevoEstado.trim();
    if (!estado) return;
    if (!estadosRegistro.some((item) => item.toLowerCase() === estado.toLowerCase())) {
      setEstadosPersonalizados((current) => [...current, estado]);
    }
    setEstadoActivo(`custom:${estado}`);
    setNuevoEstado('');
    setIsStatusMenuOpen(false);
  };

  const eliminarProducto = (registro: InventarioRegistro) => {
    const confirmed = window.confirm(
      `¿Eliminar el producto ${registro.sku} del inventario? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setRegistrosInventario((current) => current.filter((item) => item.id !== registro.id));
    onRegistrarMovimiento('Eliminó', registro);
    if (selectedRegistro?.id === registro.id) setSelectedRegistro(null);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (!statusMenuRef.current?.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    setEstadoActivo(filtro);
  }, [filtro]);

  useEffect(() => {
    setRegistrosInventario((current) => {
      if (current.every((registro) => Boolean(registro.qr) && 'foto' in registro)) return current;
      return current.map((registro) => ({
        ...registro,
        qr: registro.qr || `QR-${registro.sku}`,
        foto: registro.foto ?? '',
      }));
    });
  }, [setRegistrosInventario]);

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
            onClick={() => {
              setEditingRegistro(null);
              setIsInventoryModalOpen(true);
            }}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1F4778]"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
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

          <div ref={statusMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={isStatusMenuOpen}
              className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
                isStatusMenuOpen
                  ? 'border-[#2B5C94] bg-blue-50 text-[#2B5C94]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              <span>{estadoLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusMenuOpen && (
              <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Filtrar por estado
                </div>
                {filtrosEstado.map((item) => {
                  const active = estadoActivo === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        setEstadoActivo(item.id);
                        if (!item.id.startsWith('custom:')) {
                          onFiltroChange(item.id as InventarioFiltro);
                        }
                        setIsStatusMenuOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs ${
                        active
                          ? 'bg-blue-50 font-bold text-[#2B5C94]'
                          : 'font-semibold text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}

                <div className="mt-1 border-t border-slate-100 p-2">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Agregar nuevo estado
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevoEstado}
                      onChange={(event) => setNuevoEstado(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          agregarEstado();
                        }
                      }}
                      placeholder="Ej. En tránsito"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#2B5C94] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={agregarEstado}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#2B5C94] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#1F4778]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}
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
          <table className="w-full min-w-[900px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {columnasVisibles.map((columna, index) => (
                  <th
                    key={columna.key}
                    scope="col"
                    className={`break-words px-2 py-2.5 text-[9px] leading-tight ${
                      index === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_#e2e8f0]' : ''
                    }`}
                    style={{
                      width:
                        columna.key === 'descripcion'
                          ? '17%'
                          : columna.key === 'foto'
                            ? '7%'
                            : '10%',
                    }}
                  >
                    {columna.label}
                  </th>
                ))}
                <th scope="col" className="w-[8%] px-2 py-2.5 text-center text-[9px] leading-tight">
                  Eliminar
                </th>
                <th scope="col" className="w-[8%] px-2 py-2.5 text-center text-[9px] leading-tight">
                  Editar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={columnasVisibles.length + 2} className="px-6 py-12 text-center text-sm text-slate-500">
                    No se encontraron activos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                registros.map((registro) => (
                  <tr
                    key={registro.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver detalle del activo ${registro.sku}`}
                    onClick={() => setSelectedRegistro(registro)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedRegistro(registro);
                      }
                    }}
                    className="group cursor-pointer hover:bg-blue-50/30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2B5C94]"
                  >
                    {columnasVisibles.map((columna, index) => (
                      <td
                        key={columna.key}
                        className={`break-words px-2 py-2.5 align-top text-[11px] leading-snug ${
                          index === 0
                            ? 'sticky left-0 z-10 bg-white font-mono font-bold text-[#2B5C94] shadow-[1px_0_0_#f1f5f9] group-hover:bg-[#f8fbff]'
                            : ''
                        }`}
                      >
                        {valorCelda(registro, columna.key)}
                      </td>
                    ))}
                    <td className="px-1.5 py-2.5 text-center align-top">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          eliminarProducto(registro);
                        }}
                        aria-label={`Eliminar producto ${registro.sku}`}
                        title={`Eliminar ${registro.sku}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-bold text-rose-700 transition-colors hover:border-rose-400 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </td>
                    <td className="px-1.5 py-2.5 text-center align-top">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingRegistro(registro);
                          setIsInventoryModalOpen(true);
                        }}
                        aria-label={`Editar producto ${registro.sku}`}
                        title={`Editar ${registro.sku}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] font-bold text-[#2B5C94] transition-colors hover:border-[#2B5C94] hover:bg-blue-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px] text-slate-500">
          <span className="font-bold text-slate-600">
            {registros.length} {registros.length === 1 ? 'producto mostrado' : 'productos mostrados'}
          </span>
          en la tabla actual.
        </div>
      </section>

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => {
          setIsInventoryModalOpen(false);
          setEditingRegistro(null);
        }}
        onCreate={(registro) => {
          setRegistrosInventario((current) => [registro, ...current]);
          onRegistrarMovimiento('Agregó', registro);
          setCategoriaActiva(registro.categoriaId);
          onFiltroChange('all');
          setSearch('');
          setIsInventoryModalOpen(false);
        }}
        editingRegistro={editingRegistro}
        onUpdate={(registro) => {
          setRegistrosInventario((current) =>
            current.map((item) => (item.id === registro.id ? registro : item)),
          );
          onRegistrarMovimiento('Modificó', registro);
          setCategoriaActiva(registro.categoriaId);
          setEditingRegistro(null);
          setIsInventoryModalOpen(false);
        }}
        categorias={categorias.map(({ id, label, codigo, camposPersonalizados }) => ({
          id,
          label,
          codigo,
          camposPersonalizados,
        }))}
        onCreateCategory={onAgregarCategoria}
        estados={estadosRegistro}
        existingSkus={registrosInventario
          .filter((registro) => registro.id !== editingRegistro?.id)
          .map((registro) => registro.sku)}
        existingQrs={registrosInventario
          .filter((registro) => registro.id !== editingRegistro?.id)
          .map((registro) => registro.qr)}
      />

      <Modal
        isOpen={selectedRegistro !== null}
        onClose={() => setSelectedRegistro(null)}
        labelledBy="inventory-detail-modal-title"
        title={selectedRegistro ? `Activo ${selectedRegistro.sku}` : 'Detalle del activo'}
        subtitle={selectedRegistro?.descripcion}
        icon={<Package className="h-4 w-4" />}
        headerClass="bg-[#2B5C94]"
        panelClass="max-w-4xl"
      >
        {selectedRegistro && (
          <DetallesInventario
            registro={selectedRegistro}
            categoriasPersonalizadas={categoriasPersonalizadas}
          />
        )}
      </Modal>
    </div>
  );
}

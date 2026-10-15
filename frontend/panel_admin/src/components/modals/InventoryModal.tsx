import { useState } from 'react';
import type { FormEvent } from 'react';
import { PackagePlus, Plus, Tags } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type {
  InventarioCategoria,
  InventarioCategoriaBaseId,
  InventarioCategoriaId,
  InventarioRegistro,
} from '@/types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (registro: InventarioRegistro) => void;
  categorias: InventarioCategoria[];
  onCreateCategory: (categoria: InventarioCategoria) => void;
}

type CampoFormulario = Exclude<
  keyof InventarioRegistro,
  'id' | 'categoriaId' | 'categoria' | 'precio'
> | 'precio';

interface CampoConfig {
  key: CampoFormulario;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  wide?: boolean;
}

const BASE_FIELDS: CampoConfig[] = [
  { key: 'sku', label: 'SKU', required: true, placeholder: 'Ej. LAP-0003' },
  { key: 'marca', label: 'Marca', required: true, placeholder: 'Ej. HP, Lenovo, Samsung' },
  {
    key: 'descripcion',
    label: 'Descripción del equipo',
    required: true,
    placeholder: 'Modelo o línea específica',
    wide: true,
  },
  {
    key: 'numeroSerial',
    label: 'Número serial',
    required: true,
    placeholder: 'Código único del fabricante',
  },
];

const PURCHASE_FIELDS: CampoConfig[] = [
  { key: 'fechaCompra', label: 'Fecha de compra', type: 'date', required: true },
  {
    key: 'facturaGuiaCompra',
    label: 'Factura / Guía de compra',
    required: true,
    placeholder: 'Ej. F001-000123',
  },
  { key: 'precio', label: 'Precio de compra (S/)', type: 'number', required: true },
  { key: 'proveedor', label: 'Proveedor', required: true, placeholder: 'Empresa proveedora' },
  {
    key: 'estado',
    label: 'Estado / Ubicación',
    type: 'select',
    required: true,
    options: ['Almacén 1', 'Oficina', 'Alquiler', 'Reparación', 'Taller', 'Mantenimiento'],
  },
  {
    key: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    placeholder: 'Condición física, funcional o información adicional',
    wide: true,
  },
];

const SPECIFIC_FIELDS: Record<InventarioCategoriaBaseId, CampoConfig[]> = {
  laptops: [
    { key: 'procesador', label: 'Procesador', placeholder: 'Ej. Intel Core i5' },
    { key: 'ghz', label: 'GHz', placeholder: 'Ej. 2.50 GHz' },
    { key: 'generacion', label: 'Generación', placeholder: 'Ej. 11.ª' },
    { key: 'pantalla', label: 'Pantalla', placeholder: 'Ej. 15.6"' },
    { key: 'memoriaRam', label: 'Memoria RAM', placeholder: 'Ej. 8 GB' },
    { key: 'memoriaInterna', label: 'Memoria interna', placeholder: 'Ej. 512 GB' },
    {
      key: 'tipoMemoriaInterna',
      label: 'Tipo de memoria interna',
      type: 'select',
      options: ['SSD', 'HDD', 'NVMe', 'eMMC'],
    },
  ],
  computadoras: [
    { key: 'procesador', label: 'Procesador', placeholder: 'Ej. Intel Core i7' },
    { key: 'ghz', label: 'GHz', placeholder: 'Ej. 3.10 GHz' },
    { key: 'generacion', label: 'Generación', placeholder: 'Ej. 10.ª' },
    { key: 'memoriaRam', label: 'Memoria RAM', placeholder: 'Ej. 16 GB' },
    { key: 'memoriaInterna', label: 'Memoria interna', placeholder: 'Ej. 1 TB' },
    {
      key: 'tipoMemoriaInterna',
      label: 'Tipo de memoria interna',
      type: 'select',
      options: ['SSD', 'HDD', 'NVMe'],
    },
  ],
  monitores: [
    { key: 'item', label: 'Item', placeholder: 'Ej. Monitor LED' },
    { key: 'pantalla', label: 'Pantalla', placeholder: 'Ej. 24"' },
    { key: 'alquiler', label: 'Disponible para alquiler', type: 'select', options: ['Sí', 'No'] },
  ],
  tablets: [
    { key: 'procesador', label: 'Procesador', placeholder: 'Ej. Apple A14 Bionic' },
    { key: 'generacion', label: 'Generación', placeholder: 'Ej. 10.ª' },
    { key: 'pantalla', label: 'Pantalla', placeholder: 'Ej. 10.9"' },
    { key: 'memoriaRam', label: 'Memoria RAM', placeholder: 'Ej. 4 GB' },
    { key: 'memoriaInterna', label: 'Memoria interna', placeholder: 'Ej. 64 GB' },
  ],
  televisores: [
    { key: 'modelo', label: 'Modelo', placeholder: 'Ej. UN55AU7000' },
    { key: 'pantalla', label: 'Pantalla', placeholder: 'Ej. 55"' },
  ],
  impresoras: [{ key: 'modelo', label: 'Modelo', placeholder: 'Ej. IM C3000' }],
  proyectores: [
    { key: 'item', label: 'Item', placeholder: 'Ej. Proyector láser' },
    { key: 'modelo', label: 'Modelo', placeholder: 'Ej. EB-L630U' },
  ],
};

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5C94]';

const INITIAL_VALUES: Record<string, string> = {
  estado: 'Almacén 1',
  tipoMemoriaInterna: 'SSD',
  alquiler: 'Sí',
};

export function InventoryModal({
  isOpen,
  onClose,
  onCreate,
  categorias,
  onCreateCategory,
}: InventoryModalProps) {
  const [categoriaId, setCategoriaId] = useState<InventarioCategoriaId>('laptops');
  const [values, setValues] = useState<Record<string, string>>(INITIAL_VALUES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const categoria = categorias.find((item) => item.id === categoriaId) ?? categorias[0];
  const specificFields = SPECIFIC_FIELDS[categoriaId as InventarioCategoriaBaseId] ?? [];
  const fields = [...BASE_FIELDS, ...specificFields, ...PURCHASE_FIELDS];

  const updateValue = (key: CampoFormulario, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleCategoryChange = (nextCategory: InventarioCategoriaId) => {
    setCategoriaId(nextCategory);
    setValues(INITIAL_VALUES);
  };

  const handleCreateCategory = () => {
    const label = newCategoryName.trim();
    const codigo = Number(newCategoryCode);

    if (!label || !Number.isInteger(codigo) || codigo <= 0) {
      setCategoryError('Ingresa un nombre y un código numérico válido.');
      return;
    }
    if (categorias.some((item) => item.codigo === codigo)) {
      setCategoryError('El código ingresado ya pertenece a otra categoría.');
      return;
    }
    if (categorias.some((item) => item.label.toLowerCase() === label.toLowerCase())) {
      setCategoryError('Ya existe una categoría con ese nombre.');
      return;
    }

    const slug = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const nuevaCategoria: InventarioCategoria = {
      id: `custom-${slug}-${Date.now()}`,
      label,
      codigo,
    };

    onCreateCategory(nuevaCategoria);
    setCategoriaId(nuevaCategoria.id);
    setValues(INITIAL_VALUES);
    setNewCategoryName('');
    setNewCategoryCode('');
    setCategoryError('');
    setIsAddingCategory(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const registro: InventarioRegistro = {
      id: `inv-${Date.now()}`,
      categoriaId,
      categoria: categoria.codigo,
      sku: values.sku.trim(),
      marca: values.marca.trim(),
      descripcion: values.descripcion.trim(),
      numeroSerial: values.numeroSerial.trim(),
      fechaCompra: values.fechaCompra,
      facturaGuiaCompra: values.facturaGuiaCompra.trim(),
      precio: Number(values.precio),
      proveedor: values.proveedor.trim(),
      estado: values.estado,
      observaciones: values.observaciones?.trim() ?? '',
    };

    for (const field of specificFields) {
      const value = values[field.key]?.trim();
      if (value) Object.assign(registro, { [field.key]: value });
    }

    onCreate(registro);
    setValues(INITIAL_VALUES);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="inventory-modal-title"
      title="Agregar producto al inventario"
      subtitle="Registra la ficha técnica y los datos de adquisición del nuevo activo"
      icon={<PackagePlus className="h-4 w-4" />}
      headerClass="bg-[#2B5C94]"
      panelClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
            Categoría del producto *
          </label>
          <div className="flex items-center gap-3">
            <select
              value={categoriaId}
              onChange={(event) => handleCategoryChange(event.target.value as InventarioCategoriaId)}
              className={FIELD_CLASS}
            >
              {categorias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-[#2B5C94]">
              Código {categoria.codigo}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAddingCategory((current) => !current);
              setCategoryError('');
            }}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#2B5C94] transition-colors hover:bg-blue-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar nueva categoría
          </button>

          {isAddingCategory && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 shadow-2xs">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                <Tags className="h-4 w-4 text-[#2B5C94]" />
                Nueva categoría de inventario
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto]">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Nombre de categoría"
                  className={FIELD_CLASS}
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={newCategoryCode}
                  onChange={(event) => setNewCategoryCode(event.target.value)}
                  placeholder="Código"
                  className={FIELD_CLASS}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="cursor-pointer rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-900"
                >
                  Crear
                </button>
              </div>
              {categoryError && <p className="mt-2 text-[11px] font-semibold text-rose-600">{categoryError}</p>}
              <p className="mt-2 text-[10px] text-slate-500">
                Las categorías nuevas utilizan la ficha general de identificación, compra y estado.
              </p>
            </div>
          )}
          <p className="mt-1.5 text-[11px] text-slate-500">
            Los campos del formulario se adaptan automáticamente a la categoría seleccionada.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.key} className={field.wide ? 'sm:col-span-2 lg:col-span-3' : ''}>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  required={field.required}
                  value={values[field.key] ?? field.options?.[0] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  className={FIELD_CLASS}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  required={field.required}
                  value={values[field.key] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className={FIELD_CLASS}
                />
              ) : (
                <input
                  type={field.type ?? 'text'}
                  min={field.type === 'number' ? '0' : undefined}
                  step={field.type === 'number' ? '0.01' : undefined}
                  required={field.required}
                  value={values[field.key] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className={FIELD_CLASS}
                />
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2.5 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#2B5C94] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1F4778]"
          >
            <PackagePlus className="h-3.5 w-3.5" />
            Guardar producto
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { ArrowLeftRight } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Entradas de almacén y recepción',
  'Salidas y despachos de equipos',
  'Traslados entre sedes y almacenes',
  'Cambios de ubicación de equipos',
  'Trazabilidad por serie y responsable',
  'Historial cronológico de movimientos',
];

export function MovimientosPage() {
  return (
    <ModulePlaceholder
      icon={ArrowLeftRight}
      title="Movimientos"
      subtitle="Controlar entradas, salidas, traslados y cambios de ubicación."
      capabilities={CAPACIDADES}
    />
  );
}

import { BarChart3 } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Resultados operativos por periodo',
  'Resultados comerciales y de ventas',
  'Alquileres vs. ventas comparados',
  'Ocupación y rotación de flota',
  'Rentabilidad por cliente y servicio',
  'Exportación de reportes',
];

export function ReportesPage() {
  return (
    <ModulePlaceholder
      icon={BarChart3}
      title="Reportes"
      subtitle="Consultar resultados operativos y comerciales."
      capabilities={CAPACIDADES}
    />
  );
}

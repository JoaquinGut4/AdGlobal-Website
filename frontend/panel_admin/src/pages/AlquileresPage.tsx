import { CalendarRange } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Reservas de equipos por fecha',
  'Contratos de alquiler y firmas',
  'Control de periodos y vencimientos',
  'Registro de devoluciones y conformidad',
  'Disponibilidad asignada por proyecto',
  'Alertas de retrasos y renovaciones',
];

export function AlquileresPage() {
  return (
    <ModulePlaceholder
      icon={CalendarRange}
      title="Alquileres"
      subtitle="Controlar reservas, contratos, periodos de alquiler y devoluciones."
      capabilities={CAPACIDADES}
    />
  );
}

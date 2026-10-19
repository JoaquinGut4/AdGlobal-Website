import { FleetDistribution } from '@/components/dashboard/FleetDistribution';
import { FlotaChart } from '@/components/dashboard/FlotaChart';
import type { InventarioFiltro } from '@/types';

interface DashboardPageProps {
  onVerFiltro: (filtro: InventarioFiltro) => void;
  onVerInventario: () => void;
}

export function DashboardPage({
  onVerFiltro,
  onVerInventario,
}: DashboardPageProps) {
  return (
    <>
      <FleetDistribution onVerFiltro={onVerFiltro} />

      <FlotaChart onVerInventario={onVerInventario} />
    </>
  );
}

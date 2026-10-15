import { FleetDistribution } from '@/components/dashboard/FleetDistribution';
import { FlotaChart } from '@/components/dashboard/FlotaChart';
import { RecentQuotes } from '@/components/dashboard/RecentQuotes';
import { WarehouseStatus } from '@/components/dashboard/WarehouseStatus';
import type { Cotizacion, InventarioFiltro } from '@/types';

interface DashboardPageProps {
  cotizaciones: Cotizacion[];
  onToggleStatus: (id: string) => void;
  onVerFiltro: (filtro: InventarioFiltro) => void;
  onVerInventario: () => void;
}

export function DashboardPage({
  cotizaciones,
  onToggleStatus,
  onVerFiltro,
  onVerInventario,
}: DashboardPageProps) {
  return (
    <>
      <FleetDistribution onVerFiltro={onVerFiltro} />

      <FlotaChart onVerInventario={onVerInventario} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentQuotes
          cotizaciones={cotizaciones}
          onToggleStatus={onToggleStatus}
        />
        <WarehouseStatus />
      </div>
    </>
  );
}

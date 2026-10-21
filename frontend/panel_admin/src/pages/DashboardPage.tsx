import { ClientesChart } from '@/components/dashboard/ClientesChart';
import { FleetDistribution } from '@/components/dashboard/FleetDistribution';
import { FlotaChart } from '@/components/dashboard/FlotaChart';
import { LocalDataNotice } from '@/components/ui/LocalDataNotice';
import type { InventarioFiltro, InventarioRegistro, PedidoRegistro } from '@/types';

interface DashboardPageProps {
  pedidos: PedidoRegistro[];
  registrosInventario: InventarioRegistro[];
  onVerFiltro: (filtro: InventarioFiltro) => void;
  onVerInventario: () => void;
  onVerClientes?: () => void;
}

export function DashboardPage({
  pedidos,
  registrosInventario,
  onVerFiltro,
  onVerInventario,
  onVerClientes,
}: DashboardPageProps) {
  return (
    <>
      <div className="flex justify-end">
        <LocalDataNotice />
      </div>

      <FleetDistribution registrosInventario={registrosInventario} onVerFiltro={onVerFiltro} />

      <FlotaChart pedidos={pedidos} onVerInventario={onVerInventario} />

      <ClientesChart pedidos={pedidos} onVerDirectorio={onVerClientes} />
    </>
  );
}

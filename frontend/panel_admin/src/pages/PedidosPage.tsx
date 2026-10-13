import { ClipboardList } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Registro de pedidos de clientes',
  'Seguimiento de estados del pedido',
  'Asignación de equipos solicitados',
  'Fechas de atención y entrega',
  'Confirmación de recepción',
  'Historial de pedidos por cliente',
];

export function PedidosPage() {
  return (
    <ModulePlaceholder
      icon={ClipboardList}
      title="Pedidos"
      subtitle="Registrar pedidos de equipos y dar seguimiento a su atención y entrega."
      capabilities={CAPACIDADES}
    />
  );
}

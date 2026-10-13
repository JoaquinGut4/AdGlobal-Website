import { ShoppingCart } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Solicitudes de compra de clientes',
  'Pedidos y seguimiento de entrega',
  'Ventas de equipos tecnológicos',
  'Estados de pago y facturación',
  'Comprobantes y documentación',
  'Historial de ventas por cliente',
];

export function VentasPage() {
  return (
    <ModulePlaceholder
      icon={ShoppingCart}
      title="Ventas"
      subtitle="Gestionar solicitudes, pedidos y ventas de equipos tecnológicos."
      capabilities={CAPACIDADES}
    />
  );
}

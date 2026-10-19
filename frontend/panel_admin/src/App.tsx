import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginScreen } from '@/components/login/LoginScreen';
import { OrderModal } from '@/components/modals/OrderModal';
import { TicketModal } from '@/components/modals/TicketModal';
import { useToast } from '@/context/ToastContext';
import { STORAGE_KEYS } from '@/config/site';
import { INVENTARIO_DATA } from '@/data/inventario';
import { MOVIMIENTOS_SEED } from '@/data/movimientos';
import { PEDIDOS_SEED } from '@/data/pedidos';
import { TICKETS_SEED, siguienteCodigoTicket, siguienteEstadoTicket } from '@/data/tickets';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { marcaTemporalHoy } from '@/lib/utils';
import { ClientesPage } from '@/pages/ClientesPage';
import { ConfiguracionPage } from '@/pages/ConfiguracionPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GestionWebPage } from '@/pages/GestionWebPage';
import { InventarioPage } from '@/pages/InventarioPage';
import { MovimientosPage } from '@/pages/MovimientosPage';
import { PedidosPage } from '@/pages/PedidosPage';
import { TicketsPage } from '@/pages/TicketsPage';
import type { NuevoTicketInput } from '@/components/modals/TicketModal';
import type { NuevoPedidoInput } from '@/components/modals/OrderModal';
import type {
  AdminSection,
  InventarioCategoria,
  InventarioFiltro,
  MovimientoAccion,
  MovimientoAuditoria,
  MovimientoModulo,
  PedidoRegistro,
  SupportTicket,
} from '@/types';

export default function App() {
  const { isAuthenticated, session, authenticate, logout } = useAuth();
  const { notify } = useToast();

  const [activeNav, setActiveNav] = useState<AdminSection>('dashboard');
  const [inventarioFiltro, setInventarioFiltro] = useState<InventarioFiltro>('all');

  const [tickets, setTickets] = useLocalStorage<SupportTicket[]>(STORAGE_KEYS.tickets, TICKETS_SEED);
  const [pedidos, setPedidos] = useLocalStorage<PedidoRegistro[]>(STORAGE_KEYS.pedidos, PEDIDOS_SEED);
  const [inventarioCategorias, setInventarioCategorias] = useLocalStorage<InventarioCategoria[]>(
    STORAGE_KEYS.inventarioCategorias,
    [],
  );
  const [movimientos, setMovimientos] = useLocalStorage<MovimientoAuditoria[]>(
    STORAGE_KEYS.movimientos,
    MOVIMIENTOS_SEED,
  );

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<PedidoRegistro | null>(null);

  const ticketsActivos = tickets.filter((t) => t.estado !== 'Resuelto').length;

  const registrarMovimiento = (
    modulo: MovimientoModulo,
    accion: MovimientoAccion,
    elemento: string,
    detalle: string,
  ) => {
    const movimiento: MovimientoAuditoria = {
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fecha: new Date().toISOString(),
      usuario: session.usuario,
      modulo,
      accion,
      elemento,
      detalle,
    };
    setMovimientos((current) => [movimiento, ...current]);
  };

  const navegar = (section: AdminSection) => {
    if (session.modulos.includes(section)) setActiveNav(section);
  };

  useEffect(() => {
    if (!isAuthenticated || session.modulos.includes(activeNav)) return;
    setActiveNav(session.modulos[0] ?? 'dashboard');
  }, [activeNav, isAuthenticated, session.modulos]);

  const handleLogout = () => {
    logout();
    setActiveNav('dashboard');
  };

  const avanzarTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, estado: siguienteEstadoTicket(ticket.estado) } : ticket
      )
    );
  };

  const crearTicket = (input: NuevoTicketInput) => {
    const nuevo: SupportTicket = {
      id: `tkt-${Date.now()}`,
      codigo: siguienteCodigoTicket(tickets.length),
      equipo: input.equipo,
      cliente: input.cliente,
      prioridad: input.prioridad,
      estado: 'Abierto',
      descripcion: input.descripcion,
      tecnico: input.tecnico,
      tecnicoTelefono: input.tecnicoTelefono,
      fecha: marcaTemporalHoy(),
    };

    setTickets((prev) => [nuevo, ...prev]);
    registrarMovimiento(
      'Tickets',
      'Creó',
      nuevo.codigo,
      `Creó un ticket de soporte para ${nuevo.cliente} · ${nuevo.equipo}.`,
    );
    setIsTicketModalOpen(false);
    notify(`Ticket ${nuevo.codigo} aperturado con éxito para ${nuevo.cliente}.`);
    return nuevo;
  };

  const siguienteNumeroPedido = () => {
    const year = new Date().getFullYear();
    const maxSequence = pedidos.reduce((max, pedido) => {
      const match = pedido.numeroPedido.match(/(\d+)$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0);
    return `PED-${year}-${String(maxSequence + 1).padStart(3, '0')}`;
  };

  const abrirPedido = () => {
    if (!session.modulos.includes('pedidos')) return;
    setEditingPedido(null);
    setActiveNav('pedidos');
    setIsOrderModalOpen(true);
  };

  const editarPedido = (pedido: PedidoRegistro) => {
    setEditingPedido(pedido);
    setActiveNav('pedidos');
    setIsOrderModalOpen(true);
  };

  const cerrarOrderModal = () => {
    setIsOrderModalOpen(false);
    setEditingPedido(null);
  };

  const actualizarPedido = (pedido: PedidoRegistro) => {
    setPedidos((current) => current.map((item) => (item.id === pedido.id ? pedido : item)));
    registrarMovimiento(
      'Pedidos',
      'Editó',
      pedido.numeroPedido,
      `Editó el pedido ${pedido.numeroPedido}.`,
    );
    cerrarOrderModal();
    notify(`Pedido ${pedido.numeroPedido} actualizado correctamente.`);
  };

  const eliminarPedido = (pedido: PedidoRegistro) => {
    const confirmed = window.confirm(
      `¿Eliminar el pedido ${pedido.numeroPedido}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    setPedidos((current) => current.filter((item) => item.id !== pedido.id));
    registrarMovimiento(
      'Pedidos',
      'Eliminó',
      pedido.numeroPedido,
      `Eliminó el pedido ${pedido.numeroPedido}.`,
    );
    notify(`Pedido ${pedido.numeroPedido} eliminado.`);
  };

  const crearPedido = (input: NuevoPedidoInput) => {
    const nuevo: PedidoRegistro = {
      id: `ped-${Date.now()}`,
      numeroPedido: siguienteNumeroPedido(),
      ...input,
    };

    setPedidos((current) => [nuevo, ...current]);
    registrarMovimiento(
      'Pedidos',
      'Creó',
      nuevo.numeroPedido,
      `Creó el pedido ${nuevo.numeroPedido} por ${nuevo.motivoTraslado}.`,
    );
    setIsOrderModalOpen(false);
    setActiveNav('pedidos');
    notify(`Pedido ${nuevo.numeroPedido} aperturado correctamente.`);
  };

  const irAInventarioConFiltro = (filtro: InventarioFiltro) => {
    if (!session.modulos.includes('inventario')) return;
    setInventarioFiltro(filtro);
    setActiveNav('inventario');
  };

  if (!isAuthenticated) {
    return <LoginScreen onAuthenticate={authenticate} />;
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <DashboardPage
            onVerFiltro={irAInventarioConFiltro}
            onVerInventario={() => navegar('inventario')}
          />
        );
      case 'inventario':
        return (
          <InventarioPage
            filtro={inventarioFiltro}
            onFiltroChange={setInventarioFiltro}
            categoriasPersonalizadas={inventarioCategorias}
            onAgregarCategoria={(categoria) =>
              setInventarioCategorias((current) => [...current, categoria])
            }
            onRegistrarMovimiento={(accion, registro) =>
              registrarMovimiento(
                'Inventario',
                accion,
                registro.sku,
                `${accion} el producto ${registro.sku} · ${registro.descripcion}.`,
              )
            }
          />
        );
      case 'pedidos':
        return (
          <PedidosPage
            pedidos={pedidos}
            onOpenOrder={abrirPedido}
            onEdit={editarPedido}
            onDelete={eliminarPedido}
          />
        );
      case 'movimientos':
        return <MovimientosPage movimientos={movimientos} />;
      case 'tickets':
        return (
          <TicketsPage
            tickets={tickets}
            onAvanzarEstado={avanzarTicket}
            onOpenTicket={() => setIsTicketModalOpen(true)}
          />
        );
      case 'clientes':
        return <ClientesPage />;
      case 'gestion-web':
        return <GestionWebPage />;
      case 'configuracion':
        return <ConfiguracionPage />;
    }
  };

  return (
    <>
      <AdminLayout
        activeNav={activeNav}
        onNavigate={navegar}
        onLogout={handleLogout}
        onOpenTicket={() => setIsTicketModalOpen(true)}
        onOpenOrders={abrirPedido}
        session={session}
        ticketsActivos={ticketsActivos}
        inventarioCategorias={INVENTARIO_DATA.length + inventarioCategorias.length}
      >
        {renderPage()}
      </AdminLayout>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onCreate={crearTicket}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={cerrarOrderModal}
        onCreate={crearPedido}
        editingPedido={editingPedido}
        onUpdate={actualizarPedido}
      />
    </>
  );
}

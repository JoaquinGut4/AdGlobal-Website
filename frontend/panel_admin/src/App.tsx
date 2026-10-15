import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginScreen } from '@/components/login/LoginScreen';
import { OrderModal } from '@/components/modals/OrderModal';
import { TicketModal } from '@/components/modals/TicketModal';
import { useToast } from '@/context/ToastContext';
import { STORAGE_KEYS } from '@/config/site';
import { COTIZACIONES_SEED } from '@/data/cotizaciones';
import { INVENTARIO_DATA } from '@/data/inventario';
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
import { ReportesPage } from '@/pages/ReportesPage';
import { TicketsPage } from '@/pages/TicketsPage';
import type { NuevoTicketInput } from '@/components/modals/TicketModal';
import type { NuevoPedidoInput } from '@/components/modals/OrderModal';
import type {
  AdminSection,
  Cotizacion,
  InventarioCategoria,
  InventarioFiltro,
  PedidoRegistro,
  SupportTicket,
} from '@/types';

export default function App() {
  const { isAuthenticated, session, authenticate, logout } = useAuth();
  const { notify } = useToast();

  const [activeNav, setActiveNav] = useState<AdminSection>('dashboard');
  const [inventarioFiltro, setInventarioFiltro] = useState<InventarioFiltro>('all');

  const [cotizaciones, setCotizaciones] = useLocalStorage<Cotizacion[]>(
    STORAGE_KEYS.cotizaciones,
    COTIZACIONES_SEED
  );
  const [tickets, setTickets] = useLocalStorage<SupportTicket[]>(STORAGE_KEYS.tickets, TICKETS_SEED);
  const [pedidos, setPedidos] = useLocalStorage<PedidoRegistro[]>(STORAGE_KEYS.pedidos, PEDIDOS_SEED);
  const [inventarioCategorias, setInventarioCategorias] = useLocalStorage<InventarioCategoria[]>(
    STORAGE_KEYS.inventarioCategorias,
    [],
  );

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const ticketsActivos = tickets.filter((t) => t.estado !== 'Resuelto').length;

  const handleLogout = () => {
    logout();
    setActiveNav('dashboard');
  };

  const toggleCotizacionStatus = (id: string) => {
    setCotizaciones((prev) =>
      prev.map((cotizacion) =>
        cotizacion.id === id
          ? {
              ...cotizacion,
              status: cotizacion.status === 'pendiente' ? 'atendido' : 'pendiente',
            }
          : cotizacion
      )
    );
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
      area: input.area,
      equipo: input.equipo,
      cliente: input.cliente,
      prioridad: input.prioridad,
      estado: 'Abierto',
      descripcion: input.descripcion,
      tecnico: input.tecnico,
      fecha: marcaTemporalHoy(),
    };

    setTickets((prev) => [nuevo, ...prev]);
    setIsTicketModalOpen(false);
    notify(`Ticket ${nuevo.codigo} aperturado con éxito para ${nuevo.area}.`);
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
    setActiveNav('pedidos');
    setIsOrderModalOpen(true);
  };

  const crearPedido = (input: NuevoPedidoInput) => {
    const nuevo: PedidoRegistro = {
      id: `ped-${Date.now()}`,
      numeroPedido: siguienteNumeroPedido(),
      fechaPedido: new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
      usuario: session.usuario,
      ...input,
      estado: 'Nuevo',
      ...(input.tipo === 'Alquiler' ? { estadoAlquiler: 'Reservado' as const } : {}),
    };

    setPedidos((current) => [nuevo, ...current]);
    setIsOrderModalOpen(false);
    setActiveNav('pedidos');
    notify(`Pedido ${nuevo.numeroPedido} aperturado correctamente.`);
  };

  const irAInventarioConFiltro = (filtro: InventarioFiltro) => {
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
            cotizaciones={cotizaciones}
            onToggleStatus={toggleCotizacionStatus}
            onVerFiltro={irAInventarioConFiltro}
            onVerInventario={() => setActiveNav('inventario')}
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
          />
        );
      case 'pedidos':
        return <PedidosPage pedidos={pedidos} onOpenOrder={abrirPedido} />;
      case 'movimientos':
        return <MovimientosPage />;
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
      case 'reportes':
        return <ReportesPage />;
      case 'configuracion':
        return <ConfiguracionPage />;
    }
  };

  return (
    <>
      <AdminLayout
        activeNav={activeNav}
        onNavigate={setActiveNav}
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
        onClose={() => setIsOrderModalOpen(false)}
        onCreate={crearPedido}
        usuario={session.usuario}
        siguienteNumero={siguienteNumeroPedido()}
      />
    </>
  );
}

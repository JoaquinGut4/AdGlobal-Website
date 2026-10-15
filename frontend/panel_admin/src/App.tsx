import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginScreen } from '@/components/login/LoginScreen';
import { QuoteModal } from '@/components/modals/QuoteModal';
import { TicketModal } from '@/components/modals/TicketModal';
import { useToast } from '@/context/ToastContext';
import { STORAGE_KEYS } from '@/config/site';
import { COTIZACIONES_SEED } from '@/data/cotizaciones';
import { INVENTARIO_DATA } from '@/data/inventario';
import { TICKETS_SEED, siguienteCodigoTicket, siguienteEstadoTicket } from '@/data/tickets';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { marcaTemporalHoy } from '@/lib/utils';
import { AlquileresPage } from '@/pages/AlquileresPage';
import { ClientesPage } from '@/pages/ClientesPage';
import { ConfiguracionPage } from '@/pages/ConfiguracionPage';
import { CotizacionesPage } from '@/pages/CotizacionesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GestionWebPage } from '@/pages/GestionWebPage';
import { InventarioPage } from '@/pages/InventarioPage';
import { MovimientosPage } from '@/pages/MovimientosPage';
import { PedidosPage } from '@/pages/PedidosPage';
import { ReportesPage } from '@/pages/ReportesPage';
import { TicketsPage } from '@/pages/TicketsPage';
import { VentasPage } from '@/pages/VentasPage';
import type { NuevoTicketInput } from '@/components/modals/TicketModal';
import type { NuevaCotizacionInput } from '@/components/modals/QuoteModal';
import type {
  AdminSection,
  Cotizacion,
  InventarioCategoria,
  InventarioFiltro,
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
  const [inventarioCategorias, setInventarioCategorias] = useLocalStorage<InventarioCategoria[]>(
    STORAGE_KEYS.inventarioCategorias,
    [],
  );

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const pendientesCotizaciones = cotizaciones.filter((c) => c.status === 'pendiente').length;
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

  const crearCotizacion = (input: NuevaCotizacionInput) => {
    const nueva: Cotizacion = {
      id: `cot-${Date.now().toString().slice(-6)}`,
      nombre: input.nombre,
      empresa: input.empresa,
      correo: input.correo,
      telefono: input.telefono || '+51 900 000 000',
      servicioId: input.servicioId,
      fechas: input.fechas || 'Próximos días',
      ciudad: input.ciudad || 'Lima',
      mensaje:
        input.mensaje || 'Apertura directa de cotización desde panel administrativo.',
      createdAt: marcaTemporalHoy(),
      status: 'pendiente',
    };

    setCotizaciones((prev) => [nueva, ...prev]);
    setIsQuoteModalOpen(false);
    setActiveNav('cotizaciones');
    notify(`Cotización aperturada exitosamente para ${nueva.empresa}.`);
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
            onVerCotizaciones={() => setActiveNav('cotizaciones')}
            onVerInventario={() => setActiveNav('inventario')}
          />
        );
      case 'cotizaciones':
        return (
          <CotizacionesPage
            cotizaciones={cotizaciones}
            onToggleStatus={toggleCotizacionStatus}
            onOpenQuote={() => setIsQuoteModalOpen(true)}
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
      case 'alquileres':
        return <AlquileresPage />;
      case 'ventas':
        return <VentasPage />;
      case 'pedidos':
        return <PedidosPage />;
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
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        session={session}
        pendientesCotizaciones={pendientesCotizaciones}
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

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onCreate={crearCotizacion}
      />
    </>
  );
}

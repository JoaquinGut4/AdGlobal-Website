import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginScreen } from '@/components/login/LoginScreen';
import { OrderModal } from '@/components/modals/OrderModal';
import { TicketModal } from '@/components/modals/TicketModal';
import { TicketWorkflowModal } from '@/components/modals/TicketWorkflowModal';
import { useToast } from '@/context/ToastContext';
import { CATEGORIAS_BASE_TOTAL } from '@/data/inventario';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, apiRequest } from '@/lib/api';
import { toSupportTicket } from '@/lib/tickets';
import type { TicketApiResponse } from '@/lib/tickets';
import {
  categoryPayload,
  inventoryFromApi,
  inventoryPayload,
  orderPayload,
} from '@/lib/operationsApi';
import type { InventoryStateApi, OrderFinishApi, PaginatedApi } from '@/lib/operationsApi';
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
  ClienteDerivado,
  DashboardResumen,
  InventarioCategoria,
  InventarioFiltro,
  InventarioRegistro,
  PedidoRegistro,
  SupportTicket,
} from '@/types';

export default function App() {
  const { isAuthenticated, session, authenticate, logout } = useAuth();
  const { notify } = useToast();

  const [activeNav, setActiveNav] = useState<AdminSection>('dashboard');
  const [inventarioFiltro, setInventarioFiltro] = useState<InventarioFiltro>('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [pedidos, setPedidos] = useState<PedidoRegistro[]>([]);
  const [inventario, setInventario] = useState<InventarioRegistro[]>([]);
  const [estadosInventario, setEstadosInventario] = useState<string[]>([]);
  const [estadosTicketEditables, setEstadosTicketEditables] = useState<string[]>([]);
  const [inventarioCategorias, setInventarioCategorias] = useState<InventarioCategoria[]>([]);
  const [clientes, setClientes] = useState<ClienteDerivado[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResumen | null>(null);
  const [inventoryCatalog, setInventoryCatalog] = useState<InventarioRegistro[]>([]);
  const [inventoryCategory, setInventoryCategory] = useState<InventarioCategoria['id']>('laptops');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPages, setInventoryPages] = useState(1);
  const [inventoryTotal, setInventoryTotal] = useState(0);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [workflowTicket, setWorkflowTicket] = useState<SupportTicket | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<PedidoRegistro | null>(null);

  const refreshInventory = useCallback(async (
    page = inventoryPage,
    categoryId = inventoryCategory,
  ) => {
    const [assets, categories, states] = await Promise.all([
      apiRequest<PaginatedApi<InventarioRegistro>>(
        `/inventario?category_id=${encodeURIComponent(categoryId)}&page=${page}&page_size=50`,
      ),
      apiRequest<InventarioCategoria[]>('/inventario/categorias'),
      apiRequest<InventoryStateApi[]>('/inventario/estados'),
    ]);
    setInventario(assets.items.map(inventoryFromApi));
    setInventoryPage(assets.page); setInventoryPages(assets.pages); setInventoryTotal(assets.total);
    setInventarioCategorias(categories.filter((category) => category.id.startsWith('custom-')));
    setEstadosInventario(states.map((state) => state.nombre));
    setEstadosTicketEditables(states.filter((state) => !state.inmutable).map((state) => state.nombre));
  }, [inventoryCategory, inventoryPage]);

  const loadInventoryCatalog = useCallback(async () => {
    const [response, states] = await Promise.all([
      apiRequest<PaginatedApi<InventarioRegistro>>('/inventario?page=1&page_size=1000'),
      apiRequest<InventoryStateApi[]>('/inventario/estados'),
    ]);
    setEstadosTicketEditables(states.filter((state) => !state.inmutable).map((state) => state.nombre));
    const rows = response.items.map(inventoryFromApi); setInventoryCatalog(rows); return rows;
  }, []);

  const refreshDashboard = useCallback(async () => {
    setDashboard(await apiRequest<DashboardResumen>('/dashboard'));
  }, []);

  const refreshOrders = useCallback(async () => {
    setPedidos(await apiRequest<PedidoRegistro[]>('/pedidos'));
  }, []);

  const refreshOrdersAndCustomers = useCallback(async () => {
    const [orders, customers] = await Promise.all([
      apiRequest<PedidoRegistro[]>('/pedidos'),
      apiRequest<ClienteDerivado[]>('/clientes/derivados'),
    ]);
    setPedidos(orders);
    setClientes(customers);
  }, []);

  const refreshMovements = useCallback(async () => {
    return;
  }, []);

  const refreshTickets = useCallback(async () => {
    if (!session.modulos.includes('tickets')) return;
    const rows = await apiRequest<TicketApiResponse[]>('/tickets');
    setTickets(rows.map((row) => toSupportTicket(row, {
      equiposIds: row.equiposIds,
      estadosAnteriores: row.estadosAnteriores,
    })));
  }, [session.modulos]);

  useEffect(() => {
    if (!isAuthenticated || session.modulos.length === 0) return;
    const tasks: Promise<unknown>[] = [];
    if (activeNav === 'dashboard') tasks.push(refreshDashboard(), refreshOrders());
    if (activeNav === 'inventario') tasks.push(refreshInventory());
    if (['pedidos', 'clientes', 'tickets'].includes(activeNav)) tasks.push(refreshOrdersAndCustomers());
    if (activeNav === 'movimientos') tasks.push(refreshMovements());
    if (activeNav === 'tickets') tasks.push(refreshTickets(), loadInventoryCatalog());
    void Promise.allSettled(tasks).then((results) => {
      const failed = results.find((result) => result.status === 'rejected');
      if (failed?.status === 'rejected') {
        notify(failed.reason instanceof Error ? failed.reason.message : 'No se pudieron cargar los datos operativos.');
      }
    });
  }, [activeNav, isAuthenticated, loadInventoryCatalog, notify, refreshDashboard, refreshInventory, refreshMovements, refreshOrders, refreshOrdersAndCustomers, refreshTickets, session.modulos]);

  useEffect(() => {
    if (!isAuthenticated || !session.modulos.includes('dashboard')) return;
    const updateNotifications = () => void refreshDashboard().catch(() => undefined);
    updateNotifications();
    const timer = window.setInterval(updateNotifications, 30_000);
    const onVisibility = () => { if (document.visibilityState === 'visible') updateNotifications(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAuthenticated, refreshDashboard, session.modulos]);

  const ticketsActivos = dashboard
    ? Object.entries(dashboard.ticketsPorEstado).filter(([state]) => state !== 'Resuelto').reduce((sum, [, value]) => sum + value, 0)
    : tickets.filter((t) => t.estado !== 'Resuelto').length;

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

  const eliminarTicket = async (ticket: SupportTicket) => {
    const confirmed = window.confirm(
      `¿Eliminar el ticket ${ticket.codigo} de ${ticket.cliente}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      await apiRequest<void>(`/tickets/${ticket.id}`, { method: 'DELETE' });
    } catch (requestError) {
      if (!(requestError instanceof ApiError && requestError.status === 404)) {
        notify(requestError instanceof Error ? requestError.message : 'No se pudo eliminar el ticket.');
        return;
      }
    }
    await Promise.all([refreshTickets(), refreshInventory(), refreshMovements()]);
    notify(`Ticket ${ticket.codigo} eliminado.`);
  };

  const crearTicket = async (input: NuevoTicketInput): Promise<SupportTicket> => {
    const response = await apiRequest<TicketApiResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        equipo: input.equipo,
        cliente: input.cliente,
        prioridad: input.prioridad,
        descripcion: input.descripcion,
        numeroPedidoEstado: input.numeroPedidoEstado,
        tipoTicket: input.tipoTicket,
        numeroPedido: input.numeroPedido,
        telefonoContacto: input.telefonoContacto,
        direccionPedido: input.direccionPedido,
        estadoEquipo: input.estadoEquipo,
        tecnicoId: input.tecnicoId,
        tecnico: input.tecnico,
        tecnicoTelefono: input.tecnicoTelefono,
        equiposIds: input.equiposIds,
      }),
    });

    const nuevo = toSupportTicket(response);
    setTickets((prev) => [nuevo, ...prev]);
    await Promise.all([refreshInventory(), refreshMovements()]);
    setIsTicketModalOpen(false);
    notify(`Ticket ${nuevo.codigo} aperturado con éxito para ${nuevo.cliente}.`);
    return nuevo;
  };

  const abrirPedido = async () => {
    if (!session.modulos.includes('pedidos')) return;
    await Promise.all([loadInventoryCatalog(), refreshOrdersAndCustomers()]);
    setEditingPedido(null);
    setActiveNav('pedidos');
    setIsOrderModalOpen(true);
  };

  const abrirTicket = async () => {
    if (!session.modulos.includes('tickets')) return;
    await Promise.all([loadInventoryCatalog(), refreshOrdersAndCustomers(), refreshTickets()]);
    setIsTicketModalOpen(true);
  };

  const editarPedido = (pedido: PedidoRegistro) => {
    if (pedido.estadoPedido === 'Finalizado') return;
    setEditingPedido(pedido);
    setActiveNav('pedidos');
    setIsOrderModalOpen(true);
  };

  const cerrarOrderModal = () => {
    setIsOrderModalOpen(false);
    setEditingPedido(null);
  };

  const actualizarPedido = async (pedido: PedidoRegistro): Promise<boolean> => {
    try {
      await apiRequest<PedidoRegistro>(`/pedidos/${pedido.id}`, {
        method: 'PUT',
        body: JSON.stringify(orderPayload(pedido)),
      });
      await Promise.all([refreshOrdersAndCustomers(), refreshInventory(), refreshMovements()]);
      cerrarOrderModal();
      notify(`Pedido ${pedido.numeroPedido} actualizado correctamente.`);
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo actualizar el pedido.');
      return false;
    }
  };

  const finalizarPedido = async (pedido: PedidoRegistro) => {
    if (pedido.estadoPedido === 'Finalizado') return;
    if (!window.confirm(`¿Finalizar el pedido ${pedido.numeroPedido}?`)) return;
    try {
      const result = await apiRequest<OrderFinishApi>(`/pedidos/${pedido.id}/finalizar`, { method: 'PATCH' });
      await Promise.all([refreshOrdersAndCustomers(), refreshInventory(), refreshTickets(), refreshMovements()]);
      notify(`Pedido ${pedido.numeroPedido} finalizado. ${result.inventarioActualizado} equipo(s) restaurados.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo finalizar el pedido.');
    }
  };

  const eliminarPedido = async (pedido: PedidoRegistro) => {
    const confirmed = window.confirm(
      `¿Eliminar el pedido ${pedido.numeroPedido}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    try {
      await apiRequest<void>(`/pedidos/${pedido.id}`, { method: 'DELETE' });
      await Promise.all([refreshOrdersAndCustomers(), refreshInventory(), refreshTickets(), refreshMovements()]);
      notify(`Pedido ${pedido.numeroPedido} eliminado.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo eliminar el pedido.');
    }
  };

  const crearPedido = async (input: NuevoPedidoInput): Promise<boolean> => {
    try {
      const nuevo = await apiRequest<PedidoRegistro>('/pedidos', {
        method: 'POST',
        body: JSON.stringify(orderPayload(input)),
      });
      await Promise.all([refreshOrdersAndCustomers(), refreshInventory(), refreshMovements()]);
      setIsOrderModalOpen(false);
      setActiveNav('pedidos');
      notify(`Pedido ${nuevo.numeroPedido} aperturado correctamente.`);
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo crear el pedido.');
      return false;
    }
  };

  const persistInventoryPhoto = async (registro: InventarioRegistro): Promise<InventarioRegistro> => {
    if (!registro.foto?.startsWith('data:')) return registro;
    const blob = await (await fetch(registro.foto)).blob();
    const form = new FormData(); form.append('file', new File([blob], `${registro.sku}.webp`, { type: blob.type || 'image/webp' }));
    const uploaded = await apiRequest<{ url: string }>('/inventario/fotos', { method: 'POST', body: form });
    return { ...registro, foto: uploaded.url };
  };

  const agregarRegistroInventario = async (registro: InventarioRegistro) => {
    try {
      registro = await persistInventoryPhoto(registro);
      const saved = await apiRequest<InventarioRegistro>('/inventario', {
        method: 'POST',
        body: JSON.stringify(inventoryPayload(registro)),
      });
      setInventario((current) => [inventoryFromApi(saved), ...current]);
      await refreshMovements();
      notify(`Producto ${saved.sku} agregado al inventario.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo agregar el producto.');
      await refreshInventory().catch(() => undefined);
    }
  };

  const actualizarRegistroInventario = async (registro: InventarioRegistro) => {
    try {
      registro = await persistInventoryPhoto(registro);
      const saved = await apiRequest<InventarioRegistro>(`/inventario/${registro.id}`, {
        method: 'PUT',
        body: JSON.stringify(inventoryPayload(registro)),
      });
      setInventario((current) => current.map((item) => item.id === saved.id ? inventoryFromApi(saved) : item));
      await refreshMovements();
      notify(`Producto ${saved.sku} actualizado.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo actualizar el producto.');
      await refreshInventory().catch(() => undefined);
    }
  };

  const eliminarRegistroInventario = async (registro: InventarioRegistro) => {
    try {
      await apiRequest<void>(`/inventario/${registro.id}`, { method: 'DELETE' });
      setInventario((current) => current.filter((item) => item.id !== registro.id));
      await refreshMovements();
      notify(`Producto ${registro.sku} eliminado.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo eliminar el producto.');
    }
  };

  const agregarCategoriaInventario = async (categoria: InventarioCategoria) => {
    try {
      const saved = await apiRequest<InventarioCategoria>('/inventario/categorias', {
        method: 'POST',
        body: JSON.stringify(categoryPayload(categoria)),
      });
      setInventarioCategorias((current) => [...current, saved]);
      await refreshMovements();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo crear la categoría.');
      await refreshInventory().catch(() => undefined);
    }
  };

  const eliminarCategoriaInventario = async (categoriaId: InventarioCategoria['id']) => {
    try {
      await apiRequest<void>(`/inventario/categorias/${encodeURIComponent(categoriaId)}`, { method: 'DELETE' });
      setInventarioCategorias((current) => current.filter((item) => item.id !== categoriaId));
      await refreshMovements();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo eliminar la categoría.');
    }
  };

  const agregarEstadoInventario = async (estado: string) => {
    try {
      await apiRequest('/inventario/estados', { method: 'POST', body: JSON.stringify({ nombre: estado }) });
      await Promise.all([refreshInventory(), refreshMovements()]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo crear el estado.');
    }
  };

  const renombrarEstadoInventario = async (anterior: string, nuevo: string) => {
    try {
      await apiRequest(`/inventario/estados/${encodeURIComponent(anterior)}`, {
        method: 'PATCH',
        body: JSON.stringify({ nombre: nuevo }),
      });
      await Promise.all([refreshInventory(), refreshMovements()]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo renombrar el estado.');
    }
  };

  const eliminarEstadoInventario = async (estado: string) => {
    try {
      await apiRequest<void>(`/inventario/estados/${encodeURIComponent(estado)}`, { method: 'DELETE' });
      await Promise.all([refreshInventory(), refreshMovements()]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo eliminar el estado.');
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onAuthenticate={authenticate} />;
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
            <DashboardPage
              resumen={dashboard}
              pedidos={pedidos}
            />
        );
      case 'inventario':
        return (
          <InventarioPage
            filtro={inventarioFiltro}
            onFiltroChange={setInventarioFiltro}
            registrosInventario={inventario}
            categoriaActiva={inventoryCategory}
            pagina={inventoryPage}
            paginas={inventoryPages}
            totalRegistros={inventoryTotal}
            onCategoriaChange={(categoryId) => {
              setInventoryCategory(categoryId);
              setInventoryPage(1);
              void refreshInventory(1, categoryId);
            }}
            onPaginaChange={(page) => void refreshInventory(page)}
            onRefresh={() => void refreshInventory(inventoryPage)}
            estadosInventario={estadosInventario}
            categoriasPersonalizadas={inventarioCategorias}
            onAgregarCategoria={(categoria) => void agregarCategoriaInventario(categoria)}
            onEliminarCategoria={(categoriaId) => void eliminarCategoriaInventario(categoriaId)}
            onAgregarEstado={(estado) => void agregarEstadoInventario(estado)}
            onRenombrarEstado={(anterior, nuevo) => void renombrarEstadoInventario(anterior, nuevo)}
            onEliminarEstado={(estado) => void eliminarEstadoInventario(estado)}
            onAgregarRegistro={(registro) => void agregarRegistroInventario(registro)}
            onActualizarRegistro={(registro) => void actualizarRegistroInventario(registro)}
            onEliminarRegistro={(registro) => void eliminarRegistroInventario(registro)}
          />
        );
      case 'pedidos':
        return (
          <PedidosPage
            pedidos={pedidos}
            onOpenOrder={() => void abrirPedido()}
            onEdit={editarPedido}
            onFinish={finalizarPedido}
            onDelete={eliminarPedido}
          />
        );
      case 'movimientos':
        return <MovimientosPage />;
      case 'tickets':
        return (
          <TicketsPage
            tickets={tickets}
            onOpenWorkflow={(ticket) => setWorkflowTicket(ticket)}
            onEliminar={eliminarTicket}
              onOpenTicket={() => void abrirTicket()}
          />
        );
      case 'clientes':
        return <ClientesPage clientes={clientes} />;
      case 'gestion-web':
        return <GestionWebPage />;
      case 'configuracion':
        return <ConfiguracionPage currentUserId={session.id} />;
    }
  };

  return (
    <>
      <AdminLayout
        activeNav={activeNav}
        onNavigate={navegar}
        onLogout={handleLogout}
        onOpenTicket={() => void abrirTicket()}
        onOpenOrders={() => void abrirPedido()}
        session={session}
        ticketsActivos={ticketsActivos}
        pendingOrders={dashboard?.pedidosActivos ?? pedidos.filter((pedido) => pedido.estadoPedido !== 'Finalizado').length}
        notificationRevision={dashboard?.notificacionVersion ?? ''}
        inventarioCategorias={CATEGORIAS_BASE_TOTAL + inventarioCategorias.length}
      >
        {renderPage()}
      </AdminLayout>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onCreate={crearTicket}
        pedidos={pedidos}
        estadosDisponibles={estadosTicketEditables}
      />

      <TicketWorkflowModal
        ticket={workflowTicket}
        inventario={inventoryCatalog}
        pedidos={pedidos}
        onClose={() => setWorkflowTicket(null)}
        onUpdated={async (updated) => {
          setWorkflowTicket(updated.estado === 'Resuelto' ? null : updated);
          await Promise.all([refreshTickets(), loadInventoryCatalog(), refreshDashboard()]);
        }}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={cerrarOrderModal}
        onCreate={crearPedido}
        inventario={inventoryCatalog}
        categorias={inventarioCategorias}
        editingPedido={editingPedido}
        onUpdate={actualizarPedido}
      />
    </>
  );
}

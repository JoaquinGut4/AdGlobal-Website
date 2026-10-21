import { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginScreen } from '@/components/login/LoginScreen';
import { OrderModal } from '@/components/modals/OrderModal';
import { TicketModal } from '@/components/modals/TicketModal';
import { useToast } from '@/context/ToastContext';
import { STORAGE_KEYS } from '@/config/site';
import { CATEGORIAS_BASE_TOTAL, ESTADOS_INVENTARIO_BASE, INVENTARIO_REGISTROS } from '@/data/inventario';
import { MOVIMIENTOS_SEED } from '@/data/movimientos';
import { PEDIDOS_SEED } from '@/data/pedidos';
import { siguienteEstadoTicket } from '@/data/tickets';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ApiError, apiRequest } from '@/lib/api';
import { mergeServerTickets, toSupportTicket } from '@/lib/tickets';
import type { TicketApiResponse } from '@/lib/tickets';
import { restoreInventoryForOrder, syncInventoryForOrder } from '@/lib/inventorySync';
import { asegurarEstadosInventario, normalizarEstadoInventario, normalizarEstadosAnteriores } from '@/lib/inventoryStates';
import { occupiedByTicket, rebaseTicketsAfterOrderRelease, restoreAssetsFromTicket, sendAssetsToWorkshop } from '@/lib/ticketWorkflow';
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
  InventarioRegistro,
  MovimientoAccion,
  MovimientoAuditoria,
  MovimientoModulo,
  PedidoRegistro,
  SupportTicket,
} from '@/types';

const reservesInventory = (pedido: PedidoRegistro) =>
  pedido.estadoPedido !== 'Finalizado' || pedido.motivoTraslado.startsWith('Venta');

export default function App() {
  const { isAuthenticated, session, authenticate, logout } = useAuth();
  const { notify } = useToast();

  useEffect(() => {
    const onStorageError = () => {
      notify('No se pudieron guardar los cambios: el almacenamiento del navegador está lleno.');
    };
    window.addEventListener('adglobal:storage-error', onStorageError);
    return () => window.removeEventListener('adglobal:storage-error', onStorageError);
  }, [notify]);

  const [activeNav, setActiveNav] = useState<AdminSection>('dashboard');
  const [inventarioFiltro, setInventarioFiltro] = useState<InventarioFiltro>('all');

  // Modo local explícito: inventario, pedidos, clientes y movimientos viven en
  // este navegador. Los tickets, usuarios y la gestión web sí usan la API.
  const [tickets, setTickets] = useLocalStorage<SupportTicket[]>(STORAGE_KEYS.tickets, [], isAuthenticated);
  const [pedidos, setPedidos] = useLocalStorage<PedidoRegistro[]>(STORAGE_KEYS.pedidos, PEDIDOS_SEED, isAuthenticated);
  const [inventario, setInventario] = useLocalStorage<InventarioRegistro[]>(
    STORAGE_KEYS.inventario,
    INVENTARIO_REGISTROS,
    isAuthenticated,
  );
  const [estadosInventario, setEstadosInventario] = useLocalStorage<string[]>(
    STORAGE_KEYS.inventarioEstadosV2,
    ESTADOS_INVENTARIO_BASE,
    isAuthenticated,
  );
  const [inventarioCategorias, setInventarioCategorias] = useLocalStorage<InventarioCategoria[]>(
    STORAGE_KEYS.inventarioCategorias,
    [],
    isAuthenticated,
  );
  const [movimientos, setMovimientos] = useLocalStorage<MovimientoAuditoria[]>(
    STORAGE_KEYS.movimientos,
    MOVIMIENTOS_SEED,
    isAuthenticated,
  );

  const ticketsSnapshot = useRef(tickets);
  useEffect(() => {
    ticketsSnapshot.current = tickets;
  }, [tickets]);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<PedidoRegistro | null>(null);

  // La clave anterior contenía tickets de demostración; se elimina una sola vez.
  useEffect(() => {
    try {
      window.localStorage.removeItem('adglobal_tickets');
      window.localStorage.removeItem('adglobal_inventory');
    } catch {
      /* Almacenamiento no disponible */
    }
  }, []);

  // Los tickets viven en el backend. Al iniciar sesión se refresca la lista
  // para que los creados en otro equipo también aparezcan aquí.
  useEffect(() => {
    if (!isAuthenticated) return;
    // Se captura la lista conocida al iniciar la petición para no descartar un
    // ticket creado mientras la respuesta estaba en vuelo.
    const knownAtRequest = new Set(ticketsSnapshot.current.map((ticket) => ticket.id));
    let active = true;
    apiRequest<TicketApiResponse[]>('/tickets')
      .then((rows) => {
        if (active) setTickets((current) => mergeServerTickets(rows, current, knownAtRequest));
      })
      .catch(() => {
        /* Sin conexión: se conserva la copia local. */
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, setTickets]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.inventarioEstados);
      if (!raw) return;
      const legacy: unknown = JSON.parse(raw);
      if (Array.isArray(legacy)) {
        setEstadosInventario((current) => {
          const next = [...current];
          for (const value of legacy) {
            if (typeof value !== 'string') continue;
            const estado = value.trim();
            if (estado && !next.some((item) => item.toLowerCase() === estado.toLowerCase())) next.push(estado);
          }
          return next;
        });
      }
      window.localStorage.removeItem(STORAGE_KEYS.inventarioEstados);
    } catch {
      /* Almacenamiento anterior no disponible. */
    }
  }, [setEstadosInventario]);

  useEffect(() => {
    setEstadosInventario((current) => {
      const next = asegurarEstadosInventario(current);
      return next.length === current.length && next.every((state, index) => state === current[index])
        ? current : next;
    });
    setInventario((current) => {
      const next = current.map((asset) => ({ ...asset, estado: normalizarEstadoInventario(asset.estado) }));
      return next.every((asset, index) => asset.estado === current[index].estado) ? current : next;
    });
    setPedidos((current) => {
      const next = current.map((order) => ({
        ...order,
        estadosAnteriores: normalizarEstadosAnteriores(order.estadosAnteriores),
      }));
      return next.every((order, index) =>
        JSON.stringify(order.estadosAnteriores) === JSON.stringify(current[index].estadosAnteriores),
      ) ? current : next;
    });
    setTickets((current) => {
      const next = current.map((ticket) => ({
        ...ticket,
        estadosAnteriores: normalizarEstadosAnteriores(ticket.estadosAnteriores),
        estadoEquipo: ticket.estadoEquipo ? normalizarEstadoInventario(ticket.estadoEquipo) : ticket.estadoEquipo,
        numeroPedidoEstado: ticket.tipoTicket === 'general' && ticket.numeroPedidoEstado
          ? normalizarEstadoInventario(ticket.numeroPedidoEstado) : ticket.numeroPedidoEstado,
      }));
      return next.every((ticket, index) =>
        JSON.stringify(ticket.estadosAnteriores) === JSON.stringify(current[index].estadosAnteriores) &&
        ticket.estadoEquipo === current[index].estadoEquipo &&
        ticket.numeroPedidoEstado === current[index].numeroPedidoEstado,
      ) ? current : next;
    });
  }, [setEstadosInventario, setInventario, setPedidos, setTickets]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      try {
        if (event.key === STORAGE_KEYS.inventario) {
          const next: InventarioRegistro[] = event.newValue ? JSON.parse(event.newValue) as InventarioRegistro[] : [];
          const normalized = next.map((asset) => ({ ...asset, estado: normalizarEstadoInventario(asset.estado) }));
          setInventario((current) => JSON.stringify(current) === JSON.stringify(normalized) ? current : normalized);
        }
        if (event.key === STORAGE_KEYS.inventarioEstadosV2 && event.newValue) {
          const next = asegurarEstadosInventario(JSON.parse(event.newValue) as string[]);
          setEstadosInventario((current) => JSON.stringify(current) === JSON.stringify(next) ? current : next);
        }
      } catch {
        /* Ignorar cambios de otra pestaña que no sean JSON válido. */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setInventario, setEstadosInventario]);

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

  const actualizarEstadoTicket = async (ticket: SupportTicket, estado: SupportTicket['estado']): Promise<boolean> => {
    try {
      await apiRequest(`/tickets/${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
    } catch (requestError) {
      if (!(requestError instanceof ApiError && requestError.status === 404)) {
        notify(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el ticket.');
        return false;
      }
    }
    if (estado === 'Resuelto' && ticket.estado !== 'Resuelto') {
      const result = restoreAssetsFromTicket(ticket, inventario);
      if (result.restored) {
        setInventario(result.inventory);
        registrarMovimiento('Inventario', 'Modificó', ticket.codigo,
          `Devolvió ${result.restored} equipo(s) a su estado anterior al completar ${ticket.codigo}.`);
      }
    }
    setTickets((prev) => prev.map((item) => (item.id === ticket.id ? { ...item, estado } : item)));
    return true;
  };

  const avanzarTicket = async (id: string) => {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket || ticket.estado === 'Resuelto') return;
    await actualizarEstadoTicket(ticket, siguienteEstadoTicket(ticket.estado));
  };

  const completarTicket = async (ticket: SupportTicket) => {
    if (ticket.estado === 'Resuelto') return;
    const updated = await actualizarEstadoTicket(ticket, 'Resuelto');
    if (updated) notify(`Ticket ${ticket.codigo} marcado como resuelto.`);
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
    const result = restoreAssetsFromTicket(ticket, inventario);
    if (result.restored) {
      setInventario(result.inventory);
      registrarMovimiento('Inventario', 'Modificó', ticket.codigo,
        `Devolvió ${result.restored} equipo(s) al eliminar ${ticket.codigo}.`);
    }
    setTickets((prev) => prev.filter((item) => item.id !== ticket.id));
    notify(`Ticket ${ticket.codigo} eliminado.`);
  };

  const crearTicket = async (input: NuevoTicketInput): Promise<SupportTicket> => {
    if (input.equiposIds.length === 0 ||
        inventario.filter((asset) => input.equiposIds.includes(asset.id)).length !== input.equiposIds.length) {
      throw new Error('Selecciona equipos existentes en Inventario antes de crear el ticket.');
    }
    const occupying = occupiedByTicket(input.equiposIds, tickets);
    if (occupying) throw new Error(`Un equipo ya está asignado al ticket activo ${occupying.codigo}.`);
    const workshop = sendAssetsToWorkshop(input.equiposIds, inventario);
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
      }),
    });

    const nuevo = toSupportTicket(response, {
      equiposIds: input.equiposIds,
      estadosAnteriores: workshop.previousStates,
    });

    setInventario(workshop.inventory);
    setEstadosInventario((current) => current.some((state) => state.toLowerCase() === 'taller')
      ? current : [...current, 'Taller']);
    setTickets((prev) => [nuevo, ...prev]);
    if (workshop.changed) {
      registrarMovimiento('Inventario', 'Modificó', nuevo.codigo,
        `Envió ${workshop.changed} equipo(s) a Taller por el ticket ${nuevo.codigo}.`);
    }
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
    if (pedido.estadoPedido === 'Finalizado') return;
    setEditingPedido(pedido);
    setActiveNav('pedidos');
    setIsOrderModalOpen(true);
  };

  const cerrarOrderModal = () => {
    setIsOrderModalOpen(false);
    setEditingPedido(null);
  };

  const actualizarPedido = (pedido: PedidoRegistro): boolean => {
    const anterior = pedidos.find((item) => item.id === pedido.id);
    if (!anterior || anterior.estadoPedido === 'Finalizado') return false;
    if (occupiedByTicket(Object.keys(anterior.estadosAnteriores ?? {}), tickets)) {
      notify('No se puede editar un pedido mientras uno de sus equipos tiene un ticket activo.');
      return false;
    }
    const reverted = restoreInventoryForOrder(anterior, inventario, 'delete');
    const sync = syncInventoryForOrder(pedido, reverted.inventory);
    if (occupiedByTicket(Object.keys(sync.previousStates), tickets)) {
      notify('No se puede asignar un equipo con un ticket de soporte activo.');
      return false;
    }
    if (sync.targetState && sync.matched === 0) {
      notify('No se actualizó el pedido: ningún SKU coincide con el inventario.');
      return false;
    }
    const occupied = pedidos.some((item) =>
      item.id !== pedido.id && reservesInventory(item) &&
      Object.keys(sync.previousStates).some((id) => item.estadosAnteriores?.[id] !== undefined),
    );
    if (occupied) {
      notify('No se actualizó el pedido: hay equipos asignados a otro pedido activo.');
      return false;
    }
    const actualizado = { ...pedido, estadosAnteriores: sync.previousStates };
    setInventario(sync.inventory);
    if (sync.targetState) {
      const targetState = sync.targetState;
      setEstadosInventario((current) => current.some(
        (estado) => estado.toLowerCase() === targetState.toLowerCase(),
      ) ? current : [...current, targetState]);
    }
    setPedidos((current) => current.map((item) => (item.id === pedido.id ? actualizado : item)));
    registrarMovimiento(
      'Pedidos',
      'Editó',
      pedido.numeroPedido,
      `Editó el pedido ${pedido.numeroPedido}.`,
    );
    if (reverted.restored || sync.updated) {
      registrarMovimiento('Inventario', 'Modificó', pedido.numeroPedido,
        `Reasignó los equipos del pedido ${pedido.numeroPedido}.`);
    }
    cerrarOrderModal();
    notify(`Pedido ${pedido.numeroPedido} actualizado correctamente.`);
    return true;
  };

  const finalizarPedido = (pedido: PedidoRegistro) => {
    if (pedido.estadoPedido === 'Finalizado') return;
    if (!window.confirm(`¿Finalizar el pedido ${pedido.numeroPedido}?`)) return;
    const result = restoreInventoryForOrder(pedido, inventario, 'finish');
    if (pedido.motivoTraslado === 'Alquiler') {
      setTickets((current) => rebaseTicketsAfterOrderRelease(pedido, current));
    }
    if (result.restored) {
      setInventario(result.inventory);
      registrarMovimiento('Inventario', 'Modificó', pedido.numeroPedido,
        `Restauró ${result.restored} equipo(s) al finalizar el alquiler ${pedido.numeroPedido}.`);
    }
    setPedidos((current) => current.map((item) => item.id === pedido.id
      ? { ...item, estadoPedido: 'Finalizado', fechaFinalizacion: new Date().toISOString() }
      : item));
    registrarMovimiento('Pedidos', 'Modificó', pedido.numeroPedido, `Finalizó el pedido ${pedido.numeroPedido}.`);
    const detail = pedido.motivoTraslado === 'Alquiler'
      ? ` ${result.restored} equipo(s) restaurados${result.skipped ? `, ${result.skipped} omitidos por cambios posteriores` : ''}.`
      : '';
    notify(`Pedido ${pedido.numeroPedido} finalizado.${detail}`);
  };

  const eliminarPedido = (pedido: PedidoRegistro) => {
    const confirmed = window.confirm(
      `¿Eliminar el pedido ${pedido.numeroPedido}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    const result = restoreInventoryForOrder(pedido, inventario, 'delete');
    if (!(pedido.estadoPedido === 'Finalizado' && pedido.motivoTraslado === 'Alquiler')) {
      setTickets((current) => rebaseTicketsAfterOrderRelease(pedido, current));
    }
    if (result.restored) {
      setInventario(result.inventory);
      registrarMovimiento('Inventario', 'Modificó', pedido.numeroPedido,
        `Restauró ${result.restored} equipo(s) al eliminar el pedido ${pedido.numeroPedido}.`);
    }
    setPedidos((current) => current.filter((item) => item.id !== pedido.id));
    registrarMovimiento(
      'Pedidos',
      'Eliminó',
      pedido.numeroPedido,
      `Eliminó el pedido ${pedido.numeroPedido}.`,
    );
    notify(`Pedido ${pedido.numeroPedido} eliminado. ${result.restored} equipo(s) restaurados${result.skipped ? `, ${result.skipped} omitidos por cambios posteriores` : ''}.`);
  };

  const crearPedido = (input: NuevoPedidoInput): boolean => {
    const nuevo: PedidoRegistro = {
      id: `ped-${Date.now()}`,
      numeroPedido: siguienteNumeroPedido(),
      ...input,
    };

    const inventorySync = syncInventoryForOrder(nuevo, inventario);
    if (inventorySync.targetState && inventorySync.matched === 0) {
      notify('No se creó el pedido: ningún SKU indicado coincide con el inventario.');
      return false;
    }
    if (occupiedByTicket(Object.keys(inventorySync.previousStates), tickets)) {
      notify('No se creó el pedido: un equipo tiene un ticket de soporte activo.');
      return false;
    }
    const occupied = pedidos.some((item) =>
      reservesInventory(item) &&
      Object.keys(inventorySync.previousStates).some((id) => item.estadosAnteriores?.[id] !== undefined),
    );
    if (occupied) {
      notify('No se creó el pedido: hay equipos asignados a otro pedido activo.');
      return false;
    }
    setInventario(inventorySync.inventory);
    if (inventorySync.targetState) {
      const targetState = inventorySync.targetState;
      setEstadosInventario((current) =>
        current.some((estado) => estado.toLowerCase() === targetState.toLowerCase())
          ? current
          : [...current, targetState],
      );
    }
    setPedidos((current) => [{ ...nuevo, estadoPedido: 'Activo', estadosAnteriores: inventorySync.previousStates }, ...current]);
    registrarMovimiento(
      'Pedidos',
      'Creó',
      nuevo.numeroPedido,
      `Creó el pedido ${nuevo.numeroPedido} por ${nuevo.motivoTraslado}.`,
    );
    if (inventorySync.updated > 0 && inventorySync.targetState) {
      registrarMovimiento(
        'Inventario',
        'Modificó',
        'Estados de inventario',
        `Actualizó ${inventorySync.updated} equipo(s) a ${inventorySync.targetState} por el pedido ${nuevo.numeroPedido}.`,
      );
    }
    setIsOrderModalOpen(false);
    setActiveNav('pedidos');
    const inventoryDetail =
      inventorySync.targetState && inventorySync.updated > 0
        ? ` Inventario actualizado: ${inventorySync.updated} equipo(s) marcados como ${inventorySync.targetState}.`
        : inventorySync.targetState
          ? ` Los equipos ya estaban en estado ${inventorySync.targetState}.`
          : '';
    notify(`Pedido ${nuevo.numeroPedido} aperturado correctamente.${inventoryDetail}`);
    return true;
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
            pedidos={pedidos}
            registrosInventario={inventario}
            onVerFiltro={irAInventarioConFiltro}
            onVerInventario={() => navegar('inventario')}
            onVerClientes={session.modulos.includes('clientes') ? () => navegar('clientes') : undefined}
          />
        );
      case 'inventario':
        return (
          <InventarioPage
            filtro={inventarioFiltro}
            onFiltroChange={setInventarioFiltro}
            registrosInventario={inventario}
            setRegistrosInventario={setInventario}
            estadosInventario={estadosInventario}
            setEstadosInventario={setEstadosInventario}
            categoriasPersonalizadas={inventarioCategorias}
            onAgregarCategoria={(categoria) =>
              setInventarioCategorias((current) => [...current, categoria])
            }
            onEliminarCategoria={(categoriaId) =>
              setInventarioCategorias((current) =>
                current.filter((categoria) => categoria.id !== categoriaId),
              )
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
            onFinish={finalizarPedido}
            onDelete={eliminarPedido}
            onGuardarBorradorGuia={(pedido, numeroGuia) =>
              registrarMovimiento(
                'Pedidos',
                'Guardó',
                `Guía ${numeroGuia}`,
                `Guardó el borrador de la guía de remisión N.° ${numeroGuia} del pedido ${pedido.numeroPedido}.`,
              )
            }
          />
        );
      case 'movimientos':
        return <MovimientosPage movimientos={movimientos} />;
      case 'tickets':
        return (
          <TicketsPage
            tickets={tickets}
            onAvanzarEstado={avanzarTicket}
            onCompletar={completarTicket}
            onEliminar={eliminarTicket}
            onOpenTicket={() => setIsTicketModalOpen(true)}
          />
        );
      case 'clientes':
        return <ClientesPage pedidos={pedidos} />;
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
        onOpenTicket={() => setIsTicketModalOpen(true)}
        onOpenOrders={abrirPedido}
        session={session}
        ticketsActivos={ticketsActivos}
        pendingOrders={pedidos.filter((pedido) => pedido.estadoPedido !== 'Finalizado').length}
        inventarioCategorias={CATEGORIAS_BASE_TOTAL + inventarioCategorias.length}
      >
        {renderPage()}
      </AdminLayout>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onCreate={crearTicket}
        inventario={inventario}
        pedidos={pedidos}
        tickets={tickets}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={cerrarOrderModal}
        onCreate={crearPedido}
        inventario={inventario}
        categorias={inventarioCategorias}
        editingPedido={editingPedido}
        onUpdate={actualizarPedido}
      />
    </>
  );
}

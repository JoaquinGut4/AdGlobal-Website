import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronRight, FileText, Menu, Wrench } from 'lucide-react';
import type { AdminSection } from '@/types';

interface TopbarProps {
  title: string;
  onToggleSidebar: () => void;
  onOpenTicket: () => void;
  onOpenOrders: () => void;
  canOpenTicket: boolean;
  canOpenOrders: boolean;
  pendingOrders: number;
  activeTickets: number;
  onNavigate: (section: AdminSection) => void;
}

export function Topbar({
  title,
  onToggleSidebar,
  onOpenTicket,
  onOpenOrders,
  canOpenTicket,
  canOpenOrders,
  pendingOrders,
  activeTickets,
  onNavigate,
}: TopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const totalNotifications =
    (canOpenOrders ? pendingOrders : 0) + (canOpenTicket ? activeTickets : 0);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNotificationsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const goTo = (section: AdminSection) => {
    onNavigate(section);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            aria-label={
              totalNotifications > 0
                ? `Notificaciones: ${totalNotifications} pendientes`
                : 'Notificaciones: sin pendientes'
            }
            aria-haspopup="menu"
            aria-expanded={isNotificationsOpen}
            className={`relative cursor-pointer rounded-lg p-2 transition-colors ${
              isNotificationsOpen
                ? 'bg-blue-50 text-[#2B5C94]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Bell className={`w-4 h-4 ${totalNotifications > 0 ? 'text-amber-600' : ''}`} />
            {totalNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white shadow-xs">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">Notificaciones</p>
                  <p className="text-[10px] text-slate-500">
                    {totalNotifications > 0
                      ? `${totalNotifications} ${totalNotifications === 1 ? 'pendiente' : 'pendientes'}`
                      : 'Todo al día'}
                  </p>
                </div>
                <Bell className="h-4 w-4 text-slate-400" />
              </div>

              {totalNotifications === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-2 text-xs font-bold text-slate-600">Sin pendientes</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    No hay pedidos ni tickets de soporte activos.
                  </p>
                </div>
              ) : (
                <div className="p-1.5">
                  {canOpenOrders && pendingOrders > 0 && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => goTo('pedidos')}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-blue-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#2B5C94]">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800">Pedidos pendientes</span>
                        <span className="block text-[11px] text-slate-500">
                          {pendingOrders} {pendingOrders === 1 ? 'pedido registrado' : 'pedidos registrados'}
                        </span>
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#2B5C94]">
                        {pendingOrders}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  )}

                  {canOpenTicket && activeTickets > 0 && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => goTo('tickets')}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-amber-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-700">
                        <Wrench className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800">Tickets de soporte</span>
                        <span className="block text-[11px] text-slate-500">
                          {activeTickets} {activeTickets === 1 ? 'ticket activo' : 'tickets activos'}
                        </span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {activeTickets}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aperturar Tickets */}
        {canOpenTicket && <button
          type="button"
          onClick={onOpenTicket}
          title="Aperturar ticket para el área de soporte técnico y reparación"
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-700/80 group shrink-0"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Ticket</span>
          <span className="sm:hidden">Ticket</span>
        </button>}

        {/* Pedidos */}
        {canOpenOrders && <button
          type="button"
          onClick={onOpenOrders}
          title="Pedidos"
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#2B5C94] hover:bg-[#1F4778] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
          <span>Pedidos</span>
        </button>}
      </div>
    </header>
  );
}

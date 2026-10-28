import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronRight, FileText, Menu, Radio, Wrench } from 'lucide-react';
import type { AdminSection } from '@/types';

interface TopbarProps {
  title: string;
  description: string;
  onToggleSidebar: () => void;
  onOpenTicket: () => void;
  onOpenOrders: () => void;
  canOpenTicket: boolean;
  canOpenOrders: boolean;
  pendingOrders: number;
  activeTickets: number;
  notificationRevision: string;
  onNavigate: (section: AdminSection) => void;
}

export function Topbar({
  title,
  description,
  onToggleSidebar,
  onOpenTicket,
  onOpenOrders,
  canOpenTicket,
  canOpenOrders,
  pendingOrders,
  activeTickets,
  notificationRevision,
  onNavigate,
}: TopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const previousNotifications = useRef<number | null>(null);
  const previousRevision = useRef<string | null>(null);
  const totalNotifications =
    (canOpenOrders ? pendingOrders : 0) + (canOpenTicket ? activeTickets : 0);

  useEffect(() => {
    const previous = previousNotifications.current;
    const priorRevision = previousRevision.current;
    const shouldSound = totalNotifications > 0 && (
      previous === null || totalNotifications > previous ||
      (priorRevision !== null && notificationRevision !== '' && notificationRevision !== priorRevision)
    );
    previousNotifications.current = totalNotifications;
    previousRevision.current = notificationRevision;
    if (!shouldSound) return;
    try {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);
      gain.connect(context.destination);
      [740, 988].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start(context.currentTime + index * 0.13);
        oscillator.stop(context.currentTime + 0.35 + index * 0.13);
      });
      window.setTimeout(() => void context.close(), 800);
    } catch {
      // El navegador puede bloquear audio hasta la primera interacción del usuario.
    }
  }, [notificationRevision, totalNotifications]);

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
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-slate-400 sm:flex">
            <span>AD Global</span><span>/</span><span className="text-brand">Administración</span>
          </div>
          <h1 className="truncate text-lg font-extrabold tracking-[-0.025em] text-ink sm:text-xl">{title}</h1>
          <p className="hidden max-w-xl truncate text-[11px] text-slate-500 xl:block">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 lg:flex">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
          <Radio className="h-3 w-3 text-success" />
          Datos en vivo
        </div>
        {/* Notification bell */}
        <div ref={notificationsRef} className="relative order-3">
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
                ? 'bg-brand-soft text-brand'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Bell className={`w-4 h-4 ${totalNotifications > 0 ? 'text-warning' : ''}`} />
            {totalNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-4 text-white shadow-xs">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div
              role="menu"
              className="animate-in fade-in absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(0,24,48,.16)]"
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
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-brand-soft"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-highlight/35 bg-brand-soft text-brand">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800">Pedidos pendientes</span>
                        <span className="block text-[11px] text-slate-500">
                          {pendingOrders} {pendingOrders === 1 ? 'pedido registrado' : 'pedidos registrados'}
                        </span>
                      </span>
                      <span className="rounded-full bg-highlight/25 px-2 py-0.5 text-[10px] font-bold text-brand">
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
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-warning/10"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
                        <Wrench className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800">Tickets de soporte</span>
                        <span className="block text-[11px] text-slate-500">
                          {activeTickets} {activeTickets === 1 ? 'ticket activo' : 'tickets activos'}
                        </span>
                      </span>
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">
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
          className="order-1 inline-flex items-center gap-1.5 rounded-xl border border-warning/25 bg-warning/10 px-3 py-2 text-xs font-bold text-warning shadow-xs transition-[background-color,transform] hover:bg-warning/15 active:scale-[.97] cursor-pointer group shrink-0"
        >
          <Wrench className="w-3.5 h-3.5 text-warning group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Ticket</span>
          <span className="sm:hidden">Ticket</span>
        </button>}

        {/* Pedidos */}
        {canOpenOrders && <button
          type="button"
          onClick={onOpenOrders}
          title="Pedidos"
          className="order-2 inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-brand/20 transition-[background-color,transform] hover:bg-brand-deep active:scale-[.97] cursor-pointer group shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-highlight group-hover:scale-110 transition-transform" />
          <span>Pedidos</span>
        </button>}
      </div>
    </header>
  );
}

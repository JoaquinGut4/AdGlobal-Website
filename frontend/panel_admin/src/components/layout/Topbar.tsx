import { Bell, FileText, Menu, Search, Settings, Wrench } from 'lucide-react';

interface TopbarProps {
  title: string;
  onToggleSidebar: () => void;
  onOpenTicket: () => void;
  onOpenQuote: () => void;
}

export function Topbar({ title, onToggleSidebar, onOpenTicket, onOpenQuote }: TopbarProps) {
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
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente, serie o evento..."
            className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-52 lg:w-60 focus:outline-none focus:ring-1 focus:ring-[#2B5C94] bg-slate-50/50"
          />
        </div>

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2B5C94]" />
        </button>

        {/* Settings */}
        <button
          type="button"
          aria-label="Configuración"
          className="hidden sm:inline-flex p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Aperturar Tickets */}
        <button
          type="button"
          onClick={onOpenTicket}
          title="Aperturar ticket para el área de soporte técnico y reparación"
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-700/80 group shrink-0"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Ticket</span>
          <span className="sm:hidden">Ticket</span>
        </button>

        {/* Pedidos */}
        <button
          type="button"
          onClick={onOpenQuote}
          title="Pedidos"
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#2B5C94] hover:bg-[#1F4778] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
          <span>Pedidos</span>
        </button>
      </div>
    </header>
  );
}

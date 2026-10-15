import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getNavItem } from '@/config/navigation';
import type { AuthSession } from '@/hooks/useAuth';
import type { AdminSection } from '@/types';

interface AdminLayoutProps {
  activeNav: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onOpenTicket: () => void;
  onOpenQuote: () => void;
  session: AuthSession;
  pendientesCotizaciones: number;
  ticketsActivos: number;
  inventarioCategorias: number;
  children: ReactNode;
}

export function AdminLayout({
  activeNav,
  onNavigate,
  onLogout,
  onOpenTicket,
  onOpenQuote,
  session,
  pendientesCotizaciones,
  ticketsActivos,
  inventarioCategorias,
  children,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.localStorage.getItem('adglobal-sidebar-collapsed') === 'true',
  );
  const current = getNavItem(activeNav);

  const handleNavigate = (section: AdminSection) => {
    onNavigate(section);
    setIsSidebarOpen(false);
  };

  const handleToggleCollapsed = () => {
    setIsSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem('adglobal-sidebar-collapsed', String(nextValue));
      return nextValue;
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex font-sans antialiased">
      <Sidebar
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        session={session}
        pendientesCotizaciones={pendientesCotizaciones}
        ticketsActivos={ticketsActivos}
        inventarioCategorias={inventarioCategorias}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={handleToggleCollapsed}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar
          title={current.title}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenTicket={onOpenTicket}
          onOpenQuote={onOpenQuote}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

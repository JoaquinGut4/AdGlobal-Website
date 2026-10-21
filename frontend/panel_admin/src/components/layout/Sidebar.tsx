import { ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { AdGlobalLogo } from '@/components/AdGlobalLogo';
import { ADMIN_CONFIG } from '@/config/site';
import { NAV_ITEMS } from '@/config/navigation';
import type { AuthSession } from '@/hooks/useAuth';
import type { AdminSection } from '@/types';

interface SidebarProps {
  activeNav: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  session: AuthSession;
  ticketsActivos: number;
  inventarioCategorias: number;
  /** Visible en móvil (drawer). */
  isOpen: boolean;
  onClose: () => void;
  /** Contraído en escritorio. En móvil siempre se muestra completo. */
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({
  activeNav,
  onNavigate,
  onLogout,
  session,
  ticketsActivos,
  inventarioCategorias,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const initial = session.usuario.slice(0, 2).toUpperCase();
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.hidden && session.modulos.includes(item.id),
  );

  return (
    <>
      {/* Backdrop móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 z-40 shadow-xs transition-[width,transform] duration-200 lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div
          className={`relative min-h-[71px] border-b border-slate-100 flex items-center justify-between ${
            isCollapsed ? 'p-5 lg:justify-center lg:px-3' : 'p-5'
          }`}
        >
          <AdGlobalLogo
            variant="brand"
            height={30}
            className={isCollapsed ? 'lg:hidden' : ''}
          />
          {isCollapsed && (
            <AdGlobalLogo variant="brand" height={11} className="hidden lg:block" />
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? 'Expandir menú principal' : 'Contraer menú principal'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-[#2B5C94]/40 hover:text-[#2B5C94] transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav
          className={`flex-1 py-4 space-y-1 overflow-x-hidden overflow-y-auto ${
            isCollapsed ? 'px-3 lg:px-2' : 'px-3'
          }`}
        >
          <div
            className={`px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 ${
              isCollapsed ? 'lg:hidden' : ''
            }`}
          >
            Menú Principal
          </div>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            let badge: { text: string; tone: 'alert' | 'ok' } | null = null;
            if (item.id === 'tickets' && ticketsActivos > 0) {
              badge = { text: String(ticketsActivos), tone: 'alert' };
            } else if (item.id === 'inventario') {
              badge = { text: `${inventarioCategorias} Cat.`, tone: 'ok' };
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isCollapsed ? item.label : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isCollapsed ? 'lg:justify-center lg:px-2.5' : ''
                } ${
                  isActive
                    ? 'bg-[#2B5C94] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                }`}
              >
                <span
                  className={`flex items-center ${isCollapsed ? 'gap-3 lg:gap-0' : 'gap-3'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </span>
                {badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isCollapsed ? 'lg:hidden' : ''
                    } ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : badge.tone === 'alert'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700 font-mono'
                    }`}
                  >
                    {badge.text}
                  </span>
                )}
              </button>
            );
          })}

          <a
            href={ADMIN_CONFIG.publicSiteUrl}
            aria-label={isCollapsed ? 'Volver a la web' : undefined}
            title={isCollapsed ? 'Volver a la web' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer ${
              isCollapsed ? 'lg:justify-center lg:px-2.5 lg:gap-0' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span className={isCollapsed ? 'lg:hidden' : ''}>Volver a la Web</span>
          </a>
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className={`p-3 border-t border-slate-100 ${isCollapsed ? 'lg:px-2' : ''}`}>
          <div
            className={`p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between ${
              isCollapsed ? 'lg:flex-col lg:gap-2 lg:px-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2B5C94] to-[#3878BE] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {initial}
              </div>
              <div className={`overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
                <p className="text-xs font-bold text-slate-800 truncate">{session.usuario}</p>
                <p className="text-[10px] text-slate-400 truncate">{session.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

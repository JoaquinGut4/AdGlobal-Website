import { ArrowUpRight, LogOut, PanelLeftClose, PanelLeftOpen, ShieldCheck, X } from 'lucide-react';
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
          className="fixed inset-0 z-30 bg-brand-deep/55 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-brand/70 bg-brand-deep text-white shadow-xl shadow-brand-deep/10 transition-[width,transform] duration-200 lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div
          className={`relative min-h-16 border-b border-brand flex items-center justify-between ${
            isCollapsed ? 'p-5 lg:justify-center lg:px-3' : 'p-5'
          }`}
        >
          <AdGlobalLogo
            variant="white"
            height={30}
            className={isCollapsed ? 'lg:hidden' : ''}
          />
          {isCollapsed && (
            <span className="hidden h-10 w-10 items-center justify-center rounded-xl border border-highlight/25 bg-brand text-sm font-black tracking-tight text-highlight lg:flex">AD</span>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? 'Expandir menú principal' : 'Contraer menú principal'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 items-center justify-center rounded-full border border-highlight/20 bg-brand text-highlight shadow-sm hover:bg-brand hover:text-white transition-colors cursor-pointer"
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
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand cursor-pointer"
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
            className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-highlight/55 ${
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
                className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-[background-color,color,transform] active:scale-[.98] cursor-pointer ${
                  isCollapsed ? 'lg:justify-center lg:px-2.5' : ''
                } ${
                  isActive
                    ? 'bg-brand text-white shadow-sm shadow-black/20 font-bold ring-1 ring-highlight/15'
                    : 'text-slate-300 hover:text-white hover:bg-brand/55 font-semibold'
                }`}
              >
                <span
                  className={`flex items-center ${isCollapsed ? 'gap-3 lg:gap-0' : 'gap-3'}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-highlight' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </span>
                {badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isCollapsed ? 'lg:hidden' : ''
                    } ${
                      isActive
                          ? 'bg-highlight/15 text-highlight'
                        : badge.tone === 'alert'
                           ? 'bg-warning/15 text-warning'
                           : 'bg-highlight/10 text-highlight font-mono'
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
            className={`mt-4 w-full flex items-center gap-3 border-t border-brand/80 px-3.5 pt-5 pb-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-highlight hover:bg-brand/40 transition-colors cursor-pointer ${
              isCollapsed ? 'lg:justify-center lg:px-2.5 lg:gap-0' : ''
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
            <span className={isCollapsed ? 'lg:hidden' : ''}>Volver a la Web</span>
          </a>
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className={`p-3 border-t border-brand ${isCollapsed ? 'lg:px-2' : ''}`}>
          <div
            className={`p-3 rounded-xl bg-brand/65 border border-highlight/10 flex items-center justify-between ${
              isCollapsed ? 'lg:flex-col lg:gap-2 lg:px-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand border border-highlight/25 text-highlight flex items-center justify-center font-bold text-xs shrink-0">
                {initial}
              </div>
              <div className={`overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
                <p className="flex items-center gap-1 text-xs font-bold text-white truncate">{session.usuario}<ShieldCheck className="h-3 w-3 shrink-0 text-highlight" /></p>
                <p className="text-[10px] text-slate-400 truncate font-mono">{session.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
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

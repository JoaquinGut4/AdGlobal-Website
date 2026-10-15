import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Globe,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AdminSection } from '@/types';

export interface NavItem {
  id: AdminSection;
  label: string;
  /** Título mostrado en la barra superior. */
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Menú principal del panel administrativo (orden de operación). */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Dashboard',
    description: 'Visualizar estadísticas y actividad de la empresa en tiempo real.',
    icon: LayoutDashboard,
  },
  {
    id: 'inventario',
    label: 'Inventario',
    title: 'Inventario',
    description: 'Administrar equipos, características, cantidades, estados y disponibilidad.',
    icon: Boxes,
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    title: 'Pedidos',
    description: 'Registrar pedidos de equipos y dar seguimiento a su atención y entrega.',
    icon: ClipboardList,
  },
  {
    id: 'clientes',
    label: 'Clientes',
    title: 'Clientes',
    description: 'Registrar clientes, empresas, datos de contacto e historial comercial.',
    icon: Users,
  },
  {
    id: 'movimientos',
    label: 'Movimientos',
    title: 'Movimientos',
    description: 'Controlar entradas, salidas, traslados y cambios de ubicación.',
    icon: ArrowLeftRight,
  },
  {
    id: 'tickets',
    label: 'Tickets de soporte',
    title: 'Tickets de soporte',
    description: 'Gestionar incidencias técnicas y solicitudes de asistencia.',
    icon: Wrench,
  },
  {
    id: 'gestion-web',
    label: 'Gestión web',
    title: 'Gestión web',
    description: 'Actualizar productos, imágenes, servicios y contenido de la web pública.',
    icon: Globe,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    title: 'Reportes',
    description: 'Consultar resultados operativos y comerciales.',
    icon: BarChart3,
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    title: 'Configuración',
    description: 'Administrar usuarios, roles, permisos y parámetros generales.',
    icon: Settings,
  },
];

export const getNavItem = (section: AdminSection): NavItem =>
  NAV_ITEMS.find((item) => item.id === section) ?? NAV_ITEMS[0];

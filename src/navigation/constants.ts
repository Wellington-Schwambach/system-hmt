import {
  BarChart3,
  ClipboardList,
  Fuel,
  Landmark,
  LayoutDashboard,
  Map,
  NotebookPen,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';

import type { NavigationItem } from './types';

export const APP_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    permission: 'dashboard',
  },
  {
    id: 'bi',
    label: 'BI Operacional',
    icon: BarChart3,
    path: '/bi',
    permission: 'bi',
  },
  {
    id: 'registrations',
    label: 'Cadastros',
    icon: ClipboardList,
    children: [
      {
        id: 'vehicles',
        label: 'Veículos',
        icon: Truck,
        path: '/cadastros/veiculos',
        permission: 'registrations.vehicles',
      },
      {
        id: 'employees',
        label: 'Colaboradores',
        icon: Users,
        path: '/cadastros/colaboradores',
        permission: 'registrations.employees',
      },
    ],
  },
  {
    id: 'fuel',
    label: 'Combustível',
    icon: Fuel,
    path: '/fuel',
    permission: 'fuel',
  },
  {
    id: 'travel',
    label: 'Viagens',
    icon: Map,
    path: '/travel',
    permission: 'travel',
  },

  {
    id: 'acertos',
    label: 'Acertos',
    icon: NotebookPen,
    path: '/acertos',
    permission: 'settlements',
  },
  {
    id: 'finance',
    label: 'Financeiro',
    icon: Landmark,
    path: '/finance',
    permission: 'finance',
  },
  {
    id: 'maintenance',
    label: 'Manutenção',
    icon: Wrench,
    path: '/maintenance',
    permission: 'maintenance',
  },
  {
    id: 'security',
    label: 'Segurança',
    icon: ShieldCheck,
    path: '/admin/seguranca',
    permission: 'admin.security',
    roles: ['Administrador'],
  },
  {
    id: 'logistic',
    label: 'Logística',
    icon: Truck,
    path: '/logistic',
    permission: 'logistics',
  },
];

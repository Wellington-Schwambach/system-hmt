import type { ReactNode } from 'react';

export interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  isSidebarCollapsed: boolean;
}

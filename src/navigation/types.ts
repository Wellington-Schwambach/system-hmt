import type { LucideIcon } from 'lucide-react';

export interface NavigationChildItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  permission: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  permission?: string;
  children?: NavigationChildItem[];
  roles?: string[];
}

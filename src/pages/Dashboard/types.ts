import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  path?: string;
}

export interface CalendarDay {
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

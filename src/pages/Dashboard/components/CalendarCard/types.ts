import type { CalendarDay, DashboardLoad } from '../../types';

export interface CalendarCardProps {
  monthLabel: string;
  days: CalendarDay[];
  loads: DashboardLoad[];
}

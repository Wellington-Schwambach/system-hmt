import type { CalendarDay, DashboardNote } from '../../types';

export interface CalendarCardProps {
  monthLabel: string;
  days: CalendarDay[];
  notes: DashboardNote[];
}

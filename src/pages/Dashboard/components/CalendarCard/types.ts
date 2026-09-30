import type { CalendarDay, DashboardNote } from '../../types';

export interface CalendarCardProps {
  monthLabel: string;
  days: CalendarDay[];
  notes: DashboardNote[];
  isCurrentMonth: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onEditNote: (note: DashboardNote) => void;
}

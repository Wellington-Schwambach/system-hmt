import type { LucideIcon } from 'lucide-react';

export type DashboardNoteIcon = 'truck' | 'clipboard' | 'cake' | 'clock' | 'calendar' | 'note';

export interface DashboardNote {
  id: string;
  manualNoteId: number | null;
  alertType: string;
  icon: DashboardNoteIcon;
  title: string;
  observation: string;
  dueDate: string | null;
  dueAt: string | null;
  source: string;
  isManual: boolean;
  canDelete: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  completedByName: string | null;
  canComplete: boolean;
}

export interface DashboardNoteUser {
  id: number;
  name: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  path?: string;
}

export interface DashboardData {
  period: {
    year: number;
    month: number;
    key: string;
    start: string;
    end: string;
  };
  metrics: {
    loads: number;
    travels: number;
    fuelings: number;
  };
  dailyNotes: DashboardNote[];
  calendarNotes: DashboardNote[];
  noteCounts: Record<string, number>;
  noteUsers: DashboardNoteUser[];
}

export interface CalendarDay {
  key: string;
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  noteCount: number;
}

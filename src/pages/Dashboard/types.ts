import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  path?: string;
}

export interface DashboardLoad {
  id: number;
  referenceCode: string;
  loadingAt: string | null;
  shipmentNumber: string | null;
  loadNumber: string | null;
  shipowner: string | null;
  bookingNumber: string | null;
  shipperName: string;
  shipperColor: string;
  origin: string | null;
  destination: string | null;
  tractorPlate: string | null;
  trailerPlate: string | null;
  driverName: string | null;
  driverTwoName: string | null;
  completedAt: string | null;
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
  loadCounts: Record<string, number>;
  loads: DashboardLoad[];
}

export interface CalendarDay {
  key: string;
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  loadCount: number;
}

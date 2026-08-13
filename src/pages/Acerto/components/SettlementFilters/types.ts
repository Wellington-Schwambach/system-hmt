import type { SettlementPeriodMode } from '../../types';

export interface SettlementFiltersProps {
  drivers: string[];
  selectedDriver: string;
  periodMode: SettlementPeriodMode;
  selectedMonth: string;
  startDate: string;
  endDate: string;
  onDriverChange: (driver: string) => void;
  onMonthChange: (month: string) => void;
  onOpenCustomPeriod: () => void;
}

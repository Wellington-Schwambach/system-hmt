import type { FinancialEntry, SettlementTotals, SettlementTravelRecord, VehicleAverageSummaryData } from '../../types';

export interface PrintReportProps {
  driver: string;
  startDate: string;
  endDate: string;
  travels: SettlementTravelRecord[];
  vehicleSummaries: VehicleAverageSummaryData[];
  entries: FinancialEntry[];
  totals: SettlementTotals;
}

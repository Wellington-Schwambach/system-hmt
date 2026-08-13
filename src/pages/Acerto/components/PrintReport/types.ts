import type { FinancialEntry, SettlementTotals, VehicleAverageSummaryData } from '../../types';
import type { TravelRecord } from '../../../Travel/types';

export interface PrintReportProps {
  driver: string;
  startDate: string;
  endDate: string;
  travels: TravelRecord[];
  vehicleSummaries: VehicleAverageSummaryData[];
  entries: FinancialEntry[];
  totals: SettlementTotals;
}

import type { SettlementFuelRecord, VehicleAverageSummaryData } from '../../types';

export interface VehicleAverageSummaryProps {
  summaries: VehicleAverageSummaryData[];
  fuelRecords: SettlementFuelRecord[];
  selectedFuelRecordIds: number[];
  onToggleFuelRecord: (recordId: number) => void;
  onSelectGroup: (groupKey: string, selected: boolean) => void;
}

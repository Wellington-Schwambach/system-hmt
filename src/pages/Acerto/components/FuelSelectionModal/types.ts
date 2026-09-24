import type { SettlementFuelRecord } from '../../types';

export interface FuelSelectionModalProps {
  isOpen: boolean;
  fuelRecords: SettlementFuelRecord[];
  selectedFuelRecordIds: number[];
  onToggleFuelRecord: (recordId: number) => void;
  onSelectGroup: (groupKey: string, selected: boolean) => void;
  onClose: () => void;
}

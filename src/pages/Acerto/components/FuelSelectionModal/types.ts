import type { FuelRecord } from '../../../Fuel/types';

export interface FuelSelectionModalProps {
  isOpen: boolean;
  fuelRecords: FuelRecord[];
  selectedFuelRecordIds: number[];
  onToggleFuelRecord: (recordId: number) => void;
  onSelectPlate: (plate: string, selected: boolean) => void;
  onClose: () => void;
}

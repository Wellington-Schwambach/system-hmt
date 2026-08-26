import type {
  FuelDriverOption,
  FuelFormData,
  FuelRecordWithMetrics,
  FuelVehicleOption,
} from '../../types';

export interface FuelFormModalProps {
  isOpen: boolean;
  editingRecord?: FuelRecordWithMetrics | null;
  vehicleOptions: FuelVehicleOption[];
  driverOptions: FuelDriverOption[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: FuelFormData) => Promise<boolean>;
}

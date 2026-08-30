import type {
  FuelDriverOption,
  FuelFormData,
  FuelRecordWithMetrics,
  FuelVehicleOption,
  FuelTrailerOption,
  FuelActiveSetOption,
} from '../../types';

export interface FuelFormModalProps {
  isOpen: boolean;
  editingRecord?: FuelRecordWithMetrics | null;
  vehicleOptions: FuelVehicleOption[];
  trailerOptions: FuelTrailerOption[];
  activeSets: FuelActiveSetOption[];
  driverOptions: FuelDriverOption[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: FuelFormData) => Promise<boolean>;
}

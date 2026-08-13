import type { FuelFormData, FuelRecordWithMetrics } from '../../types';

export interface FuelFormModalProps {
  isOpen: boolean;
  editingRecord?: FuelRecordWithMetrics | null;
  onClose: () => void;
  onSubmit: (data: FuelFormData) => void;
}

import type { VehicleFormData, VehicleOperationResult, VehicleRecord } from '../../types';

export interface VehicleFormProps {
  editingRecord: VehicleRecord | null;
  saving: boolean;
  onCancelEditing: () => void;
  onSubmit: (formData: VehicleFormData, editingId?: number) => Promise<VehicleOperationResult>;
}

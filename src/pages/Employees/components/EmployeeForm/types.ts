import type { EmployeeFormData, EmployeeOperationResult, EmployeeRecord } from '../../types';

export interface EmployeeFormProps {
  editingRecord: EmployeeRecord | null;
  saving: boolean;
  onCancelEditing: () => void;
  onSubmit: (
    formData: EmployeeFormData,
    editingId?: number,
  ) => Promise<EmployeeOperationResult>;
}

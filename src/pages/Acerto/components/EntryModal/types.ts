import type { FinancialEntryFormData, FinancialEntryType } from '../../types';

export interface EntryModalProps {
  isOpen: boolean;
  type: FinancialEntryType;
  initialData?: FinancialEntryFormData | null;
  editing?: boolean;
  onClose: () => void;
  onSubmit: (formData: FinancialEntryFormData) => boolean;
}

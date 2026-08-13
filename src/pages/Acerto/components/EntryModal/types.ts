import type { FinancialEntryFormData, FinancialEntryType } from '../../types';

export interface EntryModalProps {
  isOpen: boolean;
  type: FinancialEntryType;
  onClose: () => void;
  onSubmit: (formData: FinancialEntryFormData) => boolean;
}

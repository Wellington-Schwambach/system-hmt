import type { FinancialEntry } from '../../types';
import type { ValeFormData } from '../../../Vales/types';

export interface ValeEntryEditModalProps {
  isOpen: boolean;
  entry: FinancialEntry;
  onClose: () => void;
  onSubmit: (form: ValeFormData) => Promise<boolean>;
}

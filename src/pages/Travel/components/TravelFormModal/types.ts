import type {
  TravelFormData,
  TravelOperationResult,
  TravelOptionShipper,
  TravelOptions,
  TravelRecordWithMetrics,
} from '../../types';

export interface TravelFormModalProps {
  isOpen: boolean;
  editingRecord?: TravelRecordWithMetrics | null;
  options: TravelOptions;
  optionsLoading: boolean;
  saving: boolean;
  creatingShipper: boolean;
  onClose: () => void;
  onSubmit: (data: TravelFormData) => Promise<TravelOperationResult>;
  onCreateShipper: (name: string) => Promise<TravelOptionShipper | null>;
}

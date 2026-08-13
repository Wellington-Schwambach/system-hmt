export interface PeriodModalProps {
  isOpen: boolean;
  initialStartDate: string;
  initialEndDate: string;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

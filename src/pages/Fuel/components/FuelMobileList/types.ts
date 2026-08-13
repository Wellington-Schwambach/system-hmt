import type { FuelRecordWithMetrics } from '../../types';

export interface FuelMobileListProps {
  records: FuelRecordWithMetrics[];
  onEdit: (record: FuelRecordWithMetrics) => void;
  onInvoice: (record: FuelRecordWithMetrics) => void;
}

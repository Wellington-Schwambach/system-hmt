import type { FuelRecordWithMetrics } from '../../types';

export interface FuelTableProps {
  records: FuelRecordWithMetrics[];
  onEdit: (record: FuelRecordWithMetrics) => void;
  onInvoice: (record: FuelRecordWithMetrics) => void;
}

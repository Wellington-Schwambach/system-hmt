import type { FuelInvoiceTarget, FuelRecordWithMetrics } from '../../types';

export interface FuelMobileListProps {
  records: FuelRecordWithMetrics[];
  deletingId?: number | null;
  invoicingKey?: string | null;
  onEdit: (record: FuelRecordWithMetrics) => void;
  onInvoice: (record: FuelRecordWithMetrics, target: FuelInvoiceTarget) => void;
  onDelete: (record: FuelRecordWithMetrics) => void;
}

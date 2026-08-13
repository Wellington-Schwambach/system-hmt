import type { TravelRecordWithMetrics } from '../../types';

export interface TravelTableProps {
  records: TravelRecordWithMetrics[];
  loading: boolean;
  deletingId: number | null;
  onEdit: (record: TravelRecordWithMetrics) => void;
  onDelete: (record: TravelRecordWithMetrics) => void;
}

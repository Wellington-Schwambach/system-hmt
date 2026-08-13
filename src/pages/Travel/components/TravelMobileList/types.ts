import type { TravelRecordWithMetrics } from '../../types';

export interface TravelMobileListProps {
  records: TravelRecordWithMetrics[];
  loading: boolean;
  deletingId: number | null;
  onEdit: (record: TravelRecordWithMetrics) => void;
  onDelete: (record: TravelRecordWithMetrics) => void;
}

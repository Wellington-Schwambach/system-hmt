import type { VehicleRecord, VehicleStatus } from '../../types';

export interface VehicleListProps {
  records: VehicleRecord[];
  totalRecords: number;
  searchTerm: string;
  statusFilter: VehicleStatus | 'ALL';
  loading: boolean;
  deletingId: number | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: VehicleStatus | 'ALL') => void;
  onCreate: () => void;
  onEdit: (record: VehicleRecord) => void;
  onDelete: (record: VehicleRecord) => void;
  onDownloadCrlv: (record: VehicleRecord) => void;
  onExport: () => void;
}

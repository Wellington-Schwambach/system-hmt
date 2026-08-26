import type { VehiclePlateEndFilter, VehicleRecord, VehicleStatus } from '../../types';

export interface VehicleListProps {
  records: VehicleRecord[];
  totalRecords: number;
  searchTerm: string;
  statusFilter: VehicleStatus | 'ALL';
  plateEndFilter: VehiclePlateEndFilter;
  loading: boolean;
  deletingId: number | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: VehicleStatus | 'ALL') => void;
  onPlateEndFilterChange: (value: VehiclePlateEndFilter) => void;
  onCreate: () => void;
  onEdit: (record: VehicleRecord) => void;
  onDelete: (record: VehicleRecord) => void;
  onDownloadCrlv: (record: VehicleRecord) => void;
  onExport: () => void;
}

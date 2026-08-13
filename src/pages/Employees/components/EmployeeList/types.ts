import type { EmployeeDocumentType, EmployeeRecord, EmployeeStatus } from '../../types';

export interface EmployeeListProps {
  records: EmployeeRecord[];
  totalRecords: number;
  searchTerm: string;
  statusFilter: EmployeeStatus | 'ALL';
  loading: boolean;
  deletingId: number | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: EmployeeStatus | 'ALL') => void;
  onCreate: () => void;
  onEdit: (record: EmployeeRecord) => void;
  onDelete: (record: EmployeeRecord) => void;
  onDownloadDocument: (record: EmployeeRecord, type: EmployeeDocumentType) => void;
  onExport: () => void;
}

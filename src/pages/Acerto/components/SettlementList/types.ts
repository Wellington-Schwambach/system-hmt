import type { DriverSettlementSnapshot } from '../../types';

export interface SettlementListProps {
  settlements: DriverSettlementSnapshot[];
  onView: (settlement: DriverSettlementSnapshot) => void;
  onPrint: (settlement: DriverSettlementSnapshot) => void;
  onEdit: (settlement: DriverSettlementSnapshot) => void;
  onDelete: (settlement: DriverSettlementSnapshot) => void;
}

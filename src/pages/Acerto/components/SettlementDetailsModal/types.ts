import type { DriverSettlementSnapshot } from '../../types';

export interface SettlementDetailsModalProps {
  settlement: DriverSettlementSnapshot;
  onClose: () => void;
  onPrint: (settlement: DriverSettlementSnapshot) => void;
}

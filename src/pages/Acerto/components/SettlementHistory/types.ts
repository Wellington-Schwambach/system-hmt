import type { SettlementHistoryEvent } from '../../types';

export interface SettlementHistoryProps {
  events: SettlementHistoryEvent[];
  loading: boolean;
  onRefresh: () => void;
}

import type { SettlementTab } from '../../types';

export interface SettlementTabsProps {
  activeTab: SettlementTab;
  settlementsCount: number;
  showHistory: boolean;
  onChange: (tab: SettlementTab) => void;
}

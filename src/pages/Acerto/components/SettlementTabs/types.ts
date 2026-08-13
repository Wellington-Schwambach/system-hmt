import type { SettlementTab } from '../../types';

export interface SettlementTabsProps {
  activeTab: SettlementTab;
  settlementsCount: number;
  onChange: (tab: SettlementTab) => void;
}

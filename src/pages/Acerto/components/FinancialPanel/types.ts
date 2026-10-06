import type { FinancialEntry, FinancialEntryType, SettlementTotals } from '../../types';

export interface FinancialPanelProps {
  bonusPercent: string;
  suggestedBonusPercent: number;
  baseSalary: string;
  otherEarnings: string;
  entries: FinancialEntry[];
  totals: SettlementTotals;
  valesLoadError?: boolean;
  onBonusPercentChange: (value: string) => void;
  onBaseSalaryChange: (value: string) => void;
  onOtherEarningsChange: (value: string) => void;
  onAddEntry: (type: FinancialEntryType) => void;
  onEditEntry: (entry: FinancialEntry) => void;
  onRemoveEntry: (entryId: string) => void;
  onRetryVales?: () => void;
}

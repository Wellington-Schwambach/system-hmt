import type { FinancialEntry, FinancialEntryType, SettlementTotals } from '../../types';

export interface FinancialPanelProps {
  bonusPercent: string;
  suggestedBonusPercent: number;
  baseSalary: string;
  dailyAllowance: string;
  otherEarnings: string;
  entries: FinancialEntry[];
  totals: SettlementTotals;
  onBonusPercentChange: (value: string) => void;
  onBaseSalaryChange: (value: string) => void;
  onDailyAllowanceChange: (value: string) => void;
  onOtherEarningsChange: (value: string) => void;
  onApplySuggestedBonus: () => void;
  onAddEntry: (type: FinancialEntryType) => void;
  onRemoveEntry: (entryId: string) => void;
}

import type { FinancialEntryFormData, FinancialEntryType } from './types';

export const SETTLEMENT_STORAGE_KEY = 'hmt-driver-settlements';

export const INITIAL_FINANCIAL_ENTRY_FORM: FinancialEntryFormData = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  value: '',
};

export const BONUS_RULES = [
  { minimumAverage: 3.8, percent: 10 },
  { minimumAverage: 3.5, percent: 9 },
  { minimumAverage: 3.2, percent: 8 },
  { minimumAverage: 2.9, percent: 7 },
  { minimumAverage: 0, percent: 6 },
] as const;

export const ENTRY_LABELS: Record<FinancialEntryType, string> = {
  ADVANCE: 'Vale',
  FINE: 'Multa',
  OTHER_DISCOUNT: 'Outro desconto',
};

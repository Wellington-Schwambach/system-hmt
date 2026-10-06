import type { FinancialEntryFormData, FinancialEntryType } from './types';

export const SETTLEMENT_STORAGE_KEY = 'hmt-driver-settlements';

export const INITIAL_FINANCIAL_ENTRY_FORM: FinancialEntryFormData = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  value: '',
};

export const ENTRY_LABELS: Record<FinancialEntryType, string> = {
  ADVANCE: 'Vale',
  FINE: 'Multa',
  LOAN: 'Empréstimo',
  OTHER_DISCOUNT: 'Outro desconto',
  NEUTRAL_EXPENSE: 'Despesa',
};

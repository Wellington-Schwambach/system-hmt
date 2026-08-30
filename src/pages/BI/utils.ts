import { MONTH_OPTIONS } from './constants';
import type { BIPeriod } from './types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return '—';
  return `${day}/${month}/${year}`;
}

export function formatPeriodLabel(period: BIPeriod): string {
  if (period.month === 0) {
    return `Ano completo de ${period.year}`;
  }

  const month = MONTH_OPTIONS.find((option) => option.value === period.month);
  return `${month?.label ?? 'Mês'} de ${period.year}`;
}

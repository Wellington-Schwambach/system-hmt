import type { FuelRecord, FuelType, FuelRecordWithMetrics, FuelStatus, FuelSummary, PersistedFuelRecord } from './types';

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}/${month}/${year}` : date;
}

export function formatBillingMonth(value: string): string {
  const [year, month] = value.split('-');
  return year && month ? `${month}/${year}` : value;
}

export function formatDecimal(value: number): string {
  return numberFormatter.format(value);
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function getFuelTypeLabel(type: FuelType): string {
  return type === 'DIESEL' ? 'Diesel' : 'Arla';
}

export function getFuelStatusLabel(status: FuelStatus): string {
  const labels: Record<FuelStatus, string> = {
    F: 'Faturado',
    P: 'Metade faturado',
    N: 'Não faturado',
  };

  return labels[status];
}

export function parseDecimalInput(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function calculateValuePerLiter(totalValue: number, liters: number): number {
  return liters > 0 ? totalValue / liters : 0;
}

export function calculateVehicleAverage(
  vehicleCurrentKm: number,
  fuelKm: number | null,
  dieselLiters: number,
): number {
  if (vehicleCurrentKm <= 0 || fuelKm === null || dieselLiters <= 0) return 0;
  if (fuelKm < vehicleCurrentKm) return 0;

  return (fuelKm - vehicleCurrentKm) / dieselLiters;
}

export function calculateFuelStatus(
  dieselInvoiced: boolean,
  arlaInvoiced: boolean,
  hasArla: boolean,
): FuelStatus {
  if (dieselInvoiced && (!hasArla || arlaInvoiced)) return 'F';
  if (hasArla && (dieselInvoiced || arlaInvoiced)) return 'P';
  return 'N';
}

export function enrichFuelRecords(records: FuelRecord[]): FuelRecordWithMetrics[] {
  return [...records]
    .sort((a, b) => {
      const billingMonthComparison = b.billingMonth.localeCompare(a.billingMonth);
      if (billingMonthComparison !== 0) return billingMonthComparison;

      const dateComparison = b.date.localeCompare(a.date);
      return dateComparison !== 0 ? dateComparison : b.id - a.id;
    })
    .map((record) => ({
      ...record,
      dieselAverage: record.dieselAverage,
      dieselValuePerLiter: calculateValuePerLiter(record.dieselTotalValue, record.dieselLiters),
      arlaValuePerLiter: calculateValuePerLiter(record.arlaTotalValue, record.arlaLiters),
      totalValue: record.dieselTotalValue + record.arlaTotalValue,
    }));
}

export function getFuelSummary(records: FuelRecordWithMetrics[]): FuelSummary {
  return records.reduce<FuelSummary>(
    (summary, record) => ({
      totalRecords: summary.totalRecords + 1,
      totalDieselLiters: summary.totalDieselLiters + record.dieselLiters,
      totalArlaLiters: summary.totalArlaLiters + record.arlaLiters,
      totalDieselValue: summary.totalDieselValue + record.dieselTotalValue,
      totalArlaValue: summary.totalArlaValue + record.arlaTotalValue,
      totalValue: summary.totalValue + record.totalValue,
    }),
    {
      totalRecords: 0,
      totalDieselLiters: 0,
      totalArlaLiters: 0,
      totalDieselValue: 0,
      totalArlaValue: 0,
      totalValue: 0,
    },
  );
}

export function normalizeFuelRecords(records: PersistedFuelRecord[]): FuelRecord[] {
  return records.map((record) => ({ ...record }));
}

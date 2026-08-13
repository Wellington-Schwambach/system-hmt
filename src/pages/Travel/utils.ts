import type { TravelRecord, TravelRecordWithMetrics, TravelSummary } from './types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(date: string): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function parseDecimalInput(value: string): number {
  const trimmedValue = value.trim();

  if (!trimmedValue) return 0;

  const normalizedValue = trimmedValue
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function getShipperLabel(shipper: string): string {
  return shipper || 'Não informado';
}

export function getDriverDisplay(record: TravelRecord): string {
  if (record.operationType === 'THIRD_PARTY') {
    return `Terceiro: ${record.thirdPartyName || 'Não informado'}`;
  }

  return record.driver || [record.driverOne, record.driverTwo].filter(Boolean).join(' / ') || 'Não informado';
}

export function enrichTravelRecords(records: TravelRecord[]): TravelRecordWithMetrics[] {
  return [...records]
    .sort((firstRecord, secondRecord) => {
      const dateComparison = secondRecord.date.localeCompare(firstRecord.date);
      return dateComparison !== 0 ? dateComparison : secondRecord.id - firstRecord.id;
    })
    .map((record) => ({
      ...record,
      freightDifference: Math.max(record.grossFreight - record.netFreight, 0),
      driverDisplay: getDriverDisplay(record),
    }));
}

export function getTravelSummary(records: TravelRecordWithMetrics[]): TravelSummary {
  return records.reduce<TravelSummary>(
    (summary, record) => ({
      totalTrips: summary.totalTrips + 1,
      totalGrossFreight: summary.totalGrossFreight + record.grossFreight,
      totalNetFreight: summary.totalNetFreight + record.netFreight,
      totalDifference: summary.totalDifference + record.freightDifference,
      totalInsurance: summary.totalInsurance + record.insuranceAmount,
      totalToll: summary.totalToll + record.tollAmount,
      totalIcms: summary.totalIcms + record.icmsAmount,
    }),
    {
      totalTrips: 0,
      totalGrossFreight: 0,
      totalNetFreight: 0,
      totalDifference: 0,
      totalInsurance: 0,
      totalToll: 0,
      totalIcms: 0,
    },
  );
}

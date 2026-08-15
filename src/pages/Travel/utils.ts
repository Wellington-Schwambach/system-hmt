import type { TravelCteTypeFilter, TravelRecord, TravelRecordWithMetrics, TravelSummary } from './types';

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

export function getTravelSummary(
  records: TravelRecordWithMetrics[],
  cteTypeFilter: TravelCteTypeFilter = 'ALL',
): TravelSummary {
  return records.reduce<TravelSummary>(
    (summary, record) => {
      const ctes = cteTypeFilter === 'ALL'
        ? record.ctes
        : record.ctes.filter((cte) => cte.cteType === cteTypeFilter);

      const useRecordTotals = cteTypeFilter === 'ALL' || ctes.length === 0;
      const netFreight = useRecordTotals
        ? record.netFreight
        : ctes.reduce((total, cte) => total + cte.netFreight, 0);
      const grossFreight = useRecordTotals
        ? record.grossFreight
        : ctes.reduce((total, cte) => total + cte.grossFreight, 0);
      const insurance = useRecordTotals
        ? record.insuranceAmount
        : ctes.reduce((total, cte) => total + cte.insuranceAmount, 0);
      const toll = useRecordTotals
        ? record.tollAmount
        : ctes.reduce((total, cte) => total + cte.tollAmount, 0);
      const icms = useRecordTotals
        ? record.icmsAmount
        : ctes.reduce((total, cte) => total + cte.icmsAmount, 0);

      return {
        totalTrips: summary.totalTrips + 1,
        totalGrossFreight: summary.totalGrossFreight + grossFreight,
        totalNetFreight: summary.totalNetFreight + netFreight,
        totalDifference: summary.totalDifference + Math.max(grossFreight - netFreight, 0),
        totalInsurance: summary.totalInsurance + insurance,
        totalToll: summary.totalToll + toll,
        totalIcms: summary.totalIcms + icms,
      };
    },
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

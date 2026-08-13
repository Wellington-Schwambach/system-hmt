import type {
  FuelRecord,
  FuelType,
  FuelRecordWithMetrics,
  FuelStatus,
  FuelSummary,
  LegacyFuelRecord,
  PersistedFuelRecord,
} from './types';

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
  return `${day}/${month}/${year}`;
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
  const labels: Record<FuelType, string> = {
    DIESEL: 'Diesel',
    ARLA: 'Arla',
  };

  return labels[type];
}

export function getFuelStatusLabel(status: FuelStatus): string {
  const labels: Record<FuelStatus, string> = {
    F: 'Faturado',
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
  if (liters <= 0) {
    return 0;
  }

  return totalValue / liters;
}

export function calculateVehicleAverage(km: number, dieselLiters: number): number | null {
  if (km <= 0 || dieselLiters <= 0) {
    return null;
  }

  return km / dieselLiters;
}

function isLegacyFuelRecord(record: PersistedFuelRecord): record is LegacyFuelRecord {
  return 'type' in record && 'liters' in record;
}

function getLegacyTotalValue(record: LegacyFuelRecord): number {
  if (typeof record.totalValue === 'number') {
    return record.totalValue;
  }

  return record.liters * (record.valuePerLiter ?? 0);
}

function normalizeStatus(status: 'P' | 'F' | 'N'): FuelStatus {
  return status === 'F' ? 'F' : 'N';
}

function createRecordFromLegacy(record: LegacyFuelRecord): FuelRecord {
  const totalValue = getLegacyTotalValue(record);

  return {
    id: record.id,
    date: record.date,
    station: record.station,
    plate: record.plate?.trim() || 'SKT8H52',
    km: record.km,
    dieselLiters: record.type === 'DIESEL' ? record.liters : 0,
    dieselTotalValue: record.type === 'DIESEL' ? totalValue : 0,
    arlaLiters: record.type === 'ARLA' ? record.liters : 0,
    arlaTotalValue: record.type === 'ARLA' ? totalValue : 0,
    driver: record.driver,
    status: normalizeStatus(record.status),
  };
}

function canMergeLegacyRecords(baseRecord: FuelRecord, candidate: FuelRecord): boolean {
  const sameContext =
    baseRecord.date === candidate.date &&
    baseRecord.station === candidate.station &&
    baseRecord.driver === candidate.driver &&
    baseRecord.plate === candidate.plate;

  const closeKm = Math.abs(baseRecord.km - candidate.km) <= 5;
  const complementaryFuel =
    (baseRecord.dieselLiters > 0 && candidate.arlaLiters > 0) ||
    (baseRecord.arlaLiters > 0 && candidate.dieselLiters > 0);

  return sameContext && closeKm && complementaryFuel;
}

function mergeFuelRecords(baseRecord: FuelRecord, candidate: FuelRecord): FuelRecord {
  return {
    ...baseRecord,
    id: baseRecord.dieselLiters > 0 ? baseRecord.id : candidate.id,
    km: Math.max(baseRecord.km, candidate.km),
    dieselLiters: Math.max(baseRecord.dieselLiters, candidate.dieselLiters),
    dieselTotalValue: Math.max(baseRecord.dieselTotalValue, candidate.dieselTotalValue),
    arlaLiters: Math.max(baseRecord.arlaLiters, candidate.arlaLiters),
    arlaTotalValue: Math.max(baseRecord.arlaTotalValue, candidate.arlaTotalValue),
    status: baseRecord.status === 'F' && candidate.status === 'F' ? 'F' : 'N',
  };
}

export function normalizeFuelRecords(records: PersistedFuelRecord[]): FuelRecord[] {
  const normalizedRecords: FuelRecord[] = records.map((record) => {
    if (isLegacyFuelRecord(record)) {
      return createRecordFromLegacy(record);
    }

    return {
      ...record,
      plate: record.plate?.trim() || 'SKT8H52',
      dieselLiters: Number(record.dieselLiters) || 0,
      dieselTotalValue: Number(record.dieselTotalValue) || 0,
      arlaLiters: Number(record.arlaLiters) || 0,
      arlaTotalValue: Number(record.arlaTotalValue) || 0,
      status: record.status === 'F' ? ('F' as const) : ('N' as const),
    };
  });

  return normalizedRecords.reduce<FuelRecord[]>((result, record) => {
    const mergeIndex = result.findIndex((currentRecord) =>
      canMergeLegacyRecords(currentRecord, record),
    );

    if (mergeIndex === -1) {
      return [...result, record];
    }

    const updatedResult = [...result];
    updatedResult[mergeIndex] = mergeFuelRecords(updatedResult[mergeIndex], record);
    return updatedResult;
  }, []);
}

export function enrichFuelRecords(records: FuelRecord[]): FuelRecordWithMetrics[] {
  return [...records]
    .sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      return dateComparison !== 0 ? dateComparison : b.km - a.km;
    })
    .map((record) => ({
      ...record,
      dieselAverage: calculateVehicleAverage(record.km, record.dieselLiters),
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
      totalValue: summary.totalValue + record.totalValue,
    }),
    {
      totalRecords: 0,
      totalDieselLiters: 0,
      totalArlaLiters: 0,
      totalValue: 0,
    },
  );
}

import { FUEL_STORAGE_KEY, INITIAL_FUEL_RECORDS } from '../Fuel/constants';
import type { FuelRecord, PersistedFuelRecord } from '../Fuel/types';
import { normalizeFuelRecords } from '../Fuel/utils';
import { INITIAL_TRAVEL_RECORDS, TRAVEL_STORAGE_KEY } from '../Travel/constants';
import type { PersistedTravelRecord, Shipper, TravelRecord } from '../Travel/types';
import { getShipperLabel } from '../Travel/utils';
import { MONTH_OPTIONS } from './constants';
import type {
  BIActivityItem,
  BIDataSet,
  BIMetrics,
  BIPeriod,
  MonthlyPerformanceItem,
  ShipperPerformanceItem,
  VehiclePerformanceItem,
} from './types';

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

function isTravelRecord(record: unknown): record is PersistedTravelRecord {
  if (!record || typeof record !== 'object') {
    return false;
  }

  const candidate = record as Partial<PersistedTravelRecord>;

  return (
    (typeof candidate.id === 'string' || typeof candidate.id === 'number') &&
    typeof candidate.date === 'string' &&
    typeof candidate.origin === 'string' &&
    typeof candidate.destination === 'string' &&
    typeof candidate.grossFreight === 'number' &&
    typeof candidate.netFreight === 'number' &&
    typeof candidate.cteNumber === 'string' &&
    typeof candidate.shipper === 'string'
  );
}

function normalizeTravelRecords(records: PersistedTravelRecord[]): TravelRecord[] {
  return records.map((record) => ({
    ...record,
    receivedDate: record.receivedDate ?? '',
    plate: record.plate?.trim().toLocaleUpperCase('pt-BR') || 'Sem placa',
    driver: record.driver?.trim() || 'Motorista não informado',
    shipper: record.shipper as Shipper,
  }));
}

function loadFuelRecords(): FuelRecord[] {
  try {
    const savedRecords = window.localStorage.getItem(FUEL_STORAGE_KEY);

    if (!savedRecords) {
      return INITIAL_FUEL_RECORDS;
    }

    const parsedRecords = JSON.parse(savedRecords) as PersistedFuelRecord[];
    return Array.isArray(parsedRecords)
      ? normalizeFuelRecords(parsedRecords)
      : INITIAL_FUEL_RECORDS;
  } catch {
    return INITIAL_FUEL_RECORDS;
  }
}

function loadTravelRecords(): TravelRecord[] {
  try {
    const savedRecords = window.localStorage.getItem(TRAVEL_STORAGE_KEY);

    if (!savedRecords) {
      return INITIAL_TRAVEL_RECORDS;
    }

    const parsedRecords = JSON.parse(savedRecords) as unknown;

    if (!Array.isArray(parsedRecords)) {
      return INITIAL_TRAVEL_RECORDS;
    }

    const validRecords = parsedRecords.filter(isTravelRecord);
    return validRecords.length > 0 ? normalizeTravelRecords(validRecords) : INITIAL_TRAVEL_RECORDS;
  } catch {
    return INITIAL_TRAVEL_RECORDS;
  }
}

export function loadBIData(): BIDataSet {
  return {
    fuelRecords: loadFuelRecords(),
    travelRecords: loadTravelRecords(),
  };
}

export function getRecordYear(date: string): number {
  return Number(date.slice(0, 4));
}

export function getRecordMonth(date: string): number {
  return Number(date.slice(5, 7));
}

export function getAvailableYears(data: BIDataSet): number[] {
  const years = new Set<number>();

  data.fuelRecords.forEach((record) => years.add(getRecordYear(record.date)));
  data.travelRecords.forEach((record) => years.add(getRecordYear(record.date)));
  years.add(new Date().getFullYear());

  return [...years].filter(Number.isFinite).sort((first, second) => second - first);
}

export function getInitialPeriod(data: BIDataSet): BIPeriod {
  const dates = [...data.fuelRecords, ...data.travelRecords]
    .map((record) => record.date)
    .filter(Boolean)
    .sort((first, second) => second.localeCompare(first));

  const latestDate = dates[0] ?? new Date().toISOString().slice(0, 10);

  return {
    year: getRecordYear(latestDate),
    month: getRecordMonth(latestDate),
  };
}

export function matchesPeriod(date: string, period: BIPeriod): boolean {
  const matchesYear = getRecordYear(date) === period.year;
  const matchesMonth = period.month === 0 || getRecordMonth(date) === period.month;
  return matchesYear && matchesMonth;
}

export function getPreviousPeriod(period: BIPeriod): BIPeriod {
  if (period.month === 0) {
    return { year: period.year - 1, month: 0 };
  }

  if (period.month === 1) {
    return { year: period.year - 1, month: 12 };
  }

  return { year: period.year, month: period.month - 1 };
}

export function calculateMetrics(data: BIDataSet, period: BIPeriod): BIMetrics {
  const fuelRecords = data.fuelRecords.filter((record) => matchesPeriod(record.date, period));
  const travelRecords = data.travelRecords.filter((record) => matchesPeriod(record.date, period));

  const fuelInvestment = fuelRecords.reduce(
    (total, record) => total + record.dieselTotalValue + record.arlaTotalValue,
    0,
  );
  const dieselLiters = fuelRecords.reduce((total, record) => total + record.dieselLiters, 0);
  const arlaLiters = fuelRecords.reduce((total, record) => total + record.arlaLiters, 0);
  const grossFreight = travelRecords.reduce((total, record) => total + record.grossFreight, 0);
  const netFreight = travelRecords.reduce((total, record) => total + record.netFreight, 0);
  const freightDifference = grossFreight - netFreight;

  return {
    fuelInvestment,
    dieselLiters,
    arlaLiters,
    fuelings: fuelRecords.length,
    trips: travelRecords.length,
    grossFreight,
    netFreight,
    freightDifference,
    operationalResult: netFreight - fuelInvestment,
    averageFreight: travelRecords.length > 0 ? netFreight / travelRecords.length : 0,
    averageFuelTicket: fuelRecords.length > 0 ? fuelInvestment / fuelRecords.length : 0,
  };
}

export function calculatePercentageDelta(
  currentValue: number,
  previousValue: number,
): number | null {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }

  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

export function getMonthlyPerformance(data: BIDataSet, year: number): MonthlyPerformanceItem[] {
  return MONTH_OPTIONS.filter((month) => month.value > 0).map((month) => {
    const period = { year, month: month.value };
    const metrics = calculateMetrics(data, period);

    return {
      month: month.value,
      label: month.label,
      shortLabel: month.shortLabel,
      trips: metrics.trips,
      netFreight: metrics.netFreight,
      fuelInvestment: metrics.fuelInvestment,
      operationalResult: metrics.operationalResult,
    };
  });
}

export function getVehiclePerformance(data: BIDataSet, period: BIPeriod): VehiclePerformanceItem[] {
  const vehicles = new Map<string, VehiclePerformanceItem>();

  data.travelRecords
    .filter((record) => matchesPeriod(record.date, period))
    .forEach((record) => {
      const current = vehicles.get(record.plate) ?? {
        plate: record.plate,
        trips: 0,
        netFreight: 0,
        fuelInvestment: 0,
        dieselLiters: 0,
        operationalResult: 0,
      };

      current.trips += 1;
      current.netFreight += record.netFreight;
      vehicles.set(record.plate, current);
    });

  data.fuelRecords
    .filter((record) => matchesPeriod(record.date, period))
    .forEach((record) => {
      const current = vehicles.get(record.plate) ?? {
        plate: record.plate,
        trips: 0,
        netFreight: 0,
        fuelInvestment: 0,
        dieselLiters: 0,
        operationalResult: 0,
      };

      current.fuelInvestment += record.dieselTotalValue + record.arlaTotalValue;
      current.dieselLiters += record.dieselLiters;
      vehicles.set(record.plate, current);
    });

  return [...vehicles.values()]
    .map((vehicle) => ({
      ...vehicle,
      operationalResult: vehicle.netFreight - vehicle.fuelInvestment,
    }))
    .sort((first, second) => second.operationalResult - first.operationalResult);
}

export function getShipperPerformance(data: BIDataSet, period: BIPeriod): ShipperPerformanceItem[] {
  const selectedTravels = data.travelRecords.filter((record) => matchesPeriod(record.date, period));
  const totalNetFreight = selectedTravels.reduce((total, record) => total + record.netFreight, 0);
  const shippers = new Map<Shipper, Omit<ShipperPerformanceItem, 'label' | 'share'>>();

  selectedTravels.forEach((record) => {
    const current = shippers.get(record.shipper) ?? {
      shipper: record.shipper,
      trips: 0,
      netFreight: 0,
    };

    current.trips += 1;
    current.netFreight += record.netFreight;
    shippers.set(record.shipper, current);
  });

  return [...shippers.values()]
    .map((item) => ({
      ...item,
      label: getShipperLabel(item.shipper),
      share: totalNetFreight > 0 ? (item.netFreight / totalNetFreight) * 100 : 0,
    }))
    .sort((first, second) => second.netFreight - first.netFreight);
}

export function getRecentActivities(data: BIDataSet, period: BIPeriod): BIActivityItem[] {
  const travelActivities: BIActivityItem[] = data.travelRecords
    .filter((record) => matchesPeriod(record.date, period))
    .map((record) => ({
      id: `travel-${record.id}`,
      type: 'TRAVEL',
      date: record.date,
      title: `${record.origin} → ${record.destination}`,
      description: `CT-e ${record.cteNumber} • ${record.driver}`,
      value: record.netFreight,
      plate: record.plate,
    }));

  const fuelActivities: BIActivityItem[] = data.fuelRecords
    .filter((record) => matchesPeriod(record.date, period))
    .map((record) => ({
      id: `fuel-${record.id}`,
      type: 'FUEL',
      date: record.date,
      title: `Abastecimento em ${record.station}`,
      description: `${record.dieselLiters.toLocaleString('pt-BR')} L de diesel • ${record.driver}`,
      value: record.dieselTotalValue + record.arlaTotalValue,
      plate: record.plate,
    }));

  return [...travelActivities, ...fuelActivities]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 8);
}

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
  return `${day}/${month}/${year}`;
}

export function formatPeriodLabel(period: BIPeriod): string {
  if (period.month === 0) {
    return `Ano completo de ${period.year}`;
  }

  const month = MONTH_OPTIONS.find((option) => option.value === period.month);
  return `${month?.label ?? 'Mês'} de ${period.year}`;
}

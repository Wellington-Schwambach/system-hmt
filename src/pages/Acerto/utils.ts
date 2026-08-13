import { INITIAL_EMPLOYEE_RECORDS } from '../Employees/constants';
import { INITIAL_FUEL_RECORDS, FUEL_STORAGE_KEY } from '../Fuel/constants';
import type { FuelRecord, PersistedFuelRecord } from '../Fuel/types';
import { normalizeFuelRecords } from '../Fuel/utils';
import { INITIAL_TRAVEL_RECORDS, TRAVEL_STORAGE_KEY } from '../Travel/constants';
import type { PersistedTravelRecord, TravelRecord } from '../Travel/types';
import { getDriverOptions } from '../../utils/employeeDrivers';
import { BONUS_RULES } from './constants';
import type {
  FinancialEntry,
  LoadedSettlementData,
  SettlementTotals,
  VehicleAverageSummaryData,
} from './types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

export function formatDate(date: string): string {
  if (!date) {
    return '-';
  }

  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}/${month}/${year}` : date;
}

export function formatMonth(month: string): string {
  if (!month) {
    return '-';
  }

  const [year, monthNumber] = month.split('-');
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function parseDecimalInput(value: string): number {
  const normalized = value
    .trim()
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isPersistedTravelRecord(value: unknown): value is PersistedTravelRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const travel = value as Partial<PersistedTravelRecord>;

  return (
    (typeof travel.id === 'string' || typeof travel.id === 'number') &&
    typeof travel.date === 'string' &&
    typeof travel.origin === 'string' &&
    typeof travel.destination === 'string' &&
    typeof travel.netFreight === 'number' &&
    typeof travel.grossFreight === 'number' &&
    typeof travel.cteNumber === 'string' &&
    typeof travel.shipper === 'string'
  );
}

function loadTravelRecords(): TravelRecord[] {
  try {
    const storedTravels = window.localStorage.getItem(TRAVEL_STORAGE_KEY);

    if (!storedTravels) {
      return INITIAL_TRAVEL_RECORDS;
    }

    const parsedTravels = JSON.parse(storedTravels) as unknown;

    if (!Array.isArray(parsedTravels)) {
      return INITIAL_TRAVEL_RECORDS;
    }

    const driverFallbacks = getDriverOptions();

    return parsedTravels.filter(isPersistedTravelRecord).map((travel, index) => ({
      ...travel,
      receivedDate: travel.receivedDate ?? '',
      plate: travel.plate?.trim().toLocaleUpperCase('pt-BR') || 'SEM PLACA',
      driver:
        travel.driver?.trim() ||
        driverFallbacks[index % driverFallbacks.length] ||
        INITIAL_EMPLOYEE_RECORDS[0]?.fullName ||
        'Motorista',
    }));
  } catch {
    return INITIAL_TRAVEL_RECORDS;
  }
}

function loadFuelRecords(): FuelRecord[] {
  try {
    const storedFuelRecords = window.localStorage.getItem(FUEL_STORAGE_KEY);

    if (!storedFuelRecords) {
      return INITIAL_FUEL_RECORDS;
    }

    const parsedFuelRecords = JSON.parse(storedFuelRecords) as PersistedFuelRecord[];
    return Array.isArray(parsedFuelRecords)
      ? normalizeFuelRecords(parsedFuelRecords)
      : INITIAL_FUEL_RECORDS;
  } catch {
    return INITIAL_FUEL_RECORDS;
  }
}

export function loadSettlementData(): LoadedSettlementData {
  const travels = loadTravelRecords();
  const fuelRecords = loadFuelRecords();
  const drivers = getDriverOptions([
    ...travels.map((travel) => travel.driver),
    ...fuelRecords.map((fuelRecord) => fuelRecord.driver),
  ]);

  return { travels, fuelRecords, drivers };
}

export function getMonthDateRange(month: string): { startDate: string; endDate: string } {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const normalizedMonth = String(monthNumber).padStart(2, '0');

  return {
    startDate: `${year}-${normalizedMonth}-01`,
    endDate: `${year}-${normalizedMonth}-${String(lastDay).padStart(2, '0')}`,
  };
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export function driversMatch(firstDriver: string, secondDriver: string): boolean {
  const first = normalizeName(firstDriver);
  const second = normalizeName(secondDriver);

  if (!first || !second) {
    return false;
  }

  return (
    first === second ||
    first.includes(second) ||
    second.includes(first) ||
    first.split(' ')[0] === second.split(' ')[0]
  );
}

export function filterDriverTravels(
  travels: TravelRecord[],
  driver: string,
  startDate: string,
  endDate: string,
): TravelRecord[] {
  return travels
    .filter(
      (travel) =>
        driversMatch(travel.driver, driver) && travel.date >= startDate && travel.date <= endDate,
    )
    .sort((firstTravel, secondTravel) => secondTravel.date.localeCompare(firstTravel.date));
}

function calculateAverageFromFuelings(
  allPlateRecords: FuelRecord[],
  referenceRecords: FuelRecord[],
): { average: number | null; fuelingsCount: number } {
  let distance = 0;
  let liters = 0;
  let validFuelings = 0;

  referenceRecords.forEach((currentRecord) => {
    const currentIndex = allPlateRecords.findIndex((record) => record.id === currentRecord.id);
    const previousRecord = currentIndex > 0 ? allPlateRecords[currentIndex - 1] : undefined;
    const traveledDistance = previousRecord ? currentRecord.km - previousRecord.km : 0;

    if (traveledDistance > 0 && currentRecord.dieselLiters > 0) {
      distance += traveledDistance;
      liters += currentRecord.dieselLiters;
      validFuelings += 1;
    }
  });

  return {
    average: liters > 0 ? distance / liters : null,
    fuelingsCount: validFuelings,
  };
}

export function getVehicleAverageSummaries(
  travels: TravelRecord[],
  fuelRecords: FuelRecord[],
  driver: string,
  startDate: string,
  endDate: string,
): VehicleAverageSummaryData[] {
  const plateTripCounts = travels.reduce<Record<string, number>>((result, travel) => {
    result[travel.plate] = (result[travel.plate] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(plateTripCounts).map(([plate, tripsCount]) => {
    const allPlateRecords = fuelRecords
      .filter(
        (record) =>
          record.plate === plate && driversMatch(record.driver, driver) && record.date <= endDate,
      )
      .sort((firstRecord, secondRecord) => {
        const dateComparison = firstRecord.date.localeCompare(secondRecord.date);
        return dateComparison !== 0 ? dateComparison : firstRecord.km - secondRecord.km;
      });

    const periodRecords = allPlateRecords.filter(
      (record) => record.date >= startDate && record.date <= endDate,
    );

    const periodCalculation = calculateAverageFromFuelings(allPlateRecords, periodRecords);

    if (periodCalculation.average !== null) {
      return {
        plate,
        tripsCount,
        averageKmPerLiter: periodCalculation.average,
        fuelingsCount: periodCalculation.fuelingsCount,
        source: 'PERIOD' as const,
      };
    }

    const latestRecords = allPlateRecords.slice(-4);
    const latestCalculation = calculateAverageFromFuelings(allPlateRecords, latestRecords);

    return {
      plate,
      tripsCount,
      averageKmPerLiter: latestCalculation.average,
      fuelingsCount: latestCalculation.fuelingsCount,
      source: latestCalculation.average === null ? ('UNAVAILABLE' as const) : ('LATEST' as const),
    };
  });
}

export function getSuggestedBonusPercent(vehicleSummaries: VehicleAverageSummaryData[]): number {
  const validSummaries = vehicleSummaries.filter(
    (summary): summary is VehicleAverageSummaryData & { averageKmPerLiter: number } =>
      summary.averageKmPerLiter !== null,
  );

  if (validSummaries.length === 0) {
    return 6;
  }

  const totalTrips = validSummaries.reduce((sum, summary) => sum + summary.tripsCount, 0);
  const weightedAverage =
    validSummaries.reduce(
      (sum, summary) => sum + summary.averageKmPerLiter * summary.tripsCount,
      0,
    ) / Math.max(totalTrips, 1);

  return BONUS_RULES.find((rule) => weightedAverage >= rule.minimumAverage)?.percent ?? 6;
}

export function calculateSettlementTotals(
  travels: TravelRecord[],
  bonusPercent: number,
  baseSalary: number,
  dailyAllowance: number,
  otherEarnings: number,
  entries: FinancialEntry[],
): SettlementTotals {
  const totalNetFreight = travels.reduce((sum, travel) => sum + travel.netFreight, 0);
  const bonusValue = totalNetFreight * (bonusPercent / 100);
  const advances = entries
    .filter((entry) => entry.type === 'ADVANCE')
    .reduce((sum, entry) => sum + entry.value, 0);
  const fines = entries
    .filter((entry) => entry.type === 'FINE')
    .reduce((sum, entry) => sum + entry.value, 0);
  const otherDiscounts = entries
    .filter((entry) => entry.type === 'OTHER_DISCOUNT')
    .reduce((sum, entry) => sum + entry.value, 0);
  const totalEarnings = baseSalary + bonusValue + dailyAllowance + otherEarnings;
  const totalDiscounts = advances + fines + otherDiscounts;

  return {
    totalNetFreight,
    bonusPercent,
    bonusValue,
    baseSalary,
    dailyAllowance,
    otherEarnings,
    totalEarnings,
    advances,
    fines,
    otherDiscounts,
    totalDiscounts,
    totalReceivable: totalEarnings - totalDiscounts,
  };
}

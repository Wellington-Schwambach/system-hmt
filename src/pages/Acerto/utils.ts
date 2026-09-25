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
  SettlementCrewEvent,
  SettlementFuelRecord,
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
  // No Acerto entram somente colaboradores cadastrados como motoristas da empresa.
  // Motoristas de terceiros presentes em viagens/abastecimentos não entram no seletor.
  const drivers = getDriverOptions();

  return { travels, fuelRecords, crewEvents: [], drivers, driverOptions: [] };
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

function driverFreightShare(
  travel: TravelRecord,
  crew: CrewMember[],
  driver: string,
  driverId?: number | null,
): number {
  if (crew.length < 2) {
    return travel.netFreight;
  }

  // Faz o rateio em centavos para que a soma dos dois motoristas seja exatamente
  // igual ao frete original, inclusive quando o valor possuir um centavo ímpar.
  const totalCents = Math.round(travel.netFreight * 100);
  const primaryCents = Math.ceil(totalCents / 2);
  const secondaryCents = totalCents - primaryCents;
  const secondary = crew[1];
  const selectedIsSecondary = secondary
    ? memberMatchesDriver(secondary, driver, driverId)
    : false;

  return (selectedIsSecondary ? secondaryCents : primaryCents) / 100;
}

export function filterDriverTravels(
  travels: TravelRecord[],
  crewEvents: SettlementCrewEvent[],
  driver: string,
  startDate: string,
  endDate: string,
  driverId?: number | null,
): TravelRecord[] {
  const segments = buildCrewSegments(crewEvents);

  return travels
    .filter((travel) =>
      travel.operationType === 'FLEET' && travel.date >= startDate && travel.date <= endDate,
    )
    .map((travel): TravelRecord | null => {
      const crew = resolveTravelCrew(travel, segments, driver, driverId);
      if (crew === null || crew.length === 0) return null;

      const normalizedCrew = uniqueCrewMembers(crew);
      const primary = normalizedCrew[0] ?? null;
      const secondary = normalizedCrew[1] ?? null;

      return {
        ...travel,
        // Para o Acerto, os motoristas exibidos na viagem refletem quem estava
        // efetivamente ativo no conjunto na data da viagem. Isso faz o mesmo
        // recorte temporal usado pelas médias das abastecidas.
        driver: normalizedCrew.map((member) => member.name).filter(Boolean).join(' / '),
        driverOneId: primary?.id ?? null,
        driverOne: primary?.name ?? '',
        driverTwoId: secondary?.id ?? null,
        driverTwo: secondary?.name ?? '',
        netFreight: driverFreightShare(travel, normalizedCrew, driver, driverId),
      };
    })
    .filter((travel): travel is TravelRecord => travel !== null)
    .sort((firstTravel, secondTravel) => secondTravel.date.localeCompare(firstTravel.date));
}

interface CrewMember {
  id: number | null;
  name: string;
}

interface CrewSegment {
  vehicleSetId: number;
  plate: string;
  startAt: string;
  endAt: string | null;
  members: CrewMember[];
}

function crewMemberIdentity(member: CrewMember): string {
  return member.id !== null ? `id:${member.id}` : `name:${normalizeName(member.name)}`;
}

function uniqueCrewMembers(members: CrewMember[]): CrewMember[] {
  const seen = new Set<string>();
  return members.filter((member) => {
    const identity = crewMemberIdentity(member);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function buildAverageGroupKey(plate: string, members: CrewMember[]): string {
  const identities = uniqueCrewMembers(members)
    .map(crewMemberIdentity)
    .filter(Boolean)
    .sort();
  const mode = identities.length > 1 ? 'PAIR' : 'SOLO';
  return `${plate || 'SEM PLACA'}|${mode}|${identities.join('+')}`;
}

function memberMatchesDriver(member: CrewMember, driver: string, driverId?: number | null): boolean {
  if (driverId !== null && driverId !== undefined && member.id !== null) {
    return member.id === driverId;
  }

  return driversMatch(member.name, driver);
}

function buildCrewSegments(events: SettlementCrewEvent[]): CrewSegment[] {
  const bySet = new Map<number, SettlementCrewEvent[]>();

  events.forEach((event) => {
    const current = bySet.get(event.vehicleSetId) ?? [];
    current.push(event);
    bySet.set(event.vehicleSetId, current);
  });

  const segments: CrewSegment[] = [];

  bySet.forEach((setEvents, vehicleSetId) => {
    const ordered = [...setEvents].sort((first, second) => {
      const timeComparison = first.occurredAt.localeCompare(second.occurredAt);
      return timeComparison !== 0 ? timeComparison : first.id - second.id;
    });

    let primary: CrewMember | null = null;
    let secondary: CrewMember | null = null;
    let lastAt: string | null = null;
    let plate = ordered[0]?.tractorPlate ?? '';

    const currentMembers = () => uniqueCrewMembers([primary, secondary].filter((member): member is CrewMember => member !== null));

    ordered.forEach((event) => {
      if (event.tractorPlate) plate = event.tractorPlate;

      if (lastAt !== null && event.occurredAt > lastAt) {
        const members = currentMembers();
        if (members.length > 0) {
          segments.push({
            vehicleSetId,
            plate,
            startAt: lastAt,
            endAt: event.occurredAt,
            members,
          });
        }
      }

      const rawSlot = String(event.details.driver_slot ?? 'PRIMARY').toUpperCase();
      const slot = rawSlot === 'SECONDARY' ? 'SECONDARY' : 'PRIMARY';
      const eventMember = event.driverName
        ? { id: event.driverId, name: event.driverName }
        : null;

      if (event.action === 'DRIVER_ASSIGNED' || event.action === 'DRIVER_CHANGED') {
        if (eventMember !== null) {
          if (slot === 'SECONDARY') secondary = eventMember;
          else primary = eventMember;
        }
      } else if (event.action === 'DRIVER_RELEASED') {
        if (slot === 'SECONDARY') secondary = null;
        else primary = null;
      } else if (event.action === 'DETACHED') {
        primary = null;
        secondary = null;
      }

      lastAt = event.occurredAt;
    });

    const members = currentMembers();
    if (lastAt !== null && members.length > 0) {
      segments.push({
        vehicleSetId,
        plate,
        startAt: lastAt,
        endAt: null,
        members,
      });
    }
  });

  return segments;
}

function segmentTouchesTravelDate(segment: CrewSegment, travelDate: string): boolean {
  const startDate = segment.startAt.slice(0, 10);
  const endDate = segment.endAt?.slice(0, 10) ?? null;
  return startDate <= travelDate && (endDate === null || endDate >= travelDate);
}

function crewSimilarityScore(candidate: CrewMember[], snapshot: CrewMember[]): number {
  if (snapshot.length === 0) return 0;

  const candidateIds = new Set(candidate.map(crewMemberIdentity));
  const snapshotIds = new Set(snapshot.map(crewMemberIdentity));
  let overlap = 0;
  snapshotIds.forEach((identity) => {
    if (candidateIds.has(identity)) overlap += 1;
  });

  const exact = candidateIds.size === snapshotIds.size && overlap === snapshotIds.size;
  return (exact ? 1000 : 0) + overlap * 100 - Math.abs(candidate.length - snapshot.length) * 10;
}

function resolveTravelCrew(
  travel: TravelRecord,
  segments: CrewSegment[],
  driver: string,
  driverId?: number | null,
): CrewMember[] | null {
  const snapshotCrew = travelCrewMembers(travel);
  const candidates = segments
    .filter((segment) =>
      segment.plate === travel.plate &&
      segmentTouchesTravelDate(segment, travel.date) &&
      segment.members.some((member) => memberMatchesDriver(member, driver, driverId)),
    )
    .sort((first, second) => {
      // A viagem possui apenas data, sem horário operacional. Se houve troca de
      // composição no mesmo dia, usamos os motoristas já gravados na própria
      // viagem como desempate. Persistindo empate, vale o segmento mais recente.
      const scoreDifference =
        crewSimilarityScore(second.members, snapshotCrew) - crewSimilarityScore(first.members, snapshotCrew);
      if (scoreDifference !== 0) return scoreDifference;
      return second.startAt.localeCompare(first.startAt);
    });

  if (candidates.length > 0) {
    return uniqueCrewMembers(candidates[0].members);
  }

  // Compatibilidade com viagens antigas sem histórico completo de conjuntos.
  // Nesses casos preservamos os motoristas que ficaram registrados na viagem.
  return snapshotCrew.some((member) => memberMatchesDriver(member, driver, driverId))
    ? snapshotCrew
    : null;
}

function segmentTouchesFuelDate(segment: CrewSegment, fuelDate: string): boolean {
  const startDate = segment.startAt.slice(0, 10);
  const endDate = segment.endAt?.slice(0, 10) ?? null;
  return startDate <= fuelDate && (endDate === null || endDate >= fuelDate);
}

function recordDriverMatchesMember(record: FuelRecord, member: CrewMember): boolean {
  if (record.driverId !== null && member.id !== null) {
    return record.driverId === member.id;
  }

  return driversMatch(record.driver, member.name);
}

function resolveFuelCrew(
  record: FuelRecord,
  segments: CrewSegment[],
  driver: string,
  driverId?: number | null,
): CrewMember[] | null {
  const candidates = segments
    .filter((segment) =>
      segment.plate === record.plate &&
      segmentTouchesFuelDate(segment, record.date) &&
      segment.members.some((member) => recordDriverMatchesMember(record, member)),
    )
    .sort((first, second) => second.startAt.localeCompare(first.startAt));

  if (candidates.length > 0) {
    const canonicalCrew = candidates[0].members;
    return canonicalCrew.some((member) => memberMatchesDriver(member, driver, driverId))
      ? canonicalCrew
      : null;
  }

  const directMatch =
    driverId !== null && driverId !== undefined
      ? record.driverId === driverId || (record.driverId === null && driversMatch(record.driver, driver))
      : driversMatch(record.driver, driver);

  if (!directMatch) return null;

  return [{ id: driverId ?? record.driverId, name: driver || record.driver }];
}

function fuelGroupLabel(plate: string, members: CrewMember[], driver: string, driverId?: number | null): string {
  if (members.length <= 1) return `${plate} · Individual`;

  const companion = members.find((member) => !memberMatchesDriver(member, driver, driverId));
  return companion?.name ? `${plate} · Dupla com ${companion.name}` : `${plate} · Dupla`;
}

export function getDriverFuelRecords(
  fuelRecords: FuelRecord[],
  crewEvents: SettlementCrewEvent[],
  driver: string,
  startDate: string,
  endDate: string,
  driverId?: number | null,
): SettlementFuelRecord[] {
  const startBillingMonth = startDate.slice(0, 7);
  const endBillingMonth = endDate.slice(0, 7);
  const segments = buildCrewSegments(crewEvents);

  return fuelRecords
    .filter((record) => {
      const billingMonth = record.billingMonth || record.date.slice(0, 7);
      return billingMonth >= startBillingMonth && billingMonth <= endBillingMonth;
    })
    .map((record): SettlementFuelRecord | null => {
      const members = resolveFuelCrew(record, segments, driver, driverId);
      if (members === null) return null;

      const normalizedMembers = uniqueCrewMembers(members);
      return {
        ...record,
        averageGroupKey: buildAverageGroupKey(record.plate, normalizedMembers),
        averageGroupLabel: fuelGroupLabel(record.plate, normalizedMembers, driver, driverId),
        crewMode: normalizedMembers.length > 1 ? 'PAIR' : 'SOLO',
        crewDriverIds: normalizedMembers.flatMap((member) => member.id === null ? [] : [member.id]),
        crewDriverNames: normalizedMembers.map((member) => member.name),
      };
    })
    .filter((record): record is SettlementFuelRecord => record !== null)
    .sort((firstRecord, secondRecord) => {
      const groupComparison = firstRecord.averageGroupLabel.localeCompare(secondRecord.averageGroupLabel, 'pt-BR');
      if (groupComparison !== 0) return groupComparison;
      const dateComparison = firstRecord.date.localeCompare(secondRecord.date);
      return dateComparison !== 0 ? dateComparison : firstRecord.id - secondRecord.id;
    });
}

function travelCrewMembers(travel: TravelRecord): CrewMember[] {
  const members: CrewMember[] = [];

  if (travel.driverOneId !== null || travel.driverOne.trim() !== '') {
    members.push({ id: travel.driverOneId, name: travel.driverOne || travel.driver });
  }

  if (travel.driverTwoId !== null || travel.driverTwo.trim() !== '') {
    members.push({ id: travel.driverTwoId, name: travel.driverTwo });
  }

  if (members.length === 0 && travel.driver.trim() !== '') {
    members.push({ id: null, name: travel.driver });
  }

  return uniqueCrewMembers(members);
}

export function getVehicleAverageSummaries(
  travels: TravelRecord[],
  fuelRecords: SettlementFuelRecord[],
  selectedFuelRecordIds: number[],
): VehicleAverageSummaryData[] {
  const selectedIds = new Set(selectedFuelRecordIds);
  const travelGroupCounts = travels.reduce<Record<string, number>>((result, travel) => {
    const groupKey = buildAverageGroupKey(travel.plate, travelCrewMembers(travel));
    result[groupKey] = (result[groupKey] ?? 0) + 1;
    return result;
  }, {});

  const fuelGroups = new Map<string, SettlementFuelRecord[]>();
  fuelRecords.forEach((record) => {
    const current = fuelGroups.get(record.averageGroupKey) ?? [];
    current.push(record);
    fuelGroups.set(record.averageGroupKey, current);
  });

  return Array.from(fuelGroups.entries())
    .map(([groupKey, availableRecords]) => {
      const first = availableRecords[0];
      const selectedRecords = availableRecords.filter((record) => selectedIds.has(record.id));
      const validRecords = selectedRecords.filter(
        (record) => record.distanceKm !== null && record.distanceKm > 0 && record.dieselLiters > 0,
      );
      const totalDistance = validRecords.reduce((sum, record) => sum + (record.distanceKm ?? 0), 0);
      const totalLiters = validRecords.reduce((sum, record) => sum + record.dieselLiters, 0);
      const average = totalLiters > 0 ? totalDistance / totalLiters : null;

      return {
        groupKey,
        label: first.averageGroupLabel,
        plate: first.plate,
        crewMode: first.crewMode,
        crewDriverIds: [...first.crewDriverIds],
        crewDriverNames: [...first.crewDriverNames],
        tripsCount: travelGroupCounts[groupKey] ?? 0,
        averageKmPerLiter: average,
        fuelingsCount: validRecords.length,
        availableFuelingsCount: availableRecords.length,
        source: average === null ? ('UNAVAILABLE' as const) : ('SELECTED' as const),
      };
    })
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'));
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
  const loans = entries
    .filter((entry) => entry.type === 'LOAN')
    .reduce((sum, entry) => sum + entry.value, 0);
  const otherDiscounts = entries
    .filter((entry) => entry.type === 'OTHER_DISCOUNT')
    .reduce((sum, entry) => sum + entry.value, 0);
  const totalEarnings = baseSalary + bonusValue + dailyAllowance + otherEarnings;
  const totalDiscounts = advances + fines + loans + otherDiscounts;

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
    loans,
    otherDiscounts,
    totalDiscounts,
    totalReceivable: totalEarnings - totalDiscounts,
  };
}

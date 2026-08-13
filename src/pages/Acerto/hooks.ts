import { useCallback, useMemo, useState } from 'react';

import { SETTLEMENT_STORAGE_KEY } from './constants';
import type {
  DriverSettlementSnapshot,
  FinancialEntry,
  FinancialEntryFormData,
  FinancialEntryType,
  SettlementPeriodMode,
} from './types';
import {
  calculateSettlementTotals,
  filterDriverTravels,
  getMonthDateRange,
  getSuggestedBonusPercent,
  getVehicleAverageSummaries,
  loadSettlementData,
  parseDecimalInput,
} from './utils';

const DEFAULT_MONTH = '2026-07';
const DEFAULT_BASE_SALARY = '2689,02';

function isSettlementSnapshot(value: unknown): value is DriverSettlementSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<DriverSettlementSnapshot>;

  return (
    typeof snapshot.id === 'string' &&
    typeof snapshot.driver === 'string' &&
    typeof snapshot.startDate === 'string' &&
    typeof snapshot.endDate === 'string' &&
    typeof snapshot.savedAt === 'string' &&
    Array.isArray(snapshot.travels) &&
    Array.isArray(snapshot.vehicleSummaries) &&
    Array.isArray(snapshot.entries) &&
    Boolean(snapshot.totals)
  );
}

function sortSettlements(settlements: DriverSettlementSnapshot[]): DriverSettlementSnapshot[] {
  return [...settlements].sort((firstSettlement, secondSettlement) =>
    secondSettlement.savedAt.localeCompare(firstSettlement.savedAt),
  );
}

function loadSettlementSnapshots(): DriverSettlementSnapshot[] {
  try {
    const storedSettlements = window.localStorage.getItem(SETTLEMENT_STORAGE_KEY);

    if (!storedSettlements) {
      return [];
    }

    const parsedSettlements = JSON.parse(storedSettlements) as unknown;

    if (!Array.isArray(parsedSettlements)) {
      return [];
    }

    return sortSettlements(parsedSettlements.filter(isSettlementSnapshot));
  } catch {
    return [];
  }
}

function persistSettlements(settlements: DriverSettlementSnapshot[]): void {
  window.localStorage.setItem(SETTLEMENT_STORAGE_KEY, JSON.stringify(settlements));
}

function formatEditableDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface SnapshotOptions {
  id?: string;
  savedAt?: string;
}

export function useDriverSettlement() {
  const loadedData = useMemo(() => loadSettlementData(), []);
  const initialDriver =
    loadedData.drivers.find((driver) => driver.toLocaleLowerCase('pt-BR').includes('patrick')) ??
    loadedData.drivers[0] ??
    '';

  const [selectedDriver, setSelectedDriverState] = useState(initialDriver);
  const [periodMode, setPeriodMode] = useState<SettlementPeriodMode>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH);
  const [customStartDate, setCustomStartDate] = useState(`${DEFAULT_MONTH}-01`);
  const [customEndDate, setCustomEndDate] = useState(`${DEFAULT_MONTH}-31`);
  const [bonusPercentOverride, setBonusPercentOverride] = useState<string | null>(null);
  const [baseSalary, setBaseSalary] = useState(DEFAULT_BASE_SALARY);
  const [dailyAllowance, setDailyAllowance] = useState('0');
  const [otherEarnings, setOtherEarnings] = useState('0');
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [savedAt, setSavedAt] = useState('');
  const [editingSettlementId, setEditingSettlementId] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<DriverSettlementSnapshot[]>(() =>
    loadSettlementSnapshots(),
  );

  const dateRange = useMemo(
    () =>
      periodMode === 'MONTH'
        ? getMonthDateRange(selectedMonth)
        : { startDate: customStartDate, endDate: customEndDate },
    [customEndDate, customStartDate, periodMode, selectedMonth],
  );

  const travels = useMemo(
    () =>
      filterDriverTravels(
        loadedData.travels,
        selectedDriver,
        dateRange.startDate,
        dateRange.endDate,
      ),
    [dateRange.endDate, dateRange.startDate, loadedData.travels, selectedDriver],
  );

  const vehicleSummaries = useMemo(
    () =>
      getVehicleAverageSummaries(
        travels,
        loadedData.fuelRecords,
        selectedDriver,
        dateRange.startDate,
        dateRange.endDate,
      ),
    [dateRange.endDate, dateRange.startDate, loadedData.fuelRecords, selectedDriver, travels],
  );

  const suggestedBonusPercent = useMemo(
    () => getSuggestedBonusPercent(vehicleSummaries),
    [vehicleSummaries],
  );

  const bonusPercent = bonusPercentOverride ?? String(suggestedBonusPercent);

  const totals = useMemo(
    () =>
      calculateSettlementTotals(
        travels,
        parseDecimalInput(bonusPercent),
        parseDecimalInput(baseSalary),
        parseDecimalInput(dailyAllowance),
        parseDecimalInput(otherEarnings),
        entries,
      ),
    [baseSalary, bonusPercent, dailyAllowance, entries, otherEarnings, travels],
  );

  const createCurrentSnapshot = useCallback(
    (options: SnapshotOptions = {}): DriverSettlementSnapshot => ({
      id: options.id ?? `settlement-${Date.now()}`,
      driver: selectedDriver,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      savedAt: options.savedAt ?? new Date().toISOString(),
      travels,
      vehicleSummaries,
      entries: entries.map((entry) => ({ ...entry })),
      totals: { ...totals },
    }),
    [
      dateRange.endDate,
      dateRange.startDate,
      entries,
      selectedDriver,
      totals,
      travels,
      vehicleSummaries,
    ],
  );

  const applyMonth = useCallback((month: string) => {
    setSelectedMonth(month);
    setPeriodMode('MONTH');
    setBonusPercentOverride(null);
    setSavedAt('');
  }, []);

  const applyCustomPeriod = useCallback((startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setPeriodMode('CUSTOM');
    setBonusPercentOverride(null);
    setSavedAt('');
  }, []);

  const setSelectedDriver = useCallback((driver: string) => {
    setSelectedDriverState(driver);
    setBonusPercentOverride(null);
    setSavedAt('');
  }, []);

  const addEntry = useCallback((type: FinancialEntryType, formData: FinancialEntryFormData) => {
    const value = parseDecimalInput(formData.value);

    if (value <= 0) {
      return false;
    }

    setEntries((currentEntries) => [
      ...currentEntries,
      {
        id: `settlement-entry-${Date.now()}`,
        type,
        date: formData.date,
        description: formData.description.trim(),
        value,
      },
    ]);
    setSavedAt('');
    return true;
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
    setSavedAt('');
  }, []);

  const finalizeSettlement = useCallback((): DriverSettlementSnapshot | null => {
    if (!selectedDriver || travels.length === 0) {
      return null;
    }

    const snapshot = createCurrentSnapshot({
      id: editingSettlementId ?? undefined,
    });

    setSettlements((currentSettlements) => {
      const nextSettlements = editingSettlementId
        ? currentSettlements.map((currentSettlement) =>
            currentSettlement.id === editingSettlementId ? snapshot : currentSettlement,
          )
        : [snapshot, ...currentSettlements];
      const sortedSettlements = sortSettlements(nextSettlements);

      persistSettlements(sortedSettlements);
      return sortedSettlements;
    });
    setSavedAt(snapshot.savedAt);
    setEditingSettlementId(null);

    return snapshot;
  }, [createCurrentSnapshot, editingSettlementId, selectedDriver, travels.length]);

  const startEditingSettlement = useCallback((settlement: DriverSettlementSnapshot) => {
    setSelectedDriverState(settlement.driver);
    setPeriodMode('CUSTOM');
    setSelectedMonth(settlement.startDate.slice(0, 7));
    setCustomStartDate(settlement.startDate);
    setCustomEndDate(settlement.endDate);
    setBonusPercentOverride(String(settlement.totals.bonusPercent));
    setBaseSalary(formatEditableDecimal(settlement.totals.baseSalary));
    setDailyAllowance(formatEditableDecimal(settlement.totals.dailyAllowance));
    setOtherEarnings(formatEditableDecimal(settlement.totals.otherEarnings));
    setEntries(settlement.entries.map((entry) => ({ ...entry })));
    setEditingSettlementId(settlement.id);
    setSavedAt('');
  }, []);

  const deleteSettlement = useCallback((settlementId: string) => {
    setSettlements((currentSettlements) => {
      const nextSettlements = currentSettlements.filter(
        (settlement) => settlement.id !== settlementId,
      );

      persistSettlements(nextSettlements);
      return nextSettlements;
    });

    if (editingSettlementId === settlementId) {
      setEditingSettlementId(null);
      setSavedAt('');
    }
  }, [editingSettlementId]);

  const resetFinancialData = useCallback(() => {
    setBonusPercentOverride('');
    setBaseSalary('');
    setDailyAllowance('');
    setOtherEarnings('');
    setEntries([]);
    setSavedAt('');
  }, []);

  const startNewSettlement = useCallback(() => {
    setSelectedDriverState(initialDriver);
    setPeriodMode('MONTH');
    setSelectedMonth(DEFAULT_MONTH);
    setCustomStartDate(`${DEFAULT_MONTH}-01`);
    setCustomEndDate(`${DEFAULT_MONTH}-31`);
    setBonusPercentOverride(null);
    setBaseSalary(DEFAULT_BASE_SALARY);
    setDailyAllowance('0');
    setOtherEarnings('0');
    setEntries([]);
    setEditingSettlementId(null);
    setSavedAt('');
  }, [initialDriver]);

  return {
    drivers: loadedData.drivers,
    selectedDriver,
    periodMode,
    selectedMonth,
    customStartDate,
    customEndDate,
    dateRange,
    travels,
    vehicleSummaries,
    suggestedBonusPercent,
    bonusPercent,
    baseSalary,
    dailyAllowance,
    otherEarnings,
    entries,
    totals,
    savedAt,
    settlements,
    editingSettlementId,
    setSelectedDriver,
    applyMonth,
    applyCustomPeriod,
    setBonusPercent: setBonusPercentOverride,
    setBaseSalary,
    setDailyAllowance,
    setOtherEarnings,
    addEntry,
    removeEntry,
    finalizeSettlement,
    createCurrentSnapshot,
    startEditingSettlement,
    deleteSettlement,
    resetFinancialData,
    startNewSettlement,
  };
}

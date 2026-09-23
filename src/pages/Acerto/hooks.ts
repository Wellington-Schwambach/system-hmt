import { useCallback, useEffect, useMemo, useState } from 'react';

import { fuelService } from '../Fuel/services';
import { travelService } from '../Travel/services';
import type {
  DriverSettlementSnapshot,
  FinancialEntry,
  FinancialEntryFormData,
  FinancialEntryType,
  LoadedSettlementData,
  SettlementHistoryEvent,
  SettlementPeriodMode,
} from './types';
import { settlementService } from './services';
import {
  calculateSettlementTotals,
  filterDriverTravels,
  getDriverFuelRecords,
  getMonthDateRange,
  getSuggestedBonusPercent,
  getVehicleAverageSummaries,
  loadSettlementData,
  parseDecimalInput,
} from './utils';

const DEFAULT_MONTH = new Date().toISOString().slice(0, 7);
const DEFAULT_BASE_SALARY = '2689,02';

function formatEditableDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function sortSettlements(settlements: DriverSettlementSnapshot[]): DriverSettlementSnapshot[] {
  return [...settlements].sort((firstSettlement, secondSettlement) =>
    secondSettlement.savedAt.localeCompare(firstSettlement.savedAt),
  );
}

interface SnapshotOptions {
  id?: string;
  savedAt?: string;
}

export function useDriverSettlement() {
  const cachedData = useMemo(() => loadSettlementData(), []);
  const cachedInitialDriver =
    cachedData.drivers.find((driver) => driver.toLocaleLowerCase('pt-BR').includes('patrick')) ??
    cachedData.drivers[0] ??
    '';

  const [loadedData, setLoadedData] = useState<LoadedSettlementData>(cachedData);
  const [selectedDriver, setSelectedDriverState] = useState(cachedInitialDriver);
  const [periodMode, setPeriodMode] = useState<SettlementPeriodMode>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH);
  const [customStartDate, setCustomStartDate] = useState(`${DEFAULT_MONTH}-01`);
  const [customEndDate, setCustomEndDate] = useState(getMonthDateRange(DEFAULT_MONTH).endDate);
  const [bonusPercentOverride, setBonusPercentOverride] = useState<string | null>(null);
  const [baseSalary, setBaseSalary] = useState(DEFAULT_BASE_SALARY);
  const [dailyAllowance, setDailyAllowance] = useState('0');
  const [otherEarnings, setOtherEarnings] = useState('0');
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [selectedFuelRecordIdsOverride, setSelectedFuelRecordIdsOverride] = useState<number[] | null>(null);
  const [savedAt, setSavedAt] = useState('');
  const [editingSettlementId, setEditingSettlementId] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<DriverSettlementSnapshot[]>([]);
  const [history, setHistory] = useState<SettlementHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      travelService.list(),
      fuelService.list(),
      settlementService.drivers(),
      settlementService.list(),
    ])
      .then(([travels, fuelRecords, driverOptions, savedSettlements]) => {
        if (!active) return;

        const drivers = driverOptions.map((driver) => driver.name);
        setLoadedData({ travels, fuelRecords, drivers, driverOptions });
        setSettlements(sortSettlements(savedSettlements));
        setSelectedDriverState((currentDriver) => {
          if (drivers.includes(currentDriver)) return currentDriver;
          return (
            drivers.find((driver) => driver.toLocaleLowerCase('pt-BR').includes('patrick')) ??
            drivers[0] ??
            ''
          );
        });
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedDriverOption = useMemo(
    () => loadedData.driverOptions.find((driver) => driver.name === selectedDriver) ?? null,
    [loadedData.driverOptions, selectedDriver],
  );

  const dateRange = useMemo(
    () =>
      periodMode === 'MONTH'
        ? getMonthDateRange(selectedMonth)
        : { startDate: customStartDate, endDate: customEndDate },
    [customEndDate, customStartDate, periodMode, selectedMonth],
  );

  useEffect(() => {
    let active = true;

    if (!selectedDriverOption || editingSettlementId) {
      return () => {
        active = false;
      };
    }

    settlementService.pendingVales(selectedDriverOption.id, dateRange.endDate)
      .then((pendingVales) => {
        if (!active) return;
        setEntries((currentEntries) => [
          ...currentEntries.filter((entry) => entry.source !== 'VALE'),
          ...pendingVales.map((vale) => ({
            id: `vale-${vale.id}`,
            type: vale.category,
            date: vale.date,
            description: vale.installmentsTotal > 1
              ? `${vale.description || 'Vale'} · Parcela ${vale.installmentNumber}/${vale.installmentsTotal}`
              : vale.description,
            value: vale.amount,
            source: 'VALE' as const,
            valeId: vale.id,
          })),
        ]);
      })
      .catch(() => {
        // O Acerto continua utilizável com lançamentos manuais caso os vales não carreguem.
      });

    return () => {
      active = false;
    };
  }, [dateRange.endDate, editingSettlementId, selectedDriverOption]);

  const travels = useMemo(
    () =>
      filterDriverTravels(
        loadedData.travels,
        selectedDriver,
        dateRange.startDate,
        dateRange.endDate,
        selectedDriverOption?.id,
      ),
    [
      dateRange.endDate,
      dateRange.startDate,
      loadedData.travels,
      selectedDriver,
      selectedDriverOption?.id,
    ],
  );

  const fuelRecords = useMemo(
    () =>
      getDriverFuelRecords(
        loadedData.fuelRecords,
        selectedDriver,
        dateRange.startDate,
        dateRange.endDate,
        selectedDriverOption?.id,
      ),
    [
      dateRange.endDate,
      dateRange.startDate,
      loadedData.fuelRecords,
      selectedDriver,
      selectedDriverOption?.id,
    ],
  );

  const defaultSelectedFuelRecordIds = useMemo(
    () =>
      fuelRecords
        .filter(
          (record) =>
            record.distanceKm !== null && record.distanceKm > 0 && record.dieselLiters > 0,
        )
        .map((record) => record.id),
    [fuelRecords],
  );

  const selectedFuelRecordIds = selectedFuelRecordIdsOverride ?? defaultSelectedFuelRecordIds;

  const vehicleSummaries = useMemo(
    () => getVehicleAverageSummaries(travels, fuelRecords, selectedFuelRecordIds),
    [fuelRecords, selectedFuelRecordIds, travels],
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
      id: options.id ?? `new-${Date.now()}`,
      driverId: selectedDriverOption?.id ?? null,
      driver: selectedDriver,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      savedAt: options.savedAt ?? new Date().toISOString(),
      travels,
      selectedFuelRecordIds: [...selectedFuelRecordIds],
      vehicleSummaries,
      entries: entries.map((entry) => ({ ...entry })),
      totals: { ...totals },
    }),
    [
      dateRange.endDate,
      dateRange.startDate,
      entries,
      selectedDriver,
      selectedDriverOption?.id,
      selectedFuelRecordIds,
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
    setSelectedFuelRecordIdsOverride(null);
  }, []);

  const applyCustomPeriod = useCallback((startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setPeriodMode('CUSTOM');
    setBonusPercentOverride(null);
    setSavedAt('');
    setSelectedFuelRecordIdsOverride(null);
  }, []);

  const setSelectedDriver = useCallback((driver: string) => {
    setSelectedDriverState(driver);
    setBonusPercentOverride(null);
    setSavedAt('');
    setSelectedFuelRecordIdsOverride(null);
    setEntries([]);
  }, []);

  const toggleFuelRecord = useCallback((recordId: number) => {
    setSelectedFuelRecordIdsOverride(
      selectedFuelRecordIds.includes(recordId)
        ? selectedFuelRecordIds.filter((currentId) => currentId !== recordId)
        : [...selectedFuelRecordIds, recordId],
    );
    setBonusPercentOverride(null);
    setSavedAt('');
  }, [selectedFuelRecordIds]);

  const selectFuelRecordsByPlate = useCallback((plate: string, selected: boolean) => {
    const plateIds = fuelRecords
      .filter(
        (record) =>
          record.plate === plate &&
          record.distanceKm !== null &&
          record.distanceKm > 0 &&
          record.dieselLiters > 0,
      )
      .map((record) => record.id);
    const currentSet = new Set(selectedFuelRecordIds);
    plateIds.forEach((id) => (selected ? currentSet.add(id) : currentSet.delete(id)));
    setSelectedFuelRecordIdsOverride(Array.from(currentSet));
    setBonusPercentOverride(null);
    setSavedAt('');
  }, [fuelRecords, selectedFuelRecordIds]);

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
        source: 'MANUAL',
      },
    ]);
    setSavedAt('');
    return true;
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
    setSavedAt('');
  }, []);

  const finalizeSettlement = useCallback(async (): Promise<DriverSettlementSnapshot | null> => {
    if (!selectedDriver || !selectedDriverOption || travels.length === 0) {
      return null;
    }

    setSaving(true);
    try {
      const snapshot = createCurrentSnapshot({ id: editingSettlementId ?? undefined });
      const saved = editingSettlementId
        ? await settlementService.update(snapshot)
        : await settlementService.create(snapshot);

      setSettlements((currentSettlements) => {
        const withoutSaved = currentSettlements.filter((item) => item.id !== saved.id);
        return sortSettlements([saved, ...withoutSaved]);
      });
      setSavedAt(saved.savedAt);
      setEditingSettlementId(null);
      return saved;
    } finally {
      setSaving(false);
    }
  }, [createCurrentSnapshot, editingSettlementId, selectedDriver, selectedDriverOption, travels.length]);

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
    setSelectedFuelRecordIdsOverride([...(settlement.selectedFuelRecordIds ?? [])]);
    setEditingSettlementId(settlement.id);
    setSavedAt('');
  }, []);

  const deleteSettlement = useCallback(async (settlementId: string) => {
    setSaving(true);
    try {
      await settlementService.remove(settlementId);
      setSettlements((currentSettlements) =>
        currentSettlements.filter((settlement) => settlement.id !== settlementId),
      );

      if (editingSettlementId === settlementId) {
        setEditingSettlementId(null);
        setSavedAt('');
      }
    } finally {
      setSaving(false);
    }
  }, [editingSettlementId]);

  const loadHistory = useCallback(async (): Promise<void> => {
    setHistory(await settlementService.history());
  }, []);

  const resetFinancialData = useCallback(() => {
    setBonusPercentOverride('');
    setBaseSalary('');
    setDailyAllowance('');
    setOtherEarnings('');
    setEntries([]);
    setSavedAt('');
  }, []);

  const startNewSettlement = useCallback(() => {
    const initialDriver =
      loadedData.drivers.find((driver) => driver.toLocaleLowerCase('pt-BR').includes('patrick')) ??
      loadedData.drivers[0] ??
      '';
    setSelectedDriverState(initialDriver);
    setPeriodMode('MONTH');
    setSelectedMonth(DEFAULT_MONTH);
    setCustomStartDate(`${DEFAULT_MONTH}-01`);
    setCustomEndDate(getMonthDateRange(DEFAULT_MONTH).endDate);
    setBonusPercentOverride(null);
    setBaseSalary(DEFAULT_BASE_SALARY);
    setDailyAllowance('0');
    setOtherEarnings('0');
    setEntries([]);
    setSelectedFuelRecordIdsOverride(null);
    setEditingSettlementId(null);
    setSavedAt('');
  }, [loadedData.drivers]);

  return {
    drivers: loadedData.drivers,
    selectedDriver,
    periodMode,
    selectedMonth,
    customStartDate,
    customEndDate,
    dateRange,
    travels,
    fuelRecords,
    selectedFuelRecordIds,
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
    history,
    editingSettlementId,
    loading,
    saving,
    loadError,
    canSave: Boolean(selectedDriverOption && travels.length > 0),
    setSelectedDriver,
    applyMonth,
    applyCustomPeriod,
    setBonusPercent: setBonusPercentOverride,
    setBaseSalary,
    setDailyAllowance,
    setOtherEarnings,
    addEntry,
    removeEntry,
    toggleFuelRecord,
    selectFuelRecordsByPlate,
    finalizeSettlement,
    createCurrentSnapshot,
    startEditingSettlement,
    deleteSettlement,
    loadHistory,
    resetFinancialData,
    startNewSettlement,
  };
}

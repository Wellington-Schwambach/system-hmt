import { useCallback, useEffect, useMemo, useState } from 'react';

import { fuelService, type LegacyLocalFuelRecord } from './services';
import { FUEL_STORAGE_KEY } from './constants';
import type {
  FuelDriverOption,
  FuelFilter,
  FuelFormData,
  FuelInvoiceTarget,
  FuelRecord,
  FuelVehicleOption,
} from './types';
import { enrichFuelRecords, getFuelSummary } from './utils';


function getCurrentMonthRange(): { from: string; to: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNumber = String(month + 1).padStart(2, '0');
  const lastDay = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');

  return {
    from: `${year}-${monthNumber}-01`,
    to: `${year}-${monthNumber}-${lastDay}`,
  };
}

const CURRENT_MONTH_RANGE = getCurrentMonthRange();


function readLegacyLocalRecords(): LegacyLocalFuelRecord[] {
  try {
    const raw = window.localStorage.getItem(FUEL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is LegacyLocalFuelRecord => {
      if (!item || typeof item !== 'object') return false;
      const record = item as Partial<LegacyLocalFuelRecord>;
      return Boolean(
        record.date &&
        record.station &&
        record.plate &&
        record.driver &&
        typeof record.dieselLiters === 'number' &&
        typeof record.dieselTotalValue === 'number'
      );
    });
  } catch {
    return [];
  }
}

async function loadDatabaseRecordsWithLegacyMigration(): Promise<FuelRecord[]> {
  const loaded = await fuelService.list();
  if (loaded.length > 0) return loaded;

  const legacy = readLegacyLocalRecords();
  if (legacy.length === 0) return loaded;

  const imported = await fuelService.importLegacy(legacy);
  if (imported > 0) {
    window.localStorage.removeItem(FUEL_STORAGE_KEY);
    return fuelService.list();
  }

  return loaded;
}

export function useFuelRecords() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [filter, setFilter] = useState<FuelFilter>('ALL');
  const [plateFilter, setPlateFilter] = useState<string[]>([]);
  const [billingMonthFilter, setBillingMonthFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState(CURRENT_MONTH_RANGE.from);
  const [dateTo, setDateTo] = useState(CURRENT_MONTH_RANGE.to);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState<FuelVehicleOption[]>([]);
  const [driverOptions, setDriverOptions] = useState<FuelDriverOption[]>([]);
  const [plateOptions, setPlateOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [invoicingKey, setInvoicingKey] = useState<string | null>(null);
  const applyOptions = useCallback((options: {
    vehicles: FuelVehicleOption[];
    filterPlates: string[];
    drivers: FuelDriverOption[];
  }) => {
    setVehicleOptions(options.vehicles);
    setPlateOptions(options.filterPlates);
    setDriverOptions(options.drivers);
  }, []);

  const refreshOptions = useCallback(async () => {
    const options = await fuelService.options();
    applyOptions(options);
    return options;
  }, [applyOptions]);

  const refresh = useCallback(async () => {
    const [loadedRecords, options] = await Promise.all([loadDatabaseRecordsWithLegacyMigration(), fuelService.options()]);
    setRecords(loadedRecords);
    applyOptions(options);
  }, [applyOptions]);

  useEffect(() => {
    let active = true;

    Promise.all([loadDatabaseRecordsWithLegacyMigration(), fuelService.options()])
      .then(([loadedRecords, options]) => {
        if (!active) return;
        setRecords(loadedRecords);
        applyOptions(options);
        setDatabaseReady(true);
      })
      .catch(() => {
        if (!active) return;
        setRecords([]);
        setVehicleOptions([]);
        setPlateOptions([]);
        setDriverOptions([]);
        setDatabaseReady(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyOptions]);

  useEffect(() => {
    if (loading || !databaseReady) return;
    window.localStorage.setItem(FUEL_STORAGE_KEY, JSON.stringify(records));
  }, [databaseReady, loading, records]);

  const enrichedRecords = useMemo(() => enrichFuelRecords(records), [records]);
  const billingMonthOptions = useMemo(
    () =>
      Array.from(new Set(enrichedRecords.map((record) => record.billingMonth).filter(Boolean)))
        .sort((a, b) => b.localeCompare(a)),
    [enrichedRecords],
  );
  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    return enrichedRecords.filter((record) => {
      const matchesFilter = filter === 'ALL' || record.status === filter;
      const matchesPlate = plateFilter.length === 0 || plateFilter.includes(record.plate);
      const matchesBillingMonth = billingMonthFilter === 'ALL' || record.billingMonth === billingMonthFilter;
      const matchesPeriod = (!dateFrom || record.date >= dateFrom) && (!dateTo || record.date <= dateTo);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        record.station.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.driver.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.plate.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        (record.km !== null && record.km > 0 && String(record.km).includes(normalizedSearch));

      return matchesFilter && matchesPlate && matchesBillingMonth && matchesPeriod && matchesSearch;
    });
  }, [billingMonthFilter, dateFrom, dateTo, enrichedRecords, filter, plateFilter, searchTerm]);

  const summary = useMemo(() => getFuelSummary(filteredRecords), [filteredRecords]);

  const saveRecord = useCallback(async (formData: FuelFormData, id?: number) => {
    setSaving(true);
    try {
      const saved = id ? await fuelService.update(id, formData) : await fuelService.create(formData);
      setRecords((current) => {
        if (id) return current.map((record) => (record.id === id ? saved : record));
        return [saved, ...current];
      });
      await refreshOptions();
      return saved;
    } finally {
      setSaving(false);
    }
  }, [refreshOptions]);

  const invoiceRecord = useCallback(async (recordId: number, target: FuelInvoiceTarget) => {
    const key = `${recordId}:${target}`;
    setInvoicingKey(key);
    try {
      const updated = await fuelService.invoice(recordId, target);
      setRecords((current) => current.map((record) => (record.id === recordId ? updated : record)));
      return updated;
    } finally {
      setInvoicingKey(null);
    }
  }, []);

  const deleteRecord = useCallback(async (recordId: number) => {
    setDeletingId(recordId);
    try {
      await fuelService.remove(recordId);
      setRecords((current) => current.filter((record) => record.id !== recordId));
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    records: filteredRecords,
    summary,
    filter,
    plateFilter,
    plateOptions,
    billingMonthFilter,
    billingMonthOptions,
    dateFrom,
    dateTo,
    vehicleOptions,
    driverOptions,
    searchTerm,
    loading,
    saving,
    deletingId,
    invoicingKey,
    setFilter,
    setPlateFilter,
    setBillingMonthFilter,
    setDateFrom,
    setDateTo,
    setSearchTerm,
    refresh,
    refreshOptions,
    saveRecord,
    invoiceRecord,
    deleteRecord,
  };
}

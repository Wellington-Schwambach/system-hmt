import { useCallback, useMemo, useState } from 'react';

import { getVehiclePlateOptions } from '../../utils/vehiclePlates';
import { FUEL_STORAGE_KEY, INITIAL_FUEL_RECORDS } from './constants';
import type { FuelFilter, FuelFormData, FuelRecord, PersistedFuelRecord } from './types';
import {
  enrichFuelRecords,
  getFuelSummary,
  normalizeFuelRecords,
  parseDecimalInput,
} from './utils';

function persistFuelRecords(records: FuelRecord[]): void {
  window.localStorage.setItem(FUEL_STORAGE_KEY, JSON.stringify(records));
}

function loadFuelRecords(): FuelRecord[] {
  try {
    const savedRecords = window.localStorage.getItem(FUEL_STORAGE_KEY);

    if (!savedRecords) {
      return INITIAL_FUEL_RECORDS;
    }

    const parsedRecords = JSON.parse(savedRecords) as PersistedFuelRecord[];

    if (!Array.isArray(parsedRecords)) {
      return INITIAL_FUEL_RECORDS;
    }

    const normalizedRecords = normalizeFuelRecords(parsedRecords);
    persistFuelRecords(normalizedRecords);

    return normalizedRecords;
  } catch {
    return INITIAL_FUEL_RECORDS;
  }
}

function createRecordFromForm(
  formData: FuelFormData,
  id: string,
  status: FuelRecord['status'],
): FuelRecord {
  return {
    id,
    station: formData.station.trim(),
    plate: formData.plate,
    date: formData.date,
    km: Number(formData.km),
    dieselLiters: parseDecimalInput(formData.dieselLiters),
    dieselTotalValue: parseDecimalInput(formData.dieselTotalValue),
    arlaLiters: formData.hasArla ? parseDecimalInput(formData.arlaLiters) : 0,
    arlaTotalValue: formData.hasArla ? parseDecimalInput(formData.arlaTotalValue) : 0,
    driver: formData.driver,
    status,
  };
}

export function useFuelRecords() {
  const [records, setRecords] = useState<FuelRecord[]>(loadFuelRecords);
  const [filter, setFilter] = useState<FuelFilter>('ALL');
  const [plateFilter, setPlateFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedRecords = useMemo(() => enrichFuelRecords(records), [records]);

  const plateOptions = useMemo(
    () => getVehiclePlateOptions(enrichedRecords.map((record) => record.plate)),
    [enrichedRecords],
  );

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    return enrichedRecords.filter((record) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'WITH_ARLA' && record.arlaLiters > 0) ||
        (filter === 'DIESEL_ONLY' && record.arlaLiters <= 0);

      const matchesPlate = plateFilter === 'ALL' || record.plate === plateFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        record.station.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.driver.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.plate.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        String(record.km).includes(normalizedSearch);

      return matchesFilter && matchesPlate && matchesSearch;
    });
  }, [enrichedRecords, filter, plateFilter, searchTerm]);

  const summary = useMemo(() => getFuelSummary(enrichedRecords), [enrichedRecords]);

  const addRecord = useCallback((formData: FuelFormData) => {
    const newRecord = createRecordFromForm(formData, `fuel-${Date.now()}`, 'N');

    setRecords((currentRecords) => {
      const updatedRecords = [...currentRecords, newRecord];
      persistFuelRecords(updatedRecords);
      return updatedRecords;
    });
  }, []);

  const updateRecord = useCallback((recordId: string, formData: FuelFormData) => {
    setRecords((currentRecords) => {
      const updatedRecords = currentRecords.map((record) =>
        record.id === recordId ? createRecordFromForm(formData, record.id, record.status) : record,
      );

      persistFuelRecords(updatedRecords);
      return updatedRecords;
    });
  }, []);

  const invoiceRecord = useCallback((recordId: string) => {
    setRecords((currentRecords) => {
      const updatedRecords = currentRecords.map((record) =>
        record.id === recordId ? { ...record, status: 'F' as const } : record,
      );

      persistFuelRecords(updatedRecords);
      return updatedRecords;
    });
  }, []);

  return {
    records: filteredRecords,
    summary,
    filter,
    plateFilter,
    plateOptions,
    searchTerm,
    setFilter,
    setPlateFilter,
    setSearchTerm,
    addRecord,
    updateRecord,
    invoiceRecord,
  };
}

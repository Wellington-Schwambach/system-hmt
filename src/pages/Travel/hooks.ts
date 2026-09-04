import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback, getApiErrorMessage } from '../../utils/apiError';
import { TRAVEL_STORAGE_KEY } from './constants';
import { travelService } from './services';
import type {
  TravelFormData,
  TravelOperationResult,
  TravelOptionShipper,
  TravelOptions,
  TravelRecord,
  TravelCteTypeFilter,
  TravelFreightType,
} from './types';
import { enrichTravelRecords, getTravelSummary } from './utils';

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

function extractState(value: string): string {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/(?:\/|-)\s*([A-Z]{2})$/);
  return match?.[1] ?? '';
}

const EMPTY_OPTIONS: TravelOptions = {
  tractors: [],
  trailers: [],
  drivers: [],
  shippers: [],
  filterShippers: [],
  filterPlates: [],
  activeSets: [],
  warnings: [],
};

function persistTravelCache(records: TravelRecord[]): void {
  try {
    window.localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Cache auxiliar para BI/Acertos. A API continua sendo a fonte oficial.
  }
}

export function useTravelRecords() {
  const notifications = useNotifications();
  const [allRecords, setAllRecords] = useState<TravelRecord[]>([]);
  const [options, setOptions] = useState<TravelOptions>(EMPTY_OPTIONS);
  const [shipperFilter, setShipperFilter] = useState<string[]>([]);
  const [plateFilter, setPlateFilter] = useState<string[]>([]);
  const [cteTypeFilter, setCteTypeFilter] = useState<TravelCteTypeFilter>('ALL');
  const [originStateFilter, setOriginStateFilter] = useState('ALL');
  const [destinationStateFilter, setDestinationStateFilter] = useState('ALL');
  const [freightTypeFilter, setFreightTypeFilter] = useState<TravelFreightType[]>([]);
  const [cstFilter, setCstFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState(CURRENT_MONTH_RANGE.from);
  const [dateTo, setDateTo] = useState(CURRENT_MONTH_RANGE.to);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingShipper, setCreatingShipper] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refreshOptions = useCallback(
    async (showError = false): Promise<boolean> => {
      setOptionsLoading(true);
      try {
        const loadedOptions = await travelService.options();
        setOptions(loadedOptions);
        return true;
      } catch (error) {
        const feedback = getApiErrorFeedback(
          error,
          'Não foi possível carregar cavalos, carretas, motoristas e embarcadores.',
        );
        if (showError) {
          notifications.warning('Cadastros auxiliares indisponíveis', feedback.message, feedback.details);
        }
        return false;
      } finally {
        setOptionsLoading(false);
      }
    },
    [notifications],
  );

  useEffect(() => {
    let active = true;

    travelService
      .list()
      .then((records) => {
        if (!active) return;
        setAllRecords(records);
        setLoadError(false);
        persistTravelCache(records);
      })
      .catch(() => {
        // Não abre alerta automaticamente ao entrar na tela. O erro fica indicado
        // discretamente na própria listagem, sem alarmar o usuário com um toast.
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    travelService
      .options()
      .then((loadedOptions) => {
        if (!active) return;
        setOptions(loadedOptions);
      })
      .catch(() => {
        // Falhas auxiliares na abertura da tela ficam silenciosas.
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const enrichedRecords = useMemo(() => enrichTravelRecords(allRecords), [allRecords]);

  const plateOptions = options.filterPlates;
  const shipperOptions = options.filterShippers.length > 0 ? options.filterShippers : options.shippers;
  const originStateOptions = useMemo(
    () => Array.from(new Set(enrichedRecords.map((record) => extractState(record.origin)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [enrichedRecords],
  );
  const destinationStateOptions = useMemo(
    () => Array.from(new Set(enrichedRecords.map((record) => extractState(record.destination)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [enrichedRecords],
  );

  const records = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    return enrichedRecords.filter((record) => {
      const matchesShipper =
        shipperFilter.length === 0 || shipperFilter.includes(String(record.shipperId ?? ''));
      const matchesPlate = plateFilter.length === 0 || plateFilter.includes(record.plate);
      const matchesCteType =
        cteTypeFilter === 'ALL' ||
        record.ctes.some((cte) => cte.cteType === cteTypeFilter);
      const matchesOriginState =
        originStateFilter === 'ALL' || extractState(record.origin) === originStateFilter;
      const matchesDestinationState =
        destinationStateFilter === 'ALL' || extractState(record.destination) === destinationStateFilter;
      const matchesFreightType =
        freightTypeFilter.length === 0 ||
        (record.freightType !== '' && freightTypeFilter.includes(record.freightType));
      const matchesCst = cstFilter === 'ALL' || record.cst === cstFilter;
      const matchesPeriod =
        (!dateFrom || record.date >= dateFrom) && (!dateTo || record.date <= dateTo);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        record.plate.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.driverDisplay.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.driver.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.driverOne.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.driverTwo.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.origin.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.destination.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.cteNumber.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.cteSeries.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.shipper.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.detachedTrailerPlate.toLocaleLowerCase('pt-BR').includes(normalizedSearch);

      return (
        matchesShipper &&
        matchesPlate &&
        matchesCteType &&
        matchesOriginState &&
        matchesDestinationState &&
        matchesFreightType &&
        matchesCst &&
        matchesPeriod &&
        matchesSearch
      );
    });
  }, [
    cstFilter,
    cteTypeFilter,
    dateFrom,
    dateTo,
    destinationStateFilter,
    enrichedRecords,
    freightTypeFilter,
    originStateFilter,
    plateFilter,
    searchTerm,
    shipperFilter,
  ]);

  const summary = useMemo(() => getTravelSummary(records, cteTypeFilter), [cteTypeFilter, records]);

  const createShipper = useCallback(
    async (name: string): Promise<TravelOptionShipper | null> => {
      setCreatingShipper(true);
      try {
        const result = await travelService.createShipper(name);
        const shipper = result.shipper;

        setOptions((current) => {
          const addUnique = (items: TravelOptionShipper[]) =>
            [...items.filter((item) => item.id !== shipper.id), shipper].sort((a, b) =>
              a.name.localeCompare(b.name, 'pt-BR'),
            );

          return {
            ...current,
            shippers: addUnique(current.shippers),
            filterShippers: addUnique(current.filterShippers),
          };
        });

        notifications.success('Embarcador cadastrado', result.message);
        return shipper;
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível cadastrar o embarcador.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return null;
      } finally {
        setCreatingShipper(false);
      }
    },
    [notifications],
  );

  const saveRecord = useCallback(
    async (formData: TravelFormData, editingId?: number): Promise<TravelOperationResult> => {
      setSaving(true);

      try {
        const result = editingId
          ? await travelService.update(editingId, formData)
          : await travelService.create(formData);

        setAllRecords((current) => {
          const next = editingId
            ? current.map((record) => (record.id === editingId ? result.travel : record))
            : [result.travel, ...current];
          persistTravelCache(next);
          return next;
        });

        // Atualiza placas/embarcadores do filtro caso a nova viagem tenha introduzido
        // algum registro histórico de terceiro ou vínculo recém-criado.
        void refreshOptions(false);

        notifications.success(
          editingId ? 'Viagem atualizada' : 'Viagem cadastrada',
          result.message,
        );
        return { success: true };
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível salvar a viagem.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return { success: false, error: getApiErrorMessage(error, feedback.message) };
      } finally {
        setSaving(false);
      }
    },
    [notifications, refreshOptions],
  );

  const deleteRecord = useCallback(
    async (record: TravelRecord): Promise<boolean> => {
      setDeletingId(record.id);
      try {
        await travelService.remove(record.id);
        setAllRecords((current) => {
          const next = current.filter((item) => item.id !== record.id);
          persistTravelCache(next);
          return next;
        });
        void refreshOptions(false);
        notifications.success(
          'Viagem inativada',
          `O CT-e ${record.cteNumber}, série ${record.cteSeries}, saiu da listagem ativa e foi preservado no histórico.`,
        );
        return true;
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível excluir a viagem.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [notifications, refreshOptions],
  );

  return {
    records,
    summary,
    options,
    shipperOptions,
    shipperFilter,
    plateFilter,
    cteTypeFilter,
    originStateFilter,
    destinationStateFilter,
    freightTypeFilter,
    cstFilter,
    originStateOptions,
    destinationStateOptions,
    dateFrom,
    dateTo,
    plateOptions,
    searchTerm,
    loading,
    loadError,
    optionsLoading,
    saving,
    creatingShipper,
    deletingId,
    setShipperFilter,
    setPlateFilter,
    setCteTypeFilter,
    setOriginStateFilter,
    setDestinationStateFilter,
    setFreightTypeFilter,
    setCstFilter,
    setDateFrom,
    setDateTo,
    setSearchTerm,
    refreshOptions,
    createShipper,
    saveRecord,
    deleteRecord,
  };
}

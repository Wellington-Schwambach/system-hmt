import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback, getApiErrorMessage } from '../../utils/apiError';
import { vehicleService } from './services';
import type {
  VehicleFormData,
  VehicleOperationResult,
  VehiclePlateEndFilter,
  VehicleRecord,
  VehicleStatus,
} from './types';

export function useVehicleRecords() {
  const notifications = useNotifications();
  const [allRecords, setAllRecords] = useState<VehicleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
  const [plateEndFilter, setPlateEndFilter] = useState<VehiclePlateEndFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    vehicleService
      .list()
      .then((records) => {
        if (active) setAllRecords(records);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os veículos.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notifications]);

  const records = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    return allRecords.filter((record) => {
      const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
      const matchesPlateEnd =
        plateEndFilter === 'ALL' || record.plate.slice(-1) === plateEndFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        record.plate.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.fleetNumber.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.brand.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.model.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.renavam.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        record.chassis.toLocaleLowerCase('pt-BR').includes(normalizedSearch);

      return matchesStatus && matchesPlateEnd && matchesSearch;
    });
  }, [allRecords, plateEndFilter, searchTerm, statusFilter]);

  const saveRecord = useCallback(
    async (formData: VehicleFormData, editingId?: number): Promise<VehicleOperationResult> => {
      setSaving(true);

      try {
        const result = editingId
          ? await vehicleService.update(editingId, formData)
          : await vehicleService.create(formData);

        setAllRecords((currentRecords) =>
          editingId
            ? currentRecords.map((record) => (record.id === editingId ? result.vehicle : record))
            : [result.vehicle, ...currentRecords],
        );
        notifications.success(editingId ? 'Veículo atualizado' : 'Veículo cadastrado', result.message);
        return { success: true };
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o veículo.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return { success: false, error: getApiErrorMessage(error, feedback.message) };
      } finally {
        setSaving(false);
      }
    },
    [notifications],
  );

  const deleteRecord = useCallback(
    async (record: VehicleRecord): Promise<boolean> => {
      setDeletingId(record.id);

      try {
        await vehicleService.remove(record.id);
        setAllRecords((currentRecords) =>
          currentRecords.filter((currentRecord) => currentRecord.id !== record.id),
        );
        notifications.success('Veículo excluído', `${record.plate} foi removido com sucesso.`);
        return true;
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível excluir o veículo.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [notifications],
  );

  const downloadCrlv = useCallback(
    async (record: VehicleRecord): Promise<void> => {
      try {
        await vehicleService.downloadCrlv(record);
        notifications.success('Download iniciado', `O CRLV do veículo ${record.plate} está sendo baixado.`);
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível baixar o CRLV.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      }
    },
    [notifications],
  );

  return {
    records,
    totalRecords: allRecords.length,
    searchTerm,
    statusFilter,
    plateEndFilter,
    loading,
    saving,
    deletingId,
    setSearchTerm,
    setStatusFilter,
    setPlateEndFilter,
    clearFeedback: () => undefined,
    saveRecord,
    deleteRecord,
    downloadCrlv,
  };
}

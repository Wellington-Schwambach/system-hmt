import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback, getApiErrorMessage } from '../../utils/apiError';
import { EMPLOYEES_STORAGE_KEY } from './constants';
import { employeeService } from './services';
import type {
  EmployeeDocumentType,
  EmployeeFormData,
  EmployeeOperationResult,
  EmployeeRecord,
  EmployeeStatus,
} from './types';
import { onlyDigits } from './utils';


function sortEmployeesByName(records: EmployeeRecord[]): EmployeeRecord[] {
  return [...records].sort((left, right) =>
    left.fullName.localeCompare(right.fullName, 'pt-BR', { sensitivity: 'base' }),
  );
}

function persistEmployeeCache(records: EmployeeRecord[]): void {
  try {
    window.localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // O cadastro principal continua no PostgreSQL; o cache serve apenas aos módulos legados.
  }
}

export function useEmployeeRecords() {
  const notifications = useNotifications();
  const [allRecords, setAllRecords] = useState<EmployeeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'ALL'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    employeeService
      .list()
      .then((records) => {
        if (active) {
          const sortedRecords = sortEmployeesByName(records);
          setAllRecords(sortedRecords);
          persistEmployeeCache(sortedRecords);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os colaboradores.');
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
    const normalizeText = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR');

    const normalizedSearch = normalizeText(searchTerm.trim());
    const searchDigits = onlyDigits(searchTerm);

    return allRecords.filter((record) => {
      const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
      const matchesText =
        normalizeText(record.fullName).includes(normalizedSearch) ||
        normalizeText(record.employeeCode).includes(normalizedSearch) ||
        normalizeText(record.jobTitle).includes(normalizedSearch) ||
        normalizeText(record.email).includes(normalizedSearch);
      const matchesDigits =
        searchDigits.length > 0 &&
        (record.cpf.includes(searchDigits) ||
          record.cnhNumber.includes(searchDigits) ||
          record.phone.includes(searchDigits));
      const matchesSearch = normalizedSearch.length === 0 || matchesText || matchesDigits;

      return matchesStatus && matchesSearch;
    });
  }, [allRecords, searchTerm, statusFilter]);

  const saveRecord = useCallback(
    async (formData: EmployeeFormData, editingId?: number): Promise<EmployeeOperationResult> => {
      setSaving(true);

      try {
        const result = editingId
          ? await employeeService.update(editingId, formData)
          : await employeeService.create(formData);

        setAllRecords((currentRecords) => {
          const updatedRecords = sortEmployeesByName(
            editingId
              ? currentRecords.map((record) => (record.id === editingId ? result.employee : record))
              : [result.employee, ...currentRecords],
          );
          persistEmployeeCache(updatedRecords);
          return updatedRecords;
        });
        notifications.success(
          editingId ? 'Colaborador atualizado' : 'Colaborador cadastrado',
          result.message,
        );
        return { success: true };
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o colaborador.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return { success: false, error: getApiErrorMessage(error, feedback.message) };
      } finally {
        setSaving(false);
      }
    },
    [notifications],
  );

  const deleteRecord = useCallback(
    async (record: EmployeeRecord): Promise<boolean> => {
      setDeletingId(record.id);

      try {
        await employeeService.remove(record.id);
        setAllRecords((currentRecords) => {
          const updatedRecords = currentRecords.filter(
            (currentRecord) => currentRecord.id !== record.id,
          );
          persistEmployeeCache(updatedRecords);
          return updatedRecords;
        });
        notifications.success('Colaborador excluído', `${record.fullName} foi removido com sucesso.`);
        return true;
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível excluir o colaborador.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [notifications],
  );

  const downloadDocument = useCallback(
    async (record: EmployeeRecord, type: EmployeeDocumentType): Promise<void> => {
      try {
        await employeeService.downloadDocument(record, type);
        notifications.success('Download iniciado', `O documento de ${record.fullName} está sendo baixado.`);
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível baixar o documento.');
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
    loading,
    saving,
    deletingId,
    setSearchTerm,
    setStatusFilter,
    clearFeedback: () => undefined,
    saveRecord,
    deleteRecord,
    downloadDocument,
  };
}

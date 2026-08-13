import { useCallback, useState } from 'react';

import { useNotifications } from '../../contexts/Notifications';

import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeTabs } from './components/EmployeeTabs';
import { useEmployeeRecords } from './hooks';
import { Page } from './styles';
import type { EmployeeFormData, EmployeeRecord, EmployeeTab } from './types';
import { exportEmployeesToExcel } from './utils';

export function Employees() {
  const notifications = useNotifications();
  const [activeTab, setActiveTab] = useState<EmployeeTab>('LIST');
  const [editingRecord, setEditingRecord] = useState<EmployeeRecord | null>(null);
  const {
    records,
    totalRecords,
    searchTerm,
    statusFilter,
    loading,
    saving,
    deletingId,
    setSearchTerm,
    setStatusFilter,
    clearFeedback,
    saveRecord,
    deleteRecord,
    downloadDocument,
  } = useEmployeeRecords();

  const handleTabChange = useCallback(
    (tab: EmployeeTab) => {
      setActiveTab(tab);
      clearFeedback();
      if (tab === 'LIST') setEditingRecord(null);
    },
    [clearFeedback],
  );

  const handleCreate = useCallback(() => {
    clearFeedback();
    setEditingRecord(null);
    setActiveTab('FORM');
  }, [clearFeedback]);

  const handleEdit = useCallback(
    (record: EmployeeRecord) => {
      clearFeedback();
      setEditingRecord(record);
      setActiveTab('FORM');
    },
    [clearFeedback],
  );

  const handleSave = useCallback(
    async (formData: EmployeeFormData, editingId?: number) => {
      const result = await saveRecord(formData, editingId);
      if (result.success) {
        setEditingRecord(null);
        setActiveTab('LIST');
      }
      return result;
    },
    [saveRecord],
  );

  const handleDelete = useCallback(
    async (record: EmployeeRecord) => {
      const confirmed = await notifications.confirm({
        title: 'Excluir colaborador?',
        message: `${record.fullName} será removido permanentemente.`,
        details: ['CNH, ASO, toxicológico e ficha de registro anexados também serão excluídos.'],
        type: 'error',
        confirmLabel: 'Excluir colaborador',
      });

      if (confirmed) await deleteRecord(record);
    },
    [deleteRecord, notifications],
  );

  return (
    <Page>
      <EmployeeTabs activeTab={activeTab} employeeCount={totalRecords} onChange={handleTabChange} />

      {activeTab === 'FORM' ? (
        <EmployeeForm
          key={editingRecord?.id ?? 'new-employee'}
          editingRecord={editingRecord}
          saving={saving}
          onCancelEditing={() => {
            setEditingRecord(null);
            setActiveTab('LIST');
          }}
          onSubmit={handleSave}
        />
      ) : (
        <EmployeeList
          records={records}
          totalRecords={totalRecords}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          loading={loading}
          deletingId={deletingId}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownloadDocument={(record, type) => void downloadDocument(record, type)}
          onExport={() => {
            exportEmployeesToExcel(records);
            notifications.success('Excel gerado', `${records.length} colaborador(es) exportado(s).`);
          }}
        />
      )}
    </Page>
  );
}

import { useCallback, useState } from 'react';

import { useNotifications } from '../../contexts/Notifications';

import { VehicleForm } from './components/VehicleForm';
import { VehicleList } from './components/VehicleList';
import { VehicleTabs } from './components/VehicleTabs';
import { useVehicleRecords } from './hooks';
import { Page } from './styles';
import type { VehicleFormData, VehicleRecord, VehicleTab } from './types';
import { exportVehiclesToExcel } from './utils';

export function Vehicles() {
  const notifications = useNotifications();
  const [activeTab, setActiveTab] = useState<VehicleTab>('LIST');
  const [editingRecord, setEditingRecord] = useState<VehicleRecord | null>(null);
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
    downloadCrlv,
  } = useVehicleRecords();

  const handleTabChange = useCallback(
    (tab: VehicleTab) => {
      setActiveTab(tab);
      clearFeedback();

      if (tab === 'LIST') {
        setEditingRecord(null);
      }
    },
    [clearFeedback],
  );

  const handleCreate = useCallback(() => {
    clearFeedback();
    setEditingRecord(null);
    setActiveTab('FORM');
  }, [clearFeedback]);

  const handleEdit = useCallback(
    (record: VehicleRecord) => {
      clearFeedback();
      setEditingRecord(record);
      setActiveTab('FORM');
    },
    [clearFeedback],
  );

  const handleSave = useCallback(
    async (formData: VehicleFormData, editingId?: number) => {
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
    async (record: VehicleRecord) => {
      const confirmed = await notifications.confirm({
        title: 'Excluir veículo?',
        message: `O veículo ${record.plate} será removido permanentemente.`,
        details: record.crlv ? ['O CRLV anexado também será excluído.'] : undefined,
        type: 'error',
        confirmLabel: 'Excluir veículo',
      });

      if (confirmed) await deleteRecord(record);
    },
    [deleteRecord, notifications],
  );

  return (
    <Page>
      <VehicleTabs activeTab={activeTab} vehicleCount={totalRecords} onChange={handleTabChange} />

      {activeTab === 'FORM' ? (
        <VehicleForm
          key={editingRecord?.id ?? 'new-vehicle'}
          editingRecord={editingRecord}
          saving={saving}
          onCancelEditing={() => {
            setEditingRecord(null);
            setActiveTab('LIST');
          }}
          onSubmit={handleSave}
        />
      ) : (
        <VehicleList
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
          onDownloadCrlv={(record) => void downloadCrlv(record)}
          onExport={() => {
            exportVehiclesToExcel(records);
            notifications.success('Excel gerado', `${records.length} veículo(s) exportado(s).`);
          }}
        />
      )}
    </Page>
  );
}

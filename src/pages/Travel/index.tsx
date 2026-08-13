import { useCallback, useState } from 'react';
import { Banknote, CircleDollarSign, Map, TrendingUp } from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { FloatingAddButton } from './components/FloatingAddButton';
import { TravelFilters } from './components/TravelFilters';
import { TravelFormModal } from './components/TravelFormModal';
import { TravelMobileList } from './components/TravelMobileList';
import { TravelSummaryCard } from './components/TravelSummaryCard';
import { TravelTable } from './components/TravelTable';
import { useTravelRecords } from './hooks';
import { RecordsSection, SectionHeader, SectionMeta, SectionTitle, SummaryGrid } from './styles';
import type { TravelFormData, TravelRecordWithMetrics } from './types';
import { formatCurrency } from './utils';

export function Travel() {
  const notifications = useNotifications();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TravelRecordWithMetrics | null>(null);
  const {
    records,
    summary,
    options,
    shipperOptions,
    shipperFilter,
    plateFilter,
    cteTypeFilter,
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
    setSearchTerm,
    refreshOptions,
    createShipper,
    saveRecord,
    deleteRecord,
  } = useTravelRecords();

  const handleOpenCreateModal = useCallback(async () => {
    setEditingRecord(null);
    await refreshOptions(true);
    setIsFormModalOpen(true);
  }, [refreshOptions]);

  const handleOpenEditModal = useCallback(async (record: TravelRecordWithMetrics) => {
    setEditingRecord(record);
    await refreshOptions(true);
    setIsFormModalOpen(true);
  }, [refreshOptions]);

  const handleCloseFormModal = useCallback(() => {
    if (saving) return;
    setIsFormModalOpen(false);
    setEditingRecord(null);
  }, [saving]);

  const handleSubmitTravelRecord = useCallback(
    async (formData: TravelFormData) => {
      const result = await saveRecord(formData, editingRecord?.id);
      if (result.success) handleCloseFormModal();
      return result;
    },
    [editingRecord?.id, handleCloseFormModal, saveRecord],
  );

  const handleDelete = useCallback(
    async (record: TravelRecordWithMetrics) => {
      const confirmed = await notifications.confirm({
        title: 'Excluir viagem?',
        message: `O CT-e ${record.cteNumber}, série ${record.cteSeries}, será removido permanentemente.`,
        details: [`${record.origin} → ${record.destination}`, `Frete bruto: ${formatCurrency(record.grossFreight)}`],
        type: 'error',
        confirmLabel: 'Excluir viagem',
      });

      if (confirmed) await deleteRecord(record);
    },
    [deleteRecord, notifications],
  );

  return (
    <>
      <SummaryGrid aria-label="Resumo das viagens">
        <TravelSummaryCard label="Total de viagens" value={String(summary.totalTrips)} icon={Map} />
        <TravelSummaryCard
          label="Frete líquido"
          value={formatCurrency(summary.totalNetFreight)}
          icon={CircleDollarSign}
        />
        <TravelSummaryCard
          label="Frete bruto"
          value={formatCurrency(summary.totalGrossFreight)}
          icon={Banknote}
        />
        <TravelSummaryCard
          label="Diferença"
          value={formatCurrency(summary.totalDifference)}
          icon={TrendingUp}
          breakdown={[
            { label: 'ICMS', value: formatCurrency(summary.totalIcms) },
            { label: 'Seguro', value: formatCurrency(summary.totalInsurance) },
            { label: 'Pedágio', value: formatCurrency(summary.totalToll) },
          ]}
        />
      </SummaryGrid>

      <TravelFilters
        shipperFilter={shipperFilter}
        shipperOptions={shipperOptions}
        plateFilter={plateFilter}
        plateOptions={plateOptions}
        cteTypeFilter={cteTypeFilter}
        searchTerm={searchTerm}
        onShipperFilterChange={setShipperFilter}
        onPlateFilterChange={setPlateFilter}
        onCteTypeFilterChange={setCteTypeFilter}
        onSearchChange={setSearchTerm}
      />

      <RecordsSection>
        <SectionHeader>
          <SectionTitle>Viagens registradas</SectionTitle>
          <SectionMeta>
            {loading
              ? 'Carregando viagens...'
              : loadError
                ? 'Não foi possível atualizar a listagem.'
                : `${records.length} registro(s) exibido(s)`}
          </SectionMeta>
        </SectionHeader>

        <TravelTable
          records={records}
          loading={loading}
          deletingId={deletingId}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
        <TravelMobileList
          records={records}
          loading={loading}
          deletingId={deletingId}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </RecordsSection>

      <FloatingAddButton onClick={handleOpenCreateModal} />

      {isFormModalOpen && (
        <TravelFormModal
          isOpen
          editingRecord={editingRecord}
          options={options}
          optionsLoading={optionsLoading}
          saving={saving}
          creatingShipper={creatingShipper}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmitTravelRecord}
          onCreateShipper={createShipper}
        />
      )}
    </>
  );
}

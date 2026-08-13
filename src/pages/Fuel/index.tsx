import { useCallback, useState } from 'react';
import { Banknote, Droplets, Fuel as FuelIcon, ListChecks } from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';

import { FloatingAddButton } from './components/FloatingAddButton';
import { FuelFilters } from './components/FuelFilters';
import { FuelFormModal } from './components/FuelFormModal';
import { FuelMobileList } from './components/FuelMobileList';
import { FuelSummaryCard } from './components/FuelSummaryCard';
import { FuelTable } from './components/FuelTable';
import { useFuelRecords } from './hooks';
import { RecordsSection, SectionHeader, SectionMeta, SectionTitle, SummaryGrid } from './styles';
import type { FuelFormData, FuelRecordWithMetrics } from './types';
import { formatCurrency, formatDate, formatDecimal } from './utils';

export function Fuel() {
  const notifications = useNotifications();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FuelRecordWithMetrics | null>(null);
  const {
    records,
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
  } = useFuelRecords();

  const handleOpenCreateModal = useCallback(() => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((record: FuelRecordWithMetrics) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingRecord(null);
  }, []);

  const handleSubmitFuelRecord = useCallback(
    (formData: FuelFormData) => {
      if (editingRecord) {
        updateRecord(editingRecord.id, formData);
        return;
      }

      addRecord(formData);
    },
    [addRecord, editingRecord, updateRecord],
  );

  const handleInvoiceRecord = useCallback(
    async (record: FuelRecordWithMetrics) => {
      const confirmed = await notifications.confirm({
        title: 'Confirmar faturamento?',
        message: `O abastecimento da placa ${record.plate}, realizado em ${formatDate(record.date)}, será marcado como faturado.`,
        type: 'info',
        confirmLabel: 'Marcar como faturado',
      });

      if (confirmed) {
        invoiceRecord(record.id);
        notifications.success('Abastecimento faturado', `O registro da placa ${record.plate} foi atualizado.`);
      }
    },
    [invoiceRecord, notifications],
  );

  return (
    <>
      <SummaryGrid aria-label="Resumo dos abastecimentos">
        <FuelSummaryCard label="Registros" value={String(summary.totalRecords)} icon={ListChecks} />
        <FuelSummaryCard
          label="Diesel"
          value={`${formatDecimal(summary.totalDieselLiters)} L`}
          icon={FuelIcon}
        />
        <FuelSummaryCard
          label="Arla"
          value={`${formatDecimal(summary.totalArlaLiters)} L`}
          icon={Droplets}
        />
        <FuelSummaryCard
          label="Valor total"
          value={formatCurrency(summary.totalValue)}
          icon={Banknote}
        />
      </SummaryGrid>

      <FuelFilters
        filter={filter}
        plateFilter={plateFilter}
        plateOptions={plateOptions}
        searchTerm={searchTerm}
        onFilterChange={setFilter}
        onPlateFilterChange={setPlateFilter}
        onSearchChange={setSearchTerm}
      />

      <RecordsSection>
        <SectionHeader>
          <SectionTitle>Abastecimentos registrados</SectionTitle>
          <SectionMeta>{records.length} registro(s) exibido(s)</SectionMeta>
        </SectionHeader>

        <FuelTable records={records} onEdit={handleOpenEditModal} onInvoice={handleInvoiceRecord} />
        <FuelMobileList
          records={records}
          onEdit={handleOpenEditModal}
          onInvoice={handleInvoiceRecord}
        />
      </RecordsSection>

      <FloatingAddButton onClick={handleOpenCreateModal} />

      {isFormModalOpen && (
        <FuelFormModal
          isOpen
          editingRecord={editingRecord}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmitFuelRecord}
        />
      )}
    </>
  );
}

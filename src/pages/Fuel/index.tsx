import { useCallback, useState } from 'react';
import { Banknote, CircleDollarSign, Droplets, Eye, EyeOff, Fuel as FuelIcon, ListChecks } from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';

import { FloatingAddButton } from './components/FloatingAddButton';
import { FuelFilters } from './components/FuelFilters';
import { FuelFormModal } from './components/FuelFormModal';
import { FuelMobileList } from './components/FuelMobileList';
import { FuelSummaryCard } from './components/FuelSummaryCard';
import { FuelTable } from './components/FuelTable';
import { useFuelRecords } from './hooks';
import { RecordsSection, SectionHeader, SectionMeta, SectionTitle, SummaryGrid } from './styles';
import type { FuelFormData, FuelInvoiceTarget, FuelRecordWithMetrics } from './types';
import { formatCurrency, formatDate, formatDecimal } from './utils';

export function Fuel() {
  const notifications = useNotifications();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FuelRecordWithMetrics | null>(null);
  const [showFinancialValues, setShowFinancialValues] = useState(false);
  const {
    records,
    summary,
    filter,
    plateFilter,
    plateOptions,
    billingMonthFilter,
    billingMonthOptions,
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
    setSearchTerm,
    refreshOptions,
    saveRecord,
    invoiceRecord,
    deleteRecord,
  } = useFuelRecords();

  const handleOpenCreateModal = useCallback(async () => {
    try {
      await refreshOptions();
    } catch {
      // A tela já possui tratamento de indisponibilidade; não bloqueia a abertura do modal.
    }
    setEditingRecord(null);
    setIsFormModalOpen(true);
  }, [refreshOptions]);

  const handleOpenEditModal = useCallback(async (record: FuelRecordWithMetrics) => {
    try {
      await refreshOptions();
    } catch {
      // Mantém os dados já carregados caso a atualização das opções falhe.
    }
    setEditingRecord(record);
    setIsFormModalOpen(true);
  }, [refreshOptions]);

  const handleCloseFormModal = useCallback(() => {
    if (saving) return;
    setIsFormModalOpen(false);
    setEditingRecord(null);
  }, [saving]);

  const handleSubmitFuelRecord = useCallback(
    async (formData: FuelFormData): Promise<boolean> => {
      try {
        const wasEditing = Boolean(editingRecord);
        await saveRecord(formData, editingRecord?.id);
        notifications.success(
          wasEditing ? 'Abastecimento atualizado' : 'Abastecimento cadastrado',
          wasEditing
            ? 'As informações foram salvas no banco de dados.'
            : 'O abastecimento foi gravado no banco de dados.',
        );
        return true;
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o abastecimento.');
        notifications.error(feedback.title, feedback.message, feedback.details);
        return false;
      }
    },
    [editingRecord, notifications, saveRecord],
  );

  const handleInvoiceRecord = useCallback(
    async (record: FuelRecordWithMetrics, target: FuelInvoiceTarget) => {
      const product = target === 'DIESEL' ? 'Diesel' : 'Arla';
      const confirmed = await notifications.confirm({
        title: `Faturar ${product}?`,
        message: `Somente o ${product} do abastecimento da placa ${record.plate}, realizado em ${formatDate(record.date)}, será marcado como faturado.`,
        type: 'info',
        confirmLabel: `Faturar ${product}`,
      });

      if (!confirmed) return;

      try {
        await invoiceRecord(record.id, target);
        notifications.success(
          `${product} faturado`,
          `O faturamento do ${product} da placa ${record.plate} foi gravado no banco.`,
        );
      } catch (error) {
        const feedback = getApiErrorFeedback(error, `Não foi possível faturar o ${product}.`);
        notifications.error(feedback.title, feedback.message, feedback.details);
      }
    },
    [invoiceRecord, notifications],
  );

  const handleDeleteRecord = useCallback(
    async (record: FuelRecordWithMetrics) => {
      const confirmed = await notifications.confirm({
        title: 'Excluir abastecimento?',
        message: `O abastecimento da placa ${record.plate}, realizado em ${formatDate(record.date)}, será removido da listagem.`,
        details: [
          `Posto: ${record.station}`,
          `Diesel: ${formatDecimal(record.dieselLiters)} L`,
          record.arlaLiters > 0 ? `ARLA: ${formatDecimal(record.arlaLiters)} L` : 'Sem ARLA',
        ],
        type: 'error',
        confirmLabel: 'Excluir abastecimento',
      });

      if (!confirmed) return;

      try {
        await deleteRecord(record.id);
        notifications.success('Abastecimento excluído', 'O registro foi removido com sucesso.');
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível excluir o abastecimento.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      }
    },
    [deleteRecord, notifications],
  );

  return (
    <>
      <SummaryGrid aria-label="Resumo dos abastecimentos">
        <FuelSummaryCard label="Quantidade" value={String(summary.totalRecords)} icon={ListChecks} />
        <FuelSummaryCard label="Litros Diesel" value={`${formatDecimal(summary.totalDieselLiters)} L`} icon={FuelIcon} />
        <FuelSummaryCard
          label="R$ Diesel"
          value={showFinancialValues ? formatCurrency(summary.totalDieselValue) : '••••••'}
          icon={CircleDollarSign}
        />
        <FuelSummaryCard label="Litros Arla" value={`${formatDecimal(summary.totalArlaLiters)} L`} icon={Droplets} />
        <FuelSummaryCard
          label="R$ Arla"
          value={showFinancialValues ? formatCurrency(summary.totalArlaValue) : '••••••'}
          icon={CircleDollarSign}
        />
        <FuelSummaryCard
          label="R$ Total"
          value={showFinancialValues ? formatCurrency(summary.totalValue) : '••••••'}
          icon={Banknote}
          action={
            <button
              type="button"
              onClick={() => setShowFinancialValues((visible) => !visible)}
              aria-label={showFinancialValues ? 'Ocultar valores financeiros' : 'Mostrar valores financeiros'}
              title={showFinancialValues ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {showFinancialValues ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      </SummaryGrid>

      <FuelFilters
        filter={filter}
        plateFilter={plateFilter}
        plateOptions={plateOptions}
        billingMonthFilter={billingMonthFilter}
        billingMonthOptions={billingMonthOptions}
        searchTerm={searchTerm}
        onFilterChange={setFilter}
        onPlateFilterChange={setPlateFilter}
        onBillingMonthFilterChange={setBillingMonthFilter}
        onSearchChange={setSearchTerm}
      />

      <RecordsSection>
        <SectionHeader>
          <SectionTitle>Abastecimentos registrados</SectionTitle>
          <SectionMeta>{loading ? 'Carregando...' : `${records.length} registro(s) exibido(s)`}</SectionMeta>
        </SectionHeader>

        <FuelTable
          records={records}
          deletingId={deletingId}
          invoicingKey={invoicingKey}
          onEdit={handleOpenEditModal}
          onInvoice={handleInvoiceRecord}
          onDelete={handleDeleteRecord}
        />
        <FuelMobileList
          records={records}
          deletingId={deletingId}
          invoicingKey={invoicingKey}
          onEdit={handleOpenEditModal}
          onInvoice={handleInvoiceRecord}
          onDelete={handleDeleteRecord}
        />
      </RecordsSection>

      <FloatingAddButton onClick={handleOpenCreateModal} />

      {isFormModalOpen && (
        <FuelFormModal
          isOpen
          editingRecord={editingRecord}
          vehicleOptions={vehicleOptions}
          driverOptions={driverOptions}
          saving={saving}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmitFuelRecord}
        />
      )}
    </>
  );
}

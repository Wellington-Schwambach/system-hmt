import { useCallback, useMemo, useState } from 'react';
import { Banknote, ChevronLeft, ChevronRight, CircleDollarSign, Droplets, Eye, EyeOff, Fuel as FuelIcon, History, ListChecks, RotateCcw } from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';

import { FloatingAddButton } from './components/FloatingAddButton';
import { FuelFilters } from './components/FuelFilters';
import { FuelFormModal } from './components/FuelFormModal';
import { FuelMobileList } from './components/FuelMobileList';
import { FuelSummaryCard } from './components/FuelSummaryCard';
import { FuelTable } from './components/FuelTable';
import { useFuelRecords } from './hooks';
import { HistoryCard, HistoryItem, HistoryList, ModuleTab, ModuleTabs, PageButton, PageInfo, PageSizeSelect, Pagination, PaginationActions, PaginationSummary, RecordsSection, RestoreButton, SectionHeader, SectionMeta, SectionTitle, SummaryGrid } from './styles';
import type { FuelFormData, FuelHistoryEvent, FuelInvoiceTarget, FuelRecordWithMetrics } from './types';
import { fuelService } from './services';
import { formatCurrency, formatDate, formatDecimal } from './utils';


export function Fuel() {
  const notifications = useNotifications();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FuelRecordWithMetrics | null>(null);
  const [showFinancialValues, setShowFinancialValues] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<'records' | 'history'>('records');
  const [historyEvents, setHistoryEvents] = useState<FuelHistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const {
    records,
    summary,
    filter,
    plateFilter,
    plateOptions,
    billingMonthFilter,
    billingMonthOptions,
    dateFrom,
    dateTo,
    vehicleOptions,
    trailerOptions,
    activeSets,
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
    refreshOptions,
    saveRecord,
    invoiceRecord,
    deleteRecord,
  } = useFuelRecords();

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [pageSize, records, safePage]);
  const firstVisibleRecord = records.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastVisibleRecord = Math.min(safePage * pageSize, records.length);

  const resetPage = useCallback(<T,>(setter: (value: T) => void, value: T) => {
    setCurrentPage(1);
    setter(value);
  }, []);

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
        title: 'Inativar abastecimento?',
        message: `O abastecimento da placa ${record.plate}, realizado em ${formatDate(record.date)}, será retirado da listagem ativa, mas continuará salvo no histórico.`,
        details: [
          `Posto: ${record.station}`,
          `Diesel: ${formatDecimal(record.dieselLiters)} L`,
          record.arlaLiters > 0 ? `ARLA: ${formatDecimal(record.arlaLiters)} L` : 'Sem ARLA',
        ],
        type: 'error',
        confirmLabel: 'Inativar abastecimento',
      });

      if (!confirmed) return;

      try {
        await deleteRecord(record.id);
        notifications.success('Abastecimento inativado', 'O registro saiu da listagem ativa e foi preservado no histórico.');
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível excluir o abastecimento.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      }
    },
    [deleteRecord, notifications],
  );

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistoryEvents(await fuelService.history());
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível carregar o histórico de abastecimentos.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setHistoryLoading(false);
    }
  }, [notifications]);

  const changeTab = useCallback((tab: 'records' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') void loadHistory();
  }, [loadHistory]);

  const restoreRecord = useCallback(async (recordId: number) => {
    const confirmed = await notifications.confirm({
      title: 'Reativar abastecimento?',
      message: 'O registro voltará para a listagem de abastecimentos ativos.',
      type: 'info',
      confirmLabel: 'Reativar',
    });
    if (!confirmed) return;
    try {
      await fuelService.restore(recordId);
      notifications.success('Abastecimento reativado', 'O registro voltou para a listagem ativa.');
      await loadHistory();
      window.location.reload();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível reativar o abastecimento.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    }
  }, [loadHistory, notifications]);

  const formatHistoryDateTime = (value: string) => new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));

  return (
    <>
      <ModuleTabs aria-label="Abas de combustível">
        <ModuleTab type="button" $active={activeTab === 'records'} onClick={() => changeTab('records')}>Abastecimentos</ModuleTab>
        <ModuleTab type="button" $active={activeTab === 'history'} onClick={() => changeTab('history')}><History size={15} /> Histórico</ModuleTab>
      </ModuleTabs>

      {activeTab === 'records' ? <>
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
        dateFrom={dateFrom}
        dateTo={dateTo}
        searchTerm={searchTerm}
        onFilterChange={(value) => resetPage(setFilter, value)}
        onPlateFilterChange={(value) => resetPage(setPlateFilter, value)}
        onBillingMonthFilterChange={(value) => resetPage(setBillingMonthFilter, value)}
        onDateFromChange={(value) => resetPage(setDateFrom, value)}
        onDateToChange={(value) => resetPage(setDateTo, value)}
        onSearchChange={(value) => resetPage(setSearchTerm, value)}
      />

      <RecordsSection>
        <SectionHeader>
          <SectionTitle>Abastecimentos registrados</SectionTitle>
          <SectionMeta>{loading ? 'Carregando...' : `${firstVisibleRecord}-${lastVisibleRecord} de ${records.length} registro(s)`}</SectionMeta>
        </SectionHeader>

        <FuelTable
          records={paginatedRecords}
          deletingId={deletingId}
          invoicingKey={invoicingKey}
          onEdit={handleOpenEditModal}
          onInvoice={handleInvoiceRecord}
          onDelete={handleDeleteRecord}
        />
        <FuelMobileList
          records={paginatedRecords}
          deletingId={deletingId}
          invoicingKey={invoicingKey}
          onEdit={handleOpenEditModal}
          onInvoice={handleInvoiceRecord}
          onDelete={handleDeleteRecord}
        />

        {!loading && records.length > 0 ? (
          <Pagination aria-label="Paginação dos abastecimentos">
            <PaginationSummary>
              <span>Itens por página</span>
              <PageSizeSelect
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Quantidade de abastecimentos por página"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </PageSizeSelect>
            </PaginationSummary>

            <PaginationActions>
              <PageButton
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </PageButton>

              <PageInfo>
                Página <strong>{safePage}</strong> de <strong>{totalPages}</strong>
              </PageInfo>

              <PageButton
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                aria-label="Próxima página"
              >
                <ChevronRight size={16} />
              </PageButton>
            </PaginationActions>
          </Pagination>
        ) : null}
      </RecordsSection>
      </> : (
        <RecordsSection>
          <SectionHeader><SectionTitle>Histórico de edições e exclusões</SectionTitle><SectionMeta>{historyLoading ? 'Carregando...' : `${historyEvents.length} evento(s)`}</SectionMeta></SectionHeader>
          <HistoryList>
            {historyLoading ? <SectionMeta>Carregando histórico...</SectionMeta> : historyEvents.length === 0 ? <SectionMeta>Nenhuma edição ou exclusão registrada ainda.</SectionMeta> : historyEvents.map((event) => {
              const data = (event.after ?? event.before ?? {}) as Record<string, unknown>;
              const actionLabel = event.action === 'UPDATED' ? 'Editado' : event.action === 'DELETED' ? 'Inativado' : 'Reativado';
              return <HistoryCard key={event.id}>
                <HistoryItem><strong>{actionLabel}</strong>{formatHistoryDateTime(event.occurredAt)}</HistoryItem>
                <HistoryItem><strong>{String(data.plate ?? 'Sem placa')}</strong>{String(data.station ?? 'Posto não informado')}</HistoryItem>
                <HistoryItem><strong>{event.userName || 'Usuário não informado'}</strong>{data.date ? `Abastecimento de ${String(data.date).split('-').reverse().join('/')}` : `Registro #${event.recordId}`}</HistoryItem>
                {event.action === 'DELETED' && event.inactive ? <RestoreButton type="button" onClick={() => void restoreRecord(event.recordId)}><RotateCcw size={14} /> Reativar</RestoreButton> : <span />}
              </HistoryCard>;
            })}
          </HistoryList>
        </RecordsSection>
      )}

      {activeTab === 'records' ? <FloatingAddButton onClick={handleOpenCreateModal} /> : null}

      {isFormModalOpen && (
        <FuelFormModal
          isOpen
          editingRecord={editingRecord}
          vehicleOptions={vehicleOptions}
          trailerOptions={trailerOptions}
          activeSets={activeSets}
          driverOptions={driverOptions}
          saving={saving}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmitFuelRecord}
        />
      )}
    </>
  );
}

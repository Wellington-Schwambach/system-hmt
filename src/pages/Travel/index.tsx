import { useCallback, useMemo, useState } from 'react';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  FileSpreadsheet,
  History,
  Map,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { CheckboxMultiSelect } from '../../components/CheckboxMultiSelect';
import { FloatingAddButton } from './components/FloatingAddButton';
import { CST_OPTIONS, FREIGHT_TYPE_OPTIONS } from './constants';
import { TravelFilters } from './components/TravelFilters';
import { TravelFormModal } from './components/TravelFormModal';
import { TravelMobileList } from './components/TravelMobileList';
import { TravelSummaryCard } from './components/TravelSummaryCard';
import { TravelTable } from './components/TravelTable';
import { useTravelRecords } from './hooks';
import {
  ExportButton,
  HistoryCard,
  HistoryItem,
  HistoryList,
  ModuleTab,
  ModuleTabs,
  PageButton,
  PageInfo,
  PageSizeSelect,
  Pagination,
  PaginationActions,
  PaginationSummary,
  RecordFilterField,
  RecordFilterLabel,
  RecordFilterSelect,
  RecordFilters,
  RecordsSection,
  RestoreButton,
  SectionActions,
  SectionHeader,
  SectionMeta,
  SectionTitle,
  SummaryGrid,
} from './styles';
import type { TravelFormData, TravelFreightType, TravelHistoryEvent, TravelRecordWithMetrics } from './types';
import { travelService } from './services';
import { exportTravelsToExcel, formatCurrency } from './utils';

export function Travel() {
  const notifications = useNotifications();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TravelRecordWithMetrics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFinancialValues, setShowFinancialValues] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'history'>('records');
  const [historyEvents, setHistoryEvents] = useState<TravelHistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const {
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
  } = useTravelRecords();

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (visiblePage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [pageSize, records, visiblePage]);

  const firstVisibleRecord = records.length === 0 ? 0 : (visiblePage - 1) * pageSize + 1;
  const lastVisibleRecord = Math.min(visiblePage * pageSize, records.length);

  const resetPage = useCallback(<T,>(setter: (value: T) => void, value: T) => {
    setCurrentPage(1);
    setter(value);
  }, []);

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

  const handleExport = useCallback(() => {
    if (records.length === 0) {
      notifications.info('Nada para exportar', 'Nenhuma viagem corresponde aos filtros atuais.');
      return;
    }

    try {
      exportTravelsToExcel(records, cteTypeFilter);
      notifications.success(
        'Excel gerado',
        `${records.length} viagem(ns) do filtro atual foram exportadas com todos os CT-es e dados do lançamento.`,
      );
    } catch {
      notifications.error('Não foi possível exportar', 'Tente novamente em alguns instantes.');
    }
  }, [cteTypeFilter, notifications, records]);

  const handleDelete = useCallback(
    async (record: TravelRecordWithMetrics) => {
      const confirmed = await notifications.confirm({
        title: 'Inativar viagem?',
        message: `O CT-e ${record.cteNumber}, série ${record.cteSeries}, será retirada da listagem ativa, mas continuará salva no histórico.`,
        details: [
          `${record.origin} → ${record.destination}`,
          `Frete bruto: ${formatCurrency(record.grossFreight)}`,
        ],
        type: 'error',
        confirmLabel: 'Inativar viagem',
      });

      if (confirmed) await deleteRecord(record);
    },
    [deleteRecord, notifications],
  );

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistoryEvents(await travelService.history());
    } catch {
      notifications.error('Histórico indisponível', 'Não foi possível carregar o histórico de viagens.');
    } finally {
      setHistoryLoading(false);
    }
  }, [notifications]);

  const changeTab = useCallback((tab: 'records' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') void loadHistory();
  }, [loadHistory]);

  const restoreTravel = useCallback(async (id: number) => {
    const confirmed = await notifications.confirm({ title: 'Reativar viagem?', message: 'A viagem voltará para a listagem ativa.', type: 'info', confirmLabel: 'Reativar' });
    if (!confirmed) return;
    try {
      await travelService.restore(id);
      notifications.success('Viagem reativada', 'O registro voltou para a listagem ativa.');
      await loadHistory();
      window.location.reload();
    } catch {
      notifications.error('Não foi possível reativar', 'Tente novamente em alguns instantes.');
    }
  }, [loadHistory, notifications]);

  const formatHistoryDateTime = (value: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

  const hiddenMoney = '••••••';

  return (
    <>
      <ModuleTabs aria-label="Abas de viagens">
        <ModuleTab type="button" $active={activeTab === 'records'} onClick={() => changeTab('records')}>Viagens</ModuleTab>
        <ModuleTab type="button" $active={activeTab === 'history'} onClick={() => changeTab('history')}><History size={15} /> Histórico</ModuleTab>
      </ModuleTabs>
      {activeTab === 'records' ? <>
      <SummaryGrid aria-label="Resumo das viagens">
        <TravelSummaryCard label="Total de viagens" value={String(summary.totalTrips)} icon={Map} />
        <TravelSummaryCard
          label="Frete líquido"
          value={showFinancialValues ? formatCurrency(summary.totalNetFreight) : hiddenMoney}
          icon={CircleDollarSign}
        />
        <TravelSummaryCard
          label="Frete bruto"
          value={showFinancialValues ? formatCurrency(summary.totalGrossFreight) : hiddenMoney}
          icon={Banknote}
        />
        <TravelSummaryCard
          label="Diferença"
          value={showFinancialValues ? formatCurrency(summary.totalDifference) : hiddenMoney}
          icon={TrendingUp}
          breakdown={[
            { label: 'ICMS', value: showFinancialValues ? formatCurrency(summary.totalIcms) : hiddenMoney },
            { label: 'Seguro', value: showFinancialValues ? formatCurrency(summary.totalInsurance) : hiddenMoney },
            { label: 'Pedágio', value: showFinancialValues ? formatCurrency(summary.totalToll) : hiddenMoney },
          ]}
          action={
            <button
              type="button"
              onClick={() => setShowFinancialValues((visible) => !visible)}
              aria-label={showFinancialValues ? 'Ocultar valores financeiros' : 'Mostrar valores financeiros'}
              title={showFinancialValues ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {showFinancialValues ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />
      </SummaryGrid>

      <TravelFilters
        shipperFilter={shipperFilter}
        shipperOptions={shipperOptions}
        plateFilter={plateFilter}
        plateOptions={plateOptions}
        cteTypeFilter={cteTypeFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        searchTerm={searchTerm}
        onShipperFilterChange={(value) => resetPage(setShipperFilter, value)}
        onPlateFilterChange={(value) => resetPage(setPlateFilter, value)}
        onCteTypeFilterChange={(value) => resetPage(setCteTypeFilter, value)}
        onDateFromChange={(value) => resetPage(setDateFrom, value)}
        onDateToChange={(value) => resetPage(setDateTo, value)}
        onSearchChange={(value) => resetPage(setSearchTerm, value)}
      />

      <RecordsSection>
        <SectionHeader>
          <SectionTitle>Viagens registradas</SectionTitle>
          <SectionActions>
            <SectionMeta>
              {loading
                ? 'Carregando viagens...'
                : loadError
                  ? 'Não foi possível atualizar a listagem.'
                  : records.length === 0
                    ? 'Nenhum registro no filtro atual'
                    : `${firstVisibleRecord}-${lastVisibleRecord} de ${records.length} registro(s)`}
            </SectionMeta>
            <ExportButton
              type="button"
              onClick={handleExport}
              disabled={loading || records.length === 0}
              title="Exportar todas as informações das viagens exibidas no filtro atual"
            >
              <FileSpreadsheet size={17} aria-hidden="true" />
              Exportar Excel
            </ExportButton>
          </SectionActions>
        </SectionHeader>

        <RecordFilters aria-label="Filtros complementares de viagens">
          <RecordFilterField>
            <RecordFilterLabel htmlFor="travel-origin-state-filter">Estado de origem</RecordFilterLabel>
            <RecordFilterSelect
              id="travel-origin-state-filter"
              value={originStateFilter}
              onChange={(event) => resetPage(setOriginStateFilter, event.target.value)}
            >
              <option value="ALL">Todos os estados</option>
              {originStateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </RecordFilterSelect>
          </RecordFilterField>

          <RecordFilterField>
            <RecordFilterLabel htmlFor="travel-destination-state-filter">Estado de destino</RecordFilterLabel>
            <RecordFilterSelect
              id="travel-destination-state-filter"
              value={destinationStateFilter}
              onChange={(event) => resetPage(setDestinationStateFilter, event.target.value)}
            >
              <option value="ALL">Todos os estados</option>
              {destinationStateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </RecordFilterSelect>
          </RecordFilterField>

          <RecordFilterField>
            <RecordFilterLabel>Tipo de frete</RecordFilterLabel>
            <CheckboxMultiSelect
              value={freightTypeFilter}
              options={FREIGHT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              allLabel="Todos os tipos de frete"
              searchPlaceholder="Pesquisar tipo..."
              ariaLabel="Filtrar por um ou mais tipos de frete"
              onChange={(value) => resetPage(setFreightTypeFilter, value as TravelFreightType[])}
            />
          </RecordFilterField>

          <RecordFilterField>
            <RecordFilterLabel htmlFor="travel-cst-filter">CST</RecordFilterLabel>
            <RecordFilterSelect
              id="travel-cst-filter"
              value={cstFilter}
              onChange={(event) => resetPage(setCstFilter, event.target.value)}
            >
              <option value="ALL">Todas as CST</option>
              {CST_OPTIONS.map((cst) => (
                <option key={cst.value} value={cst.value}>{cst.label}</option>
              ))}
            </RecordFilterSelect>
          </RecordFilterField>
        </RecordFilters>

        <TravelTable
          records={paginatedRecords}
          loading={loading}
          deletingId={deletingId}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
        <TravelMobileList
          records={paginatedRecords}
          loading={loading}
          deletingId={deletingId}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />

        {!loading && records.length > 0 ? (
          <Pagination aria-label="Paginação de viagens">
            <PaginationSummary>
              <span>Itens por página</span>
              <PageSizeSelect
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Quantidade de viagens por página"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </PageSizeSelect>
            </PaginationSummary>

            <PaginationActions>
              <PageButton
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={visiblePage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </PageButton>

              <PageInfo>
                Página <strong>{visiblePage}</strong> de <strong>{totalPages}</strong>
              </PageInfo>

              <PageButton
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={visiblePage === totalPages}
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
              const ctes = Array.isArray(data.ctes) ? data.ctes as Array<Record<string, unknown>> : [];
              const cte = ctes.map((item) => String(item.cte_number ?? '')).filter(Boolean).join(' / ') || `#${event.travelId}`;
              const actionLabel = event.action === 'UPDATED' ? 'Editada' : event.action === 'DELETED' ? 'Inativada' : 'Reativada';
              return <HistoryCard key={event.id}>
                <HistoryItem><strong>{actionLabel}</strong>{formatHistoryDateTime(event.occurredAt)}</HistoryItem>
                <HistoryItem><strong>CT-e {cte}</strong>{String(data.plate ?? 'Sem placa')}</HistoryItem>
                <HistoryItem><strong>{event.userName || 'Usuário não informado'}</strong>{String(data.origin ?? '—')} → {String(data.destination ?? '—')}</HistoryItem>
                {event.action === 'DELETED' && event.inactive ? <RestoreButton type="button" onClick={() => void restoreTravel(event.travelId)}><RotateCcw size={14} /> Reativar</RestoreButton> : <span />}
              </HistoryCard>;
            })}
          </HistoryList>
        </RecordsSection>
      )}

      {activeTab === 'records' ? <FloatingAddButton onClick={handleOpenCreateModal} /> : null}

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

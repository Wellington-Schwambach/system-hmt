import { useCallback, useMemo, useState } from 'react';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileSpreadsheet,
  Map,
  TrendingUp,
} from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { FloatingAddButton } from './components/FloatingAddButton';
import { TravelFilters } from './components/TravelFilters';
import { TravelFormModal } from './components/TravelFormModal';
import { TravelMobileList } from './components/TravelMobileList';
import { TravelSummaryCard } from './components/TravelSummaryCard';
import { TravelTable } from './components/TravelTable';
import { useTravelRecords } from './hooks';
import {
  ExportButton,
  PageButton,
  PageInfo,
  PageSizeSelect,
  Pagination,
  PaginationActions,
  PaginationSummary,
  RecordsSection,
  SectionActions,
  SectionHeader,
  SectionMeta,
  SectionTitle,
  SummaryGrid,
} from './styles';
import type { TravelFormData, TravelRecordWithMetrics } from './types';
import { exportTravelsToExcel, formatCurrency } from './utils';

export function Travel() {
  const notifications = useNotifications();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TravelRecordWithMetrics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const {
    records,
    summary,
    options,
    shipperOptions,
    shipperFilter,
    plateFilter,
    cteTypeFilter,
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
        title: 'Excluir viagem?',
        message: `O CT-e ${record.cteNumber}, série ${record.cteSeries}, será removido permanentemente.`,
        details: [
          `${record.origin} → ${record.destination}`,
          `Frete bruto: ${formatCurrency(record.grossFreight)}`,
        ],
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

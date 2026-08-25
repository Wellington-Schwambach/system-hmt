import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Edit3, FileDown, Plus, Search, Sheet, Trash2, Truck } from 'lucide-react';

import { VEHICLE_STATUS_OPTIONS } from '../../constants';
import { formatDate, formatInteger, getVehicleTypeLabel } from '../../utils';
import type { VehicleListProps } from './types';
import {
  ActionButton,
  Actions,
  CodeValue,
  CreateButton,
  EmptyState,
  EmptyText,
  EmptyTitle,
  ExportButton,
  FilterSelect,
  Filters,
  ListCard,
  ListMeta,
  ListToolbar,
  MobileActionButton,
  MobileActions,
  MobileCard,
  MobileCardHeader,
  MobileGrid,
  MobileItem,
  MobileLabel,
  MobileList,
  MobilePlate,
  MobileType,
  MobileValue,
  MutedValue,
  PageButton,
  PageInfo,
  PageSizeSelect,
  Pagination,
  PaginationActions,
  PaginationSummary,
  SearchIcon,
  SearchInput,
  SearchShell,
  StrongValue,
  Table,
  TableWrapper,
  Td,
  Th,
  ToolbarActions,
} from './styles';

export function VehicleList({
  records,
  totalRecords,
  searchTerm,
  statusFilter,
  plateEndFilter,
  loading,
  deletingId,
  onSearchChange,
  onStatusFilterChange,
  onPlateEndFilterChange,
  onCreate,
  onEdit,
  onDelete,
  onDownloadCrlv,
  onExport,
}: VehicleListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (visiblePage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [pageSize, records, visiblePage]);
  const firstVisibleRecord = records.length === 0 ? 0 : (visiblePage - 1) * pageSize + 1;
  const lastVisibleRecord = Math.min(visiblePage * pageSize, records.length);

  return (
    <ListCard>
      <ListToolbar>
        <Filters>
          <SearchShell>
            <SearchIcon aria-hidden="true">
              <Search size={17} />
            </SearchIcon>
            <SearchInput
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setCurrentPage(1);
                onSearchChange(event.target.value);
              }}
              placeholder="Buscar por placa, frota, marca, modelo, RENAVAM ou chassi..."
              aria-label="Buscar veículos"
            />
          </SearchShell>

          <FilterSelect
            value={statusFilter}
            onChange={(event) => {
              setCurrentPage(1);
              onStatusFilterChange(event.target.value as VehicleListProps['statusFilter']);
            }}
            aria-label="Filtrar veículos por situação"
          >
            <option value="ALL">Todas as situações</option>
            {VEHICLE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={plateEndFilter}
            onChange={(event) => {
              setCurrentPage(1);
              onPlateEndFilterChange(event.target.value as VehicleListProps['plateEndFilter']);
            }}
            aria-label="Filtrar veículos pelo final da placa"
          >
            <option value="ALL">Todos os finais</option>
            {Array.from({ length: 10 }, (_, digit) => (
              <option key={digit} value={String(digit)}>
                Final {digit}
              </option>
            ))}
          </FilterSelect>
        </Filters>

        <ToolbarActions>
          <ExportButton type="button" onClick={onExport} disabled={records.length === 0 || loading}>
            <Sheet size={18} aria-hidden="true" />
            Exportar Excel
          </ExportButton>
          <CreateButton type="button" onClick={onCreate}>
            <Plus size={18} aria-hidden="true" />
            Novo veículo
          </CreateButton>
        </ToolbarActions>
      </ListToolbar>

      <ListMeta>
        <span>
          {loading
            ? 'Carregando veículos...'
            : records.length === 0
              ? 'Nenhum veículo no filtro atual'
              : `${firstVisibleRecord}-${lastVisibleRecord} de ${records.length} veículo(s) no filtro atual`}
        </span>
        <span>{totalRecords} cadastrado(s) no total</span>
      </ListMeta>

      {!loading && records.length === 0 ? (
        <EmptyState>
          <Truck size={38} aria-hidden="true" />
          <EmptyTitle>Nenhum veículo encontrado</EmptyTitle>
          <EmptyText>
            Ajuste a pesquisa ou cadastre um novo veículo para começar a organizar a frota.
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>N° Frota</Th>
                  <Th>Placa</Th>
                  <Th>Tipo</Th>
                  <Th>KM atual</Th>
                  <Th>Vencimento Opentech</Th>
                  <Th>Vencimento Angellira</Th>
                  <Th>Ano</Th>
                  <Th>RENAVAM</Th>
                  <Th>Chassi</Th>
                  <Th>Licenciamento</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => (
                  <tr key={record.id}>
                    <Td>
                      {record.fleetNumber ? (
                        <StrongValue>{record.fleetNumber}</StrongValue>
                      ) : (
                        <MutedValue>Não informado</MutedValue>
                      )}
                    </Td>
                    <Td>
                      <StrongValue>{record.plate}</StrongValue>
                    </Td>
                    <Td>{getVehicleTypeLabel(record.type)}</Td>
                    <Td>{formatInteger(record.currentKm)} km</Td>
                    <Td>{formatDate(record.opentechExpiryDate)}</Td>
                    <Td>{formatDate(record.angelliraExpiryDate)}</Td>
                    <Td>
                      {record.manufactureYear}/{record.modelYear}
                    </Td>
                    <Td>
                      {record.renavam ? (
                        <CodeValue>{record.renavam}</CodeValue>
                      ) : (
                        <MutedValue>Não informado</MutedValue>
                      )}
                    </Td>
                    <Td>
                      {record.chassis ? (
                        <CodeValue>{record.chassis}</CodeValue>
                      ) : (
                        <MutedValue>Não informado</MutedValue>
                      )}
                    </Td>
                    <Td>{formatDate(record.licensingExpiryDate)}</Td>
                    <Td>
                      <Actions>
                        <ActionButton
                          $document
                          type="button"
                          disabled={!record.crlv}
                          onClick={() => onDownloadCrlv(record)}
                          aria-label={`Baixar CRLV de ${record.plate}`}
                          title={record.crlv ? `Baixar ${record.crlv.name}` : 'CRLV não anexado'}
                        >
                          <FileDown size={16} aria-hidden="true" />
                        </ActionButton>
                        <ActionButton
                          type="button"
                          onClick={() => onEdit(record)}
                          aria-label={`Editar ${record.plate}`}
                        >
                          <Edit3 size={16} aria-hidden="true" />
                        </ActionButton>
                        <ActionButton
                          $danger
                          type="button"
                          disabled={deletingId === record.id}
                          onClick={() => onDelete(record)}
                          aria-label={`Excluir ${record.plate}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </ActionButton>
                      </Actions>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          <MobileList>
            {paginatedRecords.map((record) => (
              <MobileCard key={record.id}>
                <MobileCardHeader>
                  <div>
                    <MobilePlate>{record.plate}</MobilePlate>
                    <MobileValue>{record.fleetNumber || 'Sem número de frota'}</MobileValue>
                  </div>
                  <MobileType>{getVehicleTypeLabel(record.type)}</MobileType>
                </MobileCardHeader>

                <MobileGrid>
                  <MobileItem>
                    <MobileLabel>KM atual</MobileLabel>
                    <MobileValue>{formatInteger(record.currentKm)} km</MobileValue>
                  </MobileItem>
                  <MobileItem>
                    <MobileLabel>Ano</MobileLabel>
                    <MobileValue>
                      {record.manufactureYear}/{record.modelYear}
                    </MobileValue>
                  </MobileItem>
                  <MobileItem>
                    <MobileLabel>Opentech</MobileLabel>
                    <MobileValue>{formatDate(record.opentechExpiryDate)}</MobileValue>
                  </MobileItem>
                  <MobileItem>
                    <MobileLabel>Angellira</MobileLabel>
                    <MobileValue>{formatDate(record.angelliraExpiryDate)}</MobileValue>
                  </MobileItem>
                  <MobileItem>
                    <MobileLabel>RENAVAM</MobileLabel>
                    <MobileValue>{record.renavam || 'Não informado'}</MobileValue>
                  </MobileItem>
                  <MobileItem>
                    <MobileLabel>Licenciamento</MobileLabel>
                    <MobileValue>{formatDate(record.licensingExpiryDate)}</MobileValue>
                  </MobileItem>
                </MobileGrid>

                <MobileActions>
                  <MobileActionButton
                    $document
                    type="button"
                    disabled={!record.crlv}
                    onClick={() => onDownloadCrlv(record)}
                  >
                    <Download size={15} aria-hidden="true" /> CRLV
                  </MobileActionButton>
                  <MobileActionButton type="button" onClick={() => onEdit(record)}>
                    <Edit3 size={15} aria-hidden="true" /> Editar
                  </MobileActionButton>
                  <MobileActionButton
                    $danger
                    type="button"
                    disabled={deletingId === record.id}
                    onClick={() => onDelete(record)}
                  >
                    <Trash2 size={15} aria-hidden="true" /> Excluir
                  </MobileActionButton>
                </MobileActions>
              </MobileCard>
            ))}
          </MobileList>

          <Pagination aria-label="Paginação de veículos">
            <PaginationSummary>
              <span>Itens por página</span>
              <PageSizeSelect
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Quantidade de veículos por página"
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
        </>
      )}
    </ListCard>
  );
}

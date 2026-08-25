import { useMemo, useState } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

import { EMPLOYEE_STATUS_OPTIONS } from '../../constants';
import type { EmployeeDocumentType } from '../../types';
import {
  calculateTenure,
  formatCpf,
  formatDate,
} from '../../utils';
import { EmployeeStatusBadge } from '../EmployeeStatusBadge';
import type { EmployeeListProps } from './types';
import {
  ActionButton,
  Actions,
  CreateButton,
  DocumentButton,
  DocumentButtons,
  EmptyState,
  EmptyText,
  EmptyTitle,
  EmployeeDetail,
  EmployeeMain,
  EmployeeName,
  ExportButton,
  Filters,
  FilterSelect,
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
  MobileName,
  MobileValue,
  PageButton,
  PageInfo,
  PageSizeSelect,
  Pagination,
  PaginationActions,
  PaginationSummary,
  SearchIcon,
  SearchInput,
  SearchShell,
  Table,
  TableWrapper,
  Td,
  Th,
  ToolbarActions,
} from './styles';

const documentLabels: Array<{ type: EmployeeDocumentType; label: string }> = [
  { type: 'cnh', label: 'CNH' },
  { type: 'aso', label: 'ASO' },
  { type: 'toxicological', label: 'TOX' },
  { type: 'registrationForm', label: 'Ficha' },
];

export function EmployeeList({
  records,
  totalRecords,
  searchTerm,
  statusFilter,
  loading,
  deletingId,
  onSearchChange,
  onStatusFilterChange,
  onCreate,
  onEdit,
  onDelete,
  onDownloadDocument,
  onExport,
}: EmployeeListProps) {
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
            <SearchIcon aria-hidden="true"><Search size={17} /></SearchIcon>
            <SearchInput
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setCurrentPage(1);
                onSearchChange(event.target.value);
              }}
              placeholder="Buscar por nome, CPF, matrícula, cargo, e-mail ou CNH..."
              aria-label="Buscar colaboradores"
            />
          </SearchShell>

          <FilterSelect
            value={statusFilter}
            onChange={(event) => {
              setCurrentPage(1);
              onStatusFilterChange(event.target.value as EmployeeListProps['statusFilter']);
            }}
            aria-label="Filtrar colaboradores por situação"
          >
            {EMPLOYEE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === 'ACTIVE'
                  ? 'Ativos'
                  : option.value === 'INACTIVE'
                    ? 'Inativos'
                    : 'Afastados'}
              </option>
            ))}
            <option value="ALL">Todos os colaboradores</option>
          </FilterSelect>
        </Filters>

        <ToolbarActions>
          <ExportButton type="button" onClick={onExport} disabled={records.length === 0}>
            <FileSpreadsheet size={18} /> Exportar filtro
          </ExportButton>
          <CreateButton type="button" onClick={onCreate}>
            <Plus size={18} /> Novo colaborador
          </CreateButton>
        </ToolbarActions>
      </ListToolbar>

      <ListMeta>
        <span>
          {records.length === 0
            ? 'Nenhum colaborador no filtro atual'
            : `${firstVisibleRecord}-${lastVisibleRecord} de ${records.length} colaborador(es) no filtro atual`}
        </span>
        <span>{totalRecords} cadastrado(s) no total</span>
      </ListMeta>

      {loading ? (
        <EmptyState>
          <Users size={38} />
          <EmptyTitle>Carregando colaboradores</EmptyTitle>
          <EmptyText>Consultando os dados no PostgreSQL.</EmptyText>
        </EmptyState>
      ) : records.length === 0 ? (
        <EmptyState>
          <Users size={38} />
          <EmptyTitle>Nenhum colaborador encontrado</EmptyTitle>
          <EmptyText>Ajuste o filtro ou cadastre um novo colaborador.</EmptyText>
        </EmptyState>
      ) : (
        <>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Matrícula</Th>
                  <Th>Nome</Th>
                  <Th>Status</Th>
                  <Th>CPF</Th>
                  <Th>Data de nascimento</Th>
                  <Th>Vencimento ASO</Th>
                  <Th>Vencimento Opentech</Th>
                  <Th>Vencimento Angellira</Th>
                  <Th>Vencimento Toxicológico</Th>
                  <Th>Tempo de empresa</Th>
                  <Th>Anexos</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => (
                  <tr key={record.id}>
                    <Td>{record.employeeCode}</Td>
                    <Td>
                      <EmployeeMain>
                        <EmployeeName>{record.fullName}</EmployeeName>
                      </EmployeeMain>
                    </Td>
                    <Td><EmployeeStatusBadge status={record.status} /></Td>
                    <Td>{formatCpf(record.cpf)}</Td>
                    <Td>{formatDate(record.birthDate)}</Td>
                    <Td>{formatDate(record.asoExpiryDate)}</Td>
                    <Td>{formatDate(record.opentechExpiryDate)}</Td>
                    <Td>{formatDate(record.angelliraExpiryDate)}</Td>
                    <Td>{formatDate(record.toxicologicalExpiryDate)}</Td>
                    <Td>{calculateTenure(record.admissionDate, record.terminationDate)}</Td>
                    <Td>
                      <DocumentButtons>
                        {documentLabels.map(({ type, label }) =>
                          record.documents[type] ? (
                            <DocumentButton
                              key={type}
                              type="button"
                              onClick={() => onDownloadDocument(record, type)}
                              title={`Baixar ${label}`}
                            >
                              <Download size={12} /> {label}
                            </DocumentButton>
                          ) : null,
                        )}
                        {Object.values(record.documents).every((document) => document === null)
                          ? 'Sem anexos'
                          : null}
                      </DocumentButtons>
                    </Td>
                    <Td>
                      <Actions>
                        <ActionButton
                          type="button"
                          onClick={() => onEdit(record)}
                          aria-label={`Editar ${record.fullName}`}
                        >
                          <Edit3 size={16} />
                        </ActionButton>
                        <ActionButton
                          $danger
                          type="button"
                          disabled={deletingId === record.id}
                          onClick={() => onDelete(record)}
                          aria-label={`Excluir ${record.fullName}`}
                        >
                          <Trash2 size={16} />
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
                    <MobileName>{record.fullName}</MobileName>
                    <EmployeeDetail>{record.employeeCode} · {record.jobTitle}</EmployeeDetail>
                  </div>
                  <EmployeeStatusBadge status={record.status} />
                </MobileCardHeader>

                <MobileGrid>
                  <MobileItem><MobileLabel>CPF</MobileLabel><MobileValue>{formatCpf(record.cpf)}</MobileValue></MobileItem>
                  <MobileItem><MobileLabel>Nascimento</MobileLabel><MobileValue>{formatDate(record.birthDate)}</MobileValue></MobileItem>
                  <MobileItem><MobileLabel>ASO</MobileLabel><MobileValue>{formatDate(record.asoExpiryDate)}</MobileValue></MobileItem>
                  <MobileItem><MobileLabel>Opentech</MobileLabel><MobileValue>{formatDate(record.opentechExpiryDate)}</MobileValue></MobileItem>
                  <MobileItem><MobileLabel>Angellira</MobileLabel><MobileValue>{formatDate(record.angelliraExpiryDate)}</MobileValue></MobileItem>
                  <MobileItem><MobileLabel>Toxicológico</MobileLabel><MobileValue>{formatDate(record.toxicologicalExpiryDate)}</MobileValue></MobileItem>
                  <MobileItem><MobileLabel>Tempo de empresa</MobileLabel><MobileValue>{calculateTenure(record.admissionDate, record.terminationDate)}</MobileValue></MobileItem>
                </MobileGrid>

                <DocumentButtons>
                  {documentLabels.map(({ type, label }) =>
                    record.documents[type] ? (
                      <DocumentButton key={type} type="button" onClick={() => onDownloadDocument(record, type)}>
                        <Download size={12} /> {label}
                      </DocumentButton>
                    ) : null,
                  )}
                </DocumentButtons>

                <MobileActions>
                  <MobileActionButton type="button" onClick={() => onEdit(record)}>
                    <Edit3 size={15} /> Editar
                  </MobileActionButton>
                  <MobileActionButton
                    $danger
                    type="button"
                    disabled={deletingId === record.id}
                    onClick={() => onDelete(record)}
                  >
                    <Trash2 size={15} /> Excluir
                  </MobileActionButton>
                </MobileActions>
              </MobileCard>
            ))}
          </MobileList>

          <Pagination aria-label="Paginação de colaboradores">
            <PaginationSummary>
              <span>Itens por página</span>
              <PageSizeSelect
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Quantidade de colaboradores por página"
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

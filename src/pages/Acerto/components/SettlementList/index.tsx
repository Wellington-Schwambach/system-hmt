import { useMemo, useState } from 'react';
import { Eye, Pencil, Printer, Search, Trash2 } from 'lucide-react';

import { formatCurrency, formatDate } from '../../utils';
import type { SettlementListProps } from './types';
import {
  ActionButton,
  Actions,
  Card,
  DriverCell,
  DriverInlineActions,
  DriverName,
  EmptyState,
  Header,
  IconActionButton,
  MobileCard,
  MobileGrid,
  MobileHeader,
  MobileLabel,
  MobileList,
  MobileValue,
  Scroll,
  SearchIcon,
  SearchInput,
  SearchWrapper,
  Table,
  TD,
  TH,
  Title,
} from './styles';

export function SettlementList({
  settlements,
  onView,
  onPrint,
  onEdit,
  onDelete,
}: SettlementListProps) {
  const [search, setSearch] = useState('');

  const filteredSettlements = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedSearch) {
      return settlements;
    }

    return settlements.filter((settlement) =>
      settlement.driver.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
    );
  }, [search, settlements]);

  return (
    <Card>
      <Header>
        <div>
          <Title>Acertos realizados</Title>
          <span>{filteredSettlements.length} registro(s) encontrado(s)</span>
        </div>

        <SearchWrapper>
          <SearchIcon aria-hidden="true">
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por motorista"
            aria-label="Buscar acerto por motorista"
          />
        </SearchWrapper>
      </Header>

      {filteredSettlements.length === 0 ? (
        <EmptyState>
          {settlements.length === 0
            ? 'Nenhum acerto foi finalizado até o momento.'
            : 'Nenhum acerto corresponde à busca informada.'}
        </EmptyState>
      ) : (
        <>
          <Scroll>
            <Table>
              <thead>
                <tr>
                  <TH>Motorista</TH>
                  <TH>Período</TH>
                  <TH>Viagens</TH>
                  <TH>Fretes</TH>
                  <TH>Bônus</TH>
                  <TH>A receber</TH>
                  <TH>Finalizado em</TH>
                  <TH>Ações</TH>
                </tr>
              </thead>
              <tbody>
                {filteredSettlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <TD $strong>
                      <DriverCell>
                        <DriverName>{settlement.driver}</DriverName>
                        <DriverInlineActions>
                          <IconActionButton
                            type="button"
                            onClick={() => onEdit(settlement)}
                            aria-label={`Editar acerto de ${settlement.driver}`}
                            title="Editar acerto"
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </IconActionButton>
                          <IconActionButton
                            type="button"
                            $danger
                            onClick={() => onDelete(settlement)}
                            aria-label={`Excluir acerto de ${settlement.driver}`}
                            title="Excluir acerto"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </IconActionButton>
                        </DriverInlineActions>
                      </DriverCell>
                    </TD>
                    <TD>
                      {formatDate(settlement.startDate)} a {formatDate(settlement.endDate)}
                    </TD>
                    <TD>{settlement.travels.length}</TD>
                    <TD $numeric>{formatCurrency(settlement.totals.totalNetFreight)}</TD>
                    <TD $numeric>{settlement.totals.bonusPercent}%</TD>
                    <TD $numeric $highlight>
                      {formatCurrency(settlement.totals.totalReceivable)}
                    </TD>
                    <TD>{formatDate(settlement.savedAt.slice(0, 10))}</TD>
                    <TD>
                      <Actions>
                        <ActionButton type="button" onClick={() => onView(settlement)}>
                          <Eye size={14} aria-hidden="true" />
                          Visualizar
                        </ActionButton>
                        <ActionButton
                          type="button"
                          $primary
                          onClick={() => onPrint(settlement)}
                        >
                          <Printer size={14} aria-hidden="true" />
                          Imprimir / PDF
                        </ActionButton>
                      </Actions>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Scroll>

          <MobileList>
            {filteredSettlements.map((settlement) => (
              <MobileCard key={settlement.id}>
                <MobileHeader>
                  <div>
                    <strong>{settlement.driver}</strong>
                    <span>
                      {formatDate(settlement.startDate)} a {formatDate(settlement.endDate)}
                    </span>
                  </div>
                  <DriverInlineActions>
                    <IconActionButton
                      type="button"
                      onClick={() => onEdit(settlement)}
                      aria-label={`Editar acerto de ${settlement.driver}`}
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </IconActionButton>
                    <IconActionButton
                      type="button"
                      $danger
                      onClick={() => onDelete(settlement)}
                      aria-label={`Excluir acerto de ${settlement.driver}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </IconActionButton>
                  </DriverInlineActions>
                </MobileHeader>

                <MobileGrid>
                  <div>
                    <MobileLabel>Viagens</MobileLabel>
                    <MobileValue>{settlement.travels.length}</MobileValue>
                  </div>
                  <div>
                    <MobileLabel>Fretes</MobileLabel>
                    <MobileValue>{formatCurrency(settlement.totals.totalNetFreight)}</MobileValue>
                  </div>
                  <div>
                    <MobileLabel>Bônus</MobileLabel>
                    <MobileValue>{settlement.totals.bonusPercent}%</MobileValue>
                  </div>
                  <div>
                    <MobileLabel>A receber</MobileLabel>
                    <MobileValue $highlight>
                      {formatCurrency(settlement.totals.totalReceivable)}
                    </MobileValue>
                  </div>
                </MobileGrid>

                <Actions>
                  <ActionButton type="button" onClick={() => onView(settlement)}>
                    <Eye size={14} aria-hidden="true" />
                    Visualizar
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $primary
                    onClick={() => onPrint(settlement)}
                  >
                    <Printer size={14} aria-hidden="true" />
                    Imprimir / PDF
                  </ActionButton>
                </Actions>
              </MobileCard>
            ))}
          </MobileList>
        </>
      )}
    </Card>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, Check, CircleDollarSign, Map as MapIcon, TrendingUp } from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorMessage } from '../../utils/apiError';
import { TravelSummaryCard } from '../Travel/components/TravelSummaryCard';
import { thirdPartyManagementService } from './services';
import {
  ClearButton,
  CompactSelect,
  DateField,
  Empty,
  ErrorBox,
  FilterField,
  Filters,
  GroupHeader,
  GroupHeaderRow,
  GroupStats,
  Header,
  InlineInput,
  Loading,
  Money,
  Page,
  PaidButton,
  Panel,
  RouteText,
  Select,
  Subtitle,
  SummaryGrid,
  Table,
  TableWrap,
  Title,
  TitleGroup,
} from './styles';
import type {
  ThirdPartyManagementDraft,
  ThirdPartyManagementRecord,
  ThirdPartyPaidFilter,
  ThirdPartyPaymentType,
} from './types';

function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNumber = String(month + 1).padStart(2, '0');
  const lastDay = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');
  return {
    from: `${year}-${monthNumber}-01`,
    to: `${year}-${monthNumber}-${lastDay}`,
  };
}

const CURRENT_MONTH = currentMonthRange();

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string): string {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function createDraft(record: ThirdPartyManagementRecord): ThirdPartyManagementDraft {
  return {
    paymentType: record.paymentType,
    counterFreightNumber: record.counterFreightNumber,
    payoutDate: record.payoutDate,
  };
}

export function ThirdPartyManagement() {
  const notifications = useNotifications();
  const [records, setRecords] = useState<ThirdPartyManagementRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<number, ThirdPartyManagementDraft>>({});
  const [thirdPartyFilter, setThirdPartyFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState(CURRENT_MONTH.from);
  const [dateTo, setDateTo] = useState(CURRENT_MONTH.to);
  const [paidFilter, setPaidFilter] = useState<ThirdPartyPaidFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    thirdPartyManagementService.list()
      .then((loaded) => {
        if (!active) return;
        setRecords(loaded);
        setDrafts(Object.fromEntries(loaded.map((record) => [record.id, createDraft(record)])));
      })
      .catch((loadError) => {
        if (!active) return;
        setError(getApiErrorMessage(loadError, 'Não foi possível carregar a Gestão de Terceiros.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const thirdPartyOptions = useMemo(
    () => [...new Set(records.map((record) => record.thirdPartyName))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [records],
  );

  const filtered = useMemo(() => records
    .filter((record) => {
      if (thirdPartyFilter !== 'ALL' && record.thirdPartyName !== thirdPartyFilter) return false;
      if (dateFrom && record.travelDate < dateFrom) return false;
      if (dateTo && record.travelDate > dateTo) return false;
      if (paidFilter === 'PAID' && !record.paid) return false;
      if (paidFilter === 'OPEN' && record.paid) return false;
      return true;
    })
    .sort((a, b) => {
      const thirdPartyComparison = a.thirdPartyName.localeCompare(b.thirdPartyName, 'pt-BR');
      if (thirdPartyComparison !== 0) return thirdPartyComparison;
      const dateComparison = a.travelDate.localeCompare(b.travelDate);
      return dateComparison !== 0 ? dateComparison : a.id - b.id;
    }), [dateFrom, dateTo, paidFilter, records, thirdPartyFilter]);

  const summary = useMemo(() => {
    const gross = filtered.reduce((total, record) => total + record.grossFreight, 0);
    const thirdParty = filtered.reduce((total, record) => total + record.payoutAmount, 0);
    return {
      trips: filtered.length,
      gross,
      thirdParty,
      difference: gross - thirdParty,
    };
  }, [filtered]);

  const groups = useMemo(() => {
    const grouped = new Map<string, ThirdPartyManagementRecord[]>();
    filtered.forEach((record) => {
      const current = grouped.get(record.thirdPartyName) ?? [];
      current.push(record);
      grouped.set(record.thirdPartyName, current);
    });
    return [...grouped.entries()];
  }, [filtered]);

  const updateRecordState = useCallback((updated: ThirdPartyManagementRecord) => {
    setRecords((current) => current.map((record) => (record.id === updated.id ? updated : record)));
    setDrafts((current) => ({ ...current, [updated.id]: createDraft(updated) }));
  }, []);

  async function persistRecord(record: ThirdPartyManagementRecord, patch: Partial<ThirdPartyManagementDraft> = {}) {
    const nextDraft = { ...(drafts[record.id] ?? createDraft(record)), ...patch };
    setDrafts((current) => ({ ...current, [record.id]: nextDraft }));
    setSavingId(record.id);
    try {
      const updated = await thirdPartyManagementService.update(record.id, nextDraft);
      updateRecordState(updated);
    } catch (saveError) {
      setDrafts((current) => ({ ...current, [record.id]: createDraft(record) }));
      notifications.error('Não foi possível salvar o repasse', getApiErrorMessage(saveError, 'Tente novamente.'));
    } finally {
      setSavingId(null);
    }
  }

  async function markPaid(record: ThirdPartyManagementRecord) {
    if (record.paid) return;

    const confirmed = await notifications.confirm({
      title: 'Marcar repasse como pago?',
      message: `${record.thirdPartyName} · ${record.cteNumbers || 'CT-e sem número'} · ${formatCurrency(record.payoutAmount)}.`,
      type: 'info',
      confirmLabel: 'Marcar pago',
    });
    if (!confirmed) return;

    setSavingId(record.id);
    try {
      const currentDraft = drafts[record.id] ?? createDraft(record);
      await thirdPartyManagementService.update(record.id, currentDraft);
      const updated = await thirdPartyManagementService.markPaid(record.id);
      updateRecordState(updated);
      notifications.success('Repasse pago', `${record.thirdPartyName} foi marcado como pago.`);
    } catch (saveError) {
      notifications.error('Não foi possível marcar como pago', getApiErrorMessage(saveError, 'Tente novamente.'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Page>
      <Header>
        <TitleGroup>
          <Title>Gestão de Terceiros</Title>
          <Subtitle>Controle financeiro das viagens realizadas por terceiros, sem alterar o cadastro de Viagens.</Subtitle>
        </TitleGroup>
      </Header>

      <SummaryGrid>
        <TravelSummaryCard label="Total de viagens" value={String(summary.trips)} icon={MapIcon} helper="Viagens terceirizadas no período" />
        <TravelSummaryCard label="Frete Henrique (Bruto)" value={formatCurrency(summary.gross)} icon={Banknote} helper="Frete bruto cobrado pela Henrique" />
        <TravelSummaryCard label="Frete terceiros" value={formatCurrency(summary.thirdParty)} icon={CircleDollarSign} helper="Total previsto de repasse aos terceiros" />
        <TravelSummaryCard label="Diferença" value={formatCurrency(summary.difference)} icon={TrendingUp} helper="Frete Henrique menos frete dos terceiros" />
      </SummaryGrid>

      <Panel>
        <Filters>
          <FilterField>
            <span>Terceiro</span>
            <Select value={thirdPartyFilter} onChange={(event) => setThirdPartyFilter(event.target.value)}>
              <option value="ALL">Todos os terceiros</option>
              {thirdPartyOptions.map((thirdParty) => <option key={thirdParty} value={thirdParty}>{thirdParty}</option>)}
            </Select>
          </FilterField>
          <FilterField>
            <span>De</span>
            <DateField type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </FilterField>
          <FilterField>
            <span>Até</span>
            <DateField type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </FilterField>
          <FilterField>
            <span>Pagamento</span>
            <Select value={paidFilter} onChange={(event) => setPaidFilter(event.target.value as ThirdPartyPaidFilter)}>
              <option value="ALL">Todos</option>
              <option value="OPEN">Não pagos</option>
              <option value="PAID">Pagos</option>
            </Select>
          </FilterField>
          <ClearButton type="button" onClick={() => {
            setThirdPartyFilter('ALL');
            setDateFrom('');
            setDateTo('');
            setPaidFilter('ALL');
          }}>Limpar filtros</ClearButton>
        </Filters>

        {loading ? <Loading>Carregando viagens de terceiros...</Loading> : error ? (
          <ErrorBox>{error}</ErrorBox>
        ) : groups.length === 0 ? (
          <Empty>Nenhuma viagem de terceiro encontrada para os filtros informados.</Empty>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nº CT-e</th>
                  <th>Origem</th>
                  <th>Adiantamento/Saldo</th>
                  <th>Valor de repasse</th>
                  <th>Nº Contra frete</th>
                  <th>Data do repasse</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(([thirdPartyName, groupRecords]) => {
                  const groupGross = groupRecords.reduce((total, record) => total + record.grossFreight, 0);
                  const groupPayout = groupRecords.reduce((total, record) => total + record.payoutAmount, 0);
                  return [
                    <GroupHeaderRow key={`group-${thirdPartyName}`}>
                      <td colSpan={8}>
                        <GroupHeader>
                          <strong>{thirdPartyName}</strong>
                          <GroupStats>
                            <span>{groupRecords.length} {groupRecords.length === 1 ? 'viagem' : 'viagens'}</span>
                            <span>Henrique: <strong>{formatCurrency(groupGross)}</strong></span>
                            <span>Terceiro: <strong>{formatCurrency(groupPayout)}</strong></span>
                            <span>Diferença: <strong>{formatCurrency(groupGross - groupPayout)}</strong></span>
                          </GroupStats>
                        </GroupHeader>
                      </td>
                    </GroupHeaderRow>,
                    ...groupRecords.map((record) => {
                      const draft = drafts[record.id] ?? createDraft(record);
                      const saving = savingId === record.id;
                      return (
                        <tr key={record.id}>
                          <td>{formatDate(record.travelDate)}</td>
                          <td title={record.cteNumbers}>{record.cteNumbers || '-'}</td>
                          <td title={`${record.origin} → ${record.destination}`}><RouteText>{record.origin}</RouteText></td>
                          <td>
                            <CompactSelect
                              value={draft.paymentType}
                              disabled={saving}
                              onChange={(event) => void persistRecord(record, { paymentType: event.target.value as ThirdPartyPaymentType })}
                            >
                              <option value="">Selecione...</option>
                              <option value="ADVANCE">Adiantamento</option>
                              <option value="BALANCE">Saldo</option>
                            </CompactSelect>
                          </td>
                          <td><Money>{formatCurrency(record.payoutAmount)}</Money></td>
                          <td>
                            <InlineInput
                              value={draft.counterFreightNumber}
                              disabled={saving}
                              placeholder="Nº contra frete"
                              onChange={(event) => setDrafts((current) => ({
                                ...current,
                                [record.id]: { ...draft, counterFreightNumber: event.target.value },
                              }))}
                              onBlur={() => void persistRecord(record)}
                            />
                          </td>
                          <td>
                            <InlineInput
                              type="date"
                              value={draft.payoutDate}
                              disabled={saving}
                              onChange={(event) => void persistRecord(record, { payoutDate: event.target.value })}
                            />
                          </td>
                          <td>
                            <PaidButton
                              type="button"
                              $paid={record.paid}
                              disabled={saving || record.paid}
                              onClick={() => void markPaid(record)}
                              title={record.paid ? `Pago${record.paidAt ? ` em ${new Date(record.paidAt).toLocaleString('pt-BR')}` : ''}` : 'Marcar como pago'}
                            >
                              <Check size={14} /> {record.paid ? 'Pago' : 'Marcar pago'}
                            </PaidButton>
                          </td>
                        </tr>
                      );
                    }),
                  ];
                })}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Panel>
    </Page>
  );
}

import { RefreshCw } from 'lucide-react';

import { formatCurrency, formatDate } from '../../utils';
import type { SettlementHistoryEvent } from '../../types';
import type { SettlementHistoryProps } from './types';
import { Badge, Card, Empty, Header, RefreshButton, Scroll, Table } from './styles';

const ACTION_LABELS: Record<SettlementHistoryEvent['action'], string> = {
  CREATED: 'Gravado',
  UPDATED: 'Editado',
  DELETED: 'Excluído',
};

function eventData(event: SettlementHistoryEvent) {
  const source = event.after ?? event.before ?? {};
  const nestedSnapshot =
    source.snapshot && typeof source.snapshot === 'object'
      ? (source.snapshot as Record<string, unknown>)
      : {};
  const totals =
    nestedSnapshot.totals && typeof nestedSnapshot.totals === 'object'
      ? (nestedSnapshot.totals as Record<string, unknown>)
      : {};

  return {
    driver: String(source.driver ?? nestedSnapshot.driver ?? '-'),
    startDate: String(source.start_date ?? nestedSnapshot.startDate ?? ''),
    endDate: String(source.end_date ?? nestedSnapshot.endDate ?? ''),
    totalReceivable: Number(totals.totalReceivable ?? 0),
  };
}

export function SettlementHistory({ events, loading, onRefresh }: SettlementHistoryProps) {
  return (
    <Card>
      <Header>
        <div>
          <strong>Histórico dos acertos</strong>
          <span>Auditoria de gravações, edições e exclusões. Visível somente para administrador.</span>
        </div>
        <RefreshButton type="button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} aria-hidden="true" />
          Atualizar
        </RefreshButton>
      </Header>

      {events.length === 0 ? (
        <Empty>{loading ? 'Carregando histórico...' : 'Nenhuma alteração registrada.'}</Empty>
      ) : (
        <Scroll>
          <Table>
            <thead>
              <tr>
                <th>Ação</th>
                <th>Acerto</th>
                <th>Motorista</th>
                <th>Período</th>
                <th>Total</th>
                <th>Usuário</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const data = eventData(event);
                return (
                  <tr key={event.id}>
                    <td>
                      <Badge $action={event.action}>{ACTION_LABELS[event.action]}</Badge>
                    </td>
                    <td>#{event.settlementId}</td>
                    <td>{data.driver}</td>
                    <td>
                      {formatDate(data.startDate)} a {formatDate(data.endDate)}
                    </td>
                    <td>{formatCurrency(data.totalReceivable)}</td>
                    <td>{event.userName || '-'}</td>
                    <td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(event.occurredAt))}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Scroll>
      )}
    </Card>
  );
}

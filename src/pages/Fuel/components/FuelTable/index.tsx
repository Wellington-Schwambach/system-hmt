import { Check, CircleCheckBig, Pencil, Trash2 } from 'lucide-react';

import { FuelStatusBadge } from '../FuelStatusBadge';
import type { FuelTableProps } from './types';
import {
  ActionsCell,
  ActionsGroup,
  DeleteButton,
  EditButton,
  EmptyState,
  InvoiceButton,
  InvoicedLabel,
  NumericCell,
  Table,
  TableCard,
  TableScroll,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from './styles';
import { formatCurrency, formatDate, formatDecimal, formatInteger } from '../../utils';

export function FuelTable({ records, deletingId, invoicingKey, onEdit, onInvoice, onDelete }: FuelTableProps) {
  if (records.length === 0) {
    return <EmptyState>Nenhum abastecimento encontrado para os filtros atuais.</EmptyState>;
  }

  return (
    <TableCard>
      <TableScroll>
        <Table>
          <THead>
            <tr>
              <TH>Data</TH>
              <TH>Placa</TH>
              <TH>Posto</TH>
              <TH>KM</TH>
              <TH>Litros Diesel</TH>
              <TH>Média</TH>
              <TH>Valor Diesel</TH>
              <TH>Faturar Diesel</TH>
              <TH>Valor Arla</TH>
              <TH>Faturar Arla</TH>
              <TH>Motorista</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </tr>
          </THead>

          <TBody>
            {records.map((record) => (
              <TR key={record.id}>
                <TD>{formatDate(record.date)}</TD>
                <TD>{record.plate}</TD>
                <TD>{record.station}</TD>
                <NumericCell>{record.km !== null && record.km > 0 ? formatInteger(record.km) : '—'}</NumericCell>
                <NumericCell>{formatDecimal(record.dieselLiters)} L</NumericCell>
                <NumericCell>
                  {record.dieselAverage === null
                    ? '—'
                    : `${formatDecimal(record.dieselAverage)} km/L`}
                </NumericCell>
                <NumericCell>{formatCurrency(record.dieselTotalValue)}</NumericCell>
                <TD>
                  {record.dieselInvoiced ? (
                    <InvoicedLabel><Check size={14} /> Faturado</InvoicedLabel>
                  ) : (
                    <InvoiceButton
                      type="button"
                      onClick={() => onInvoice(record, 'DIESEL')}
                      disabled={invoicingKey === `${record.id}:DIESEL`}
                      title="Faturar somente o Diesel"
                    >
                      <CircleCheckBig size={15} aria-hidden="true" />
                      Faturar
                    </InvoiceButton>
                  )}
                </TD>
                <NumericCell>
                  {record.arlaTotalValue > 0 ? formatCurrency(record.arlaTotalValue) : '—'}
                </NumericCell>
                <TD>
                  {record.arlaTotalValue <= 0 ? (
                    '—'
                  ) : record.arlaInvoiced ? (
                    <InvoicedLabel><Check size={14} /> Faturado</InvoicedLabel>
                  ) : (
                    <InvoiceButton
                      type="button"
                      onClick={() => onInvoice(record, 'ARLA')}
                      disabled={invoicingKey === `${record.id}:ARLA`}
                      title="Faturar somente o Arla"
                    >
                      <CircleCheckBig size={15} aria-hidden="true" />
                      Faturar
                    </InvoiceButton>
                  )}
                </TD>
                <TD>{record.driver}</TD>
                <TD><FuelStatusBadge status={record.status} /></TD>
                <ActionsCell>
                  <ActionsGroup>
                    <EditButton
                      type="button"
                      onClick={() => onEdit(record)}
                      aria-label={`Editar abastecimento de ${formatDate(record.date)}`}
                      title="Editar abastecimento"
                    >
                      <Pencil size={16} aria-hidden="true" />
                      <span>Editar</span>
                    </EditButton>
                    <DeleteButton
                      type="button"
                      onClick={() => onDelete(record)}
                      disabled={deletingId === record.id}
                      aria-label={`Excluir abastecimento de ${formatDate(record.date)}`}
                      title="Excluir abastecimento"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </DeleteButton>
                  </ActionsGroup>
                </ActionsCell>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableScroll>
    </TableCard>
  );
}

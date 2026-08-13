import { CircleCheckBig, Pencil } from 'lucide-react';

import { FuelStatusBadge } from '../FuelStatusBadge';
import type { FuelTableProps } from './types';
import {
  ActionsCell,
  ActionsGroup,
  EditButton,
  EmptyState,
  InvoiceButton,
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

export function FuelTable({ records, onEdit, onInvoice }: FuelTableProps) {
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
              <TH>Diesel</TH>
              <TH>Média</TH>
              <TH>Diesel R$/L</TH>
              <TH>Arla</TH>
              <TH>Arla R$/L</TH>
              <TH>Valor total</TH>
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
                <NumericCell>{formatInteger(record.km)}</NumericCell>
                <NumericCell>{formatDecimal(record.dieselLiters)} L</NumericCell>
                <NumericCell>
                  {record.dieselAverage === null
                    ? '—'
                    : `${formatDecimal(record.dieselAverage)} km/L`}
                </NumericCell>
                <NumericCell>{formatCurrency(record.dieselValuePerLiter)}</NumericCell>
                <NumericCell>
                  {record.arlaLiters > 0 ? `${formatDecimal(record.arlaLiters)} L` : '—'}
                </NumericCell>
                <NumericCell>
                  {record.arlaValuePerLiter > 0 ? formatCurrency(record.arlaValuePerLiter) : '—'}
                </NumericCell>
                <NumericCell>{formatCurrency(record.totalValue)}</NumericCell>
                <TD>{record.driver}</TD>
                <TD>
                  <FuelStatusBadge status={record.status} />
                </TD>
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

                    {record.status === 'N' && (
                      <InvoiceButton
                        type="button"
                        onClick={() => onInvoice(record)}
                        aria-label={`Faturar abastecimento de ${formatDate(record.date)}`}
                        title="Marcar abastecimento como faturado"
                      >
                        <CircleCheckBig size={16} aria-hidden="true" />
                        <span>Faturar</span>
                      </InvoiceButton>
                    )}
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

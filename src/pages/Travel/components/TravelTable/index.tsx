import { Pencil, Trash2 } from 'lucide-react';

import { ShipperBadge } from '../ShipperBadge';
import type { TravelTableProps } from './types';
import {
  ActionsCell,
  DeleteButton,
  EditButton,
  EmptyState,
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
import { formatCurrency, formatDate } from '../../utils';

export function TravelTable({
  records,
  loading,
  deletingId,
  onEdit,
  onDelete,
}: TravelTableProps) {
  if (loading) {
    return <EmptyState>Carregando viagens...</EmptyState>;
  }

  if (records.length === 0) {
    return <EmptyState>Nenhuma viagem encontrada para os filtros atuais.</EmptyState>;
  }

  return (
    <TableCard>
      <TableScroll>
        <Table>
          <THead>
            <tr>
              <TH>Data</TH>
              <TH>Placa</TH>
              <TH>Origem</TH>
              <TH>Destino</TH>
              <TH>Frete líquido</TH>
              <TH>Frete bruto</TH>
              <TH>Nº CT-e</TH>
              <TH>Motorista</TH>
              <TH>Embarcador</TH>
              <TH>Data recebimento</TH>
              <TH>Ações</TH>
            </tr>
          </THead>

          <TBody>
            {records.map((record) => (
              <TR key={record.id}>
                <TD>{formatDate(record.date)}</TD>
                <TD>{record.plate}</TD>
                <TD title={record.origin}>{record.origin}</TD>
                <TD title={record.destination}>{record.destination}</TD>
                <NumericCell>{formatCurrency(record.netFreight)}</NumericCell>
                <NumericCell>{formatCurrency(record.grossFreight)}</NumericCell>
                <TD title={`Série: ${record.cteSeries}`}>{record.cteNumber}</TD>
                <TD title={record.driver || record.driverDisplay}>{record.driverDisplay}</TD>
                <TD>
                  <ShipperBadge shipper={record.shipper} color={record.shipperColor} />
                </TD>
                <TD>{record.receivedDate ? formatDate(record.receivedDate) : 'Pendente'}</TD>
                <ActionsCell>
                  <EditButton
                    type="button"
                    onClick={() => onEdit(record)}
                    aria-label={`Editar viagem do CT-e ${record.cteNumber}`}
                    title={`Editar CT-e ${record.cteNumber} · Série ${record.cteSeries}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                    <span>Editar</span>
                  </EditButton>
                  <DeleteButton
                    type="button"
                    onClick={() => onDelete(record)}
                    disabled={deletingId === record.id}
                    aria-label={`Excluir viagem do CT-e ${record.cteNumber}`}
                    title="Excluir viagem"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </DeleteButton>
                </ActionsCell>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableScroll>
    </TableCard>
  );
}

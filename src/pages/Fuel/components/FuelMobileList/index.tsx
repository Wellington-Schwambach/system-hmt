import { CircleCheckBig, Pencil, Trash2, Truck } from 'lucide-react';

import { FuelStatusBadge } from '../FuelStatusBadge';
import type { FuelMobileListProps } from './types';
import {
  Card,
  CardActions,
  CardHeader,
  DataGrid,
  DataItem,
  DataLabel,
  DataValue,
  DeleteButton,
  EditButton,
  EmptyState,
  InvoiceButton,
  List,
  Plate,
  Station,
} from './styles';
import { formatBillingMonth, formatCurrency, formatDate, formatDecimal, formatInteger } from '../../utils';

export function FuelMobileList({ records, deletingId, invoicingKey, onEdit, onInvoice, onDelete }: FuelMobileListProps) {
  if (records.length === 0) {
    return <EmptyState>Nenhum abastecimento encontrado.</EmptyState>;
  }

  return (
    <List>
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <div>
              <Station>{record.station}</Station>
              <Plate><Truck size={14} aria-hidden="true" />{record.plate}</Plate>
              <span>{formatDate(record.date)}</span>
            </div>
            <FuelStatusBadge status={record.status} />
          </CardHeader>

          <DataGrid>
            <DataItem><DataLabel>Mês faturado</DataLabel><DataValue>{formatBillingMonth(record.billingMonth)}</DataValue></DataItem>
            <DataItem><DataLabel>KM</DataLabel><DataValue>{record.km !== null && record.km > 0 ? formatInteger(record.km) : '—'}</DataValue></DataItem>
            <DataItem><DataLabel>Motorista</DataLabel><DataValue>{record.driver}</DataValue></DataItem>
            <DataItem><DataLabel>Litros Diesel</DataLabel><DataValue>{formatDecimal(record.dieselLiters)} L</DataValue></DataItem>
            <DataItem><DataLabel>Média</DataLabel><DataValue>{record.dieselAverage === null ? '—' : `${formatDecimal(record.dieselAverage)} km/L`}</DataValue></DataItem>
            <DataItem><DataLabel>Valor Diesel</DataLabel><DataValue>{formatCurrency(record.dieselTotalValue)}</DataValue></DataItem>
            <DataItem><DataLabel>Valor Arla</DataLabel><DataValue>{record.arlaTotalValue > 0 ? formatCurrency(record.arlaTotalValue) : '—'}</DataValue></DataItem>
          </DataGrid>

          <CardActions>
            {!record.dieselInvoiced && (
              <InvoiceButton type="button" onClick={() => onInvoice(record, 'DIESEL')} disabled={invoicingKey === `${record.id}:DIESEL`}>
                <CircleCheckBig size={16} aria-hidden="true" />
                Faturar Diesel
              </InvoiceButton>
            )}
            {record.arlaTotalValue > 0 && !record.arlaInvoiced && (
              <InvoiceButton type="button" onClick={() => onInvoice(record, 'ARLA')} disabled={invoicingKey === `${record.id}:ARLA`}>
                <CircleCheckBig size={16} aria-hidden="true" />
                Faturar Arla
              </InvoiceButton>
            )}
            <EditButton type="button" onClick={() => onEdit(record)}>
              <Pencil size={16} aria-hidden="true" />
              Editar
            </EditButton>
            <DeleteButton type="button" onClick={() => onDelete(record)} disabled={deletingId === record.id}>
              <Trash2 size={16} aria-hidden="true" />
              Excluir
            </DeleteButton>
          </CardActions>
        </Card>
      ))}
    </List>
  );
}

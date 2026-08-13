import { CircleCheckBig, Pencil, Truck } from 'lucide-react';

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
  EditButton,
  EmptyState,
  InvoiceButton,
  List,
  Plate,
  Station,
} from './styles';
import { formatCurrency, formatDate, formatDecimal, formatInteger } from '../../utils';

export function FuelMobileList({ records, onEdit, onInvoice }: FuelMobileListProps) {
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
              <Plate>
                <Truck size={14} aria-hidden="true" />
                {record.plate}
              </Plate>
              <span>{formatDate(record.date)}</span>
            </div>
            <FuelStatusBadge status={record.status} />
          </CardHeader>

          <DataGrid>
            <DataItem>
              <DataLabel>KM</DataLabel>
              <DataValue>{formatInteger(record.km)}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Motorista</DataLabel>
              <DataValue>{record.driver}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Diesel</DataLabel>
              <DataValue>{formatDecimal(record.dieselLiters)} L</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Diesel R$/L</DataLabel>
              <DataValue>{formatCurrency(record.dieselValuePerLiter)}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Média</DataLabel>
              <DataValue>
                {record.dieselAverage === null
                  ? '—'
                  : `${formatDecimal(record.dieselAverage)} km/L`}
              </DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Arla</DataLabel>
              <DataValue>
                {record.arlaLiters > 0 ? `${formatDecimal(record.arlaLiters)} L` : '—'}
              </DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Arla R$/L</DataLabel>
              <DataValue>
                {record.arlaValuePerLiter > 0 ? formatCurrency(record.arlaValuePerLiter) : '—'}
              </DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Valor total</DataLabel>
              <DataValue>{formatCurrency(record.totalValue)}</DataValue>
            </DataItem>
          </DataGrid>

          <CardActions>
            <EditButton type="button" onClick={() => onEdit(record)}>
              <Pencil size={16} aria-hidden="true" />
              Editar
            </EditButton>

            {record.status === 'N' && (
              <InvoiceButton type="button" onClick={() => onInvoice(record)}>
                <CircleCheckBig size={16} aria-hidden="true" />
                Faturar
              </InvoiceButton>
            )}
          </CardActions>
        </Card>
      ))}
    </List>
  );
}

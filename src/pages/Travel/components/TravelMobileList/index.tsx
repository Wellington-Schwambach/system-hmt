import { ArrowDown, FileText, Pencil, Trash2 } from 'lucide-react';

import { ShipperBadge } from '../ShipperBadge';
import type { TravelMobileListProps } from './types';
import {
  Card,
  CardActions,
  CardHeader,
  Cte,
  DataGrid,
  DataItem,
  DataLabel,
  DataValue,
  DeleteButton,
  EditButton,
  EmptyState,
  List,
  Route,
  RouteArrow,
  RoutePoint,
} from './styles';
import { formatCurrency, formatDate } from '../../utils';

export function TravelMobileList({
  records,
  loading,
  deletingId,
  onEdit,
  onDelete,
}: TravelMobileListProps) {
  if (loading) {
    return <EmptyState>Carregando viagens...</EmptyState>;
  }

  if (records.length === 0) {
    return <EmptyState>Nenhuma viagem encontrada.</EmptyState>;
  }

  return (
    <List>
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <div>
              <ShipperBadge shipper={record.shipper} />
              <Cte>
                <FileText size={14} aria-hidden="true" />
                CT-e {record.cteNumber} · Série {record.cteSeries}
              </Cte>
            </div>
            <span>{formatDate(record.date)}</span>
          </CardHeader>

          <Route>
            <RoutePoint>
              <small>Origem</small>
              <strong>{record.origin}</strong>
            </RoutePoint>
            <RouteArrow aria-hidden="true">
              <ArrowDown size={18} />
            </RouteArrow>
            <RoutePoint>
              <small>Destino</small>
              <strong>{record.destination}</strong>
            </RoutePoint>
          </Route>

          <DataGrid>
            <DataItem>
              <DataLabel>Placa</DataLabel>
              <DataValue>{record.plate}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Motorista</DataLabel>
              <DataValue>{record.driverDisplay}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Embarcador</DataLabel>
              <DataValue>{record.shipper}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Data de recebimento</DataLabel>
              <DataValue>{record.receivedDate ? formatDate(record.receivedDate) : 'Pendente'}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Frete líquido</DataLabel>
              <DataValue>{formatCurrency(record.netFreight)}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>Frete bruto</DataLabel>
              <DataValue>{formatCurrency(record.grossFreight)}</DataValue>
            </DataItem>
          </DataGrid>

          <CardActions>
            <EditButton type="button" onClick={() => onEdit(record)}>
              <Pencil size={16} aria-hidden="true" />
              Editar
            </EditButton>
            <DeleteButton
              type="button"
              onClick={() => onDelete(record)}
              disabled={deletingId === record.id}
            >
              <Trash2 size={16} aria-hidden="true" />
              {deletingId === record.id ? 'Excluindo...' : 'Excluir'}
            </DeleteButton>
          </CardActions>
        </Card>
      ))}
    </List>
  );
}

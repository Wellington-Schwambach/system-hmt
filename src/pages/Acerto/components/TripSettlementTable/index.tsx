import { ArrowRight } from 'lucide-react';

import { formatCurrency, formatDate } from '../../utils';
import type { TripSettlementTableProps } from './types';
import {
  Card,
  Count,
  EmptyState,
  Header,
  RouteText,
  Scroll,
  Table,
  TD,
  TH,
  Title,
  TotalRow,
  TotalValue,
  FreightValue,
} from './styles';

export function TripSettlementTable({ travels, totalOriginalNetFreight, totalNetFreight }: TripSettlementTableProps) {
  return (
    <Card>
      <Header>
        <Title>Viagens do período</Title>
        <Count aria-label={`${travels.length} viagens`}>{travels.length}</Count>
      </Header>

      {travels.length === 0 ? (
        <EmptyState>
          Nenhuma viagem foi encontrada para o motorista e período selecionados.
        </EmptyState>
      ) : (
        <Scroll>
          <Table>
            <thead>
              <tr>
                <TH>Data</TH>
                <TH>Nº CT-e</TH>
                <TH>Origem</TH>
                <TH>Destino</TH>
                <TH>Veículo</TH>
                <TH>Frete líquido</TH>
              </tr>
            </thead>
            <tbody>
              {travels.map((travel) => (
                <tr key={travel.id}>
                  <TD>{formatDate(travel.date)}</TD>
                  <TD>{travel.cteNumber}</TD>
                  <TD>
                    <RouteText>
                      <strong title={travel.origin}>{travel.origin}</strong>
                      <ArrowRight size={14} aria-hidden="true" />
                    </RouteText>
                  </TD>
                  <TD>
                    <strong title={travel.destination}>{travel.destination}</strong>
                  </TD>
                  <TD>{travel.plate}</TD>
                  <TD $numeric>
                    <FreightValue>
                      <strong>{formatCurrency(travel.originalNetFreight ?? travel.netFreight)}</strong>
                      {(travel.settlementCrewSize ?? 1) > 1 ? (
                        <small>No acerto: {formatCurrency(travel.settlementNetFreight ?? travel.netFreight)} · 50%</small>
                      ) : (
                        <small>No acerto: valor integral</small>
                      )}
                    </FreightValue>
                  </TD>
                </tr>
              ))}
            </tbody>
            <TotalRow>
              <tr>
                <td colSpan={4}>Total das viagens</td>
                <TotalValue>{formatCurrency(totalOriginalNetFreight)}</TotalValue>
                <TotalValue>
                  <span>{formatCurrency(totalNetFreight)}</span>
                  <small>considerado no acerto</small>
                </TotalValue>
              </tr>
            </TotalRow>
          </Table>
        </Scroll>
      )}
    </Card>
  );
}

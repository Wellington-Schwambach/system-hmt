import { Gauge, Truck } from 'lucide-react';

import { formatDecimal } from '../../utils';
import type { VehicleAverageSummaryProps } from './types';
import {
  Average,
  Card,
  EmptyState,
  Header,
  Info,
  Plate,
  SourceBadge,
  Title,
  VehicleList,
  VehicleRow,
} from './styles';

function getSourceLabel(source: 'PERIOD' | 'LATEST' | 'UNAVAILABLE'): string {
  if (source === 'PERIOD') {
    return 'Período';
  }

  if (source === 'LATEST') {
    return 'Última';
  }

  return 'Sem dados';
}

export function VehicleAverageSummary({ summaries }: VehicleAverageSummaryProps) {
  return (
    <Card>
      <Header>
        <Title>
          <Gauge size={17} aria-hidden="true" />
          Médias por veículo
        </Title>
        <span>{summaries.length}</span>
      </Header>

      {summaries.length === 0 ? (
        <EmptyState>As médias aparecem quando houver viagens.</EmptyState>
      ) : (
        <VehicleList>
          {summaries.map((summary) => (
            <VehicleRow key={summary.plate}>
              <Info>
                <Plate>
                  <Truck size={13} aria-hidden="true" />
                  {summary.plate}
                </Plate>
                <span>{summary.tripsCount} viagem(ns)</span>
              </Info>

              <Average>
                <strong>
                  {summary.averageKmPerLiter === null
                    ? '-'
                    : `${formatDecimal(summary.averageKmPerLiter)} km/L`}
                </strong>
                <SourceBadge $warning={summary.source !== 'PERIOD'}>
                  {getSourceLabel(summary.source)}
                </SourceBadge>
              </Average>
            </VehicleRow>
          ))}
        </VehicleList>
      )}
    </Card>
  );
}

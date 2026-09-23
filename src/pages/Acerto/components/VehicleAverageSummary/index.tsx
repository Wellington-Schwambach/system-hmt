import { useState } from 'react';
import { Fuel, Gauge, Truck } from 'lucide-react';

import { formatDecimal } from '../../utils';
import { FuelSelectionModal } from '../FuelSelectionModal';
import type { VehicleAverageSummaryProps } from './types';
import {
  Average,
  Card,
  EmptyState,
  Header,
  HeaderActions,
  Info,
  Plate,
  SelectionButton,
  SourceBadge,
  Title,
  VehicleList,
  VehicleRow,
} from './styles';

export function VehicleAverageSummary({
  summaries,
  fuelRecords,
  selectedFuelRecordIds,
  onToggleFuelRecord,
  onSelectPlate,
}: VehicleAverageSummaryProps) {
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const selectedIds = new Set(selectedFuelRecordIds);

  return (
    <>
      <Card>
        <Header>
          <Title>
            <Gauge size={17} aria-hidden="true" />
            Médias por veículo
          </Title>
          <HeaderActions>
            <span>{summaries.length}</span>
            <SelectionButton
              type="button"
              onClick={() => setIsFuelModalOpen(true)}
              disabled={fuelRecords.length === 0}
            >
              <Fuel size={14} aria-hidden="true" />
              Selecionar abastecidas
            </SelectionButton>
          </HeaderActions>
        </Header>

        {summaries.length === 0 ? (
          <EmptyState>As médias aparecem quando houver viagens ou abastecidas do motorista.</EmptyState>
        ) : (
          <VehicleList>
            {summaries.map((summary) => {
              const plateFuelings = fuelRecords.filter((record) => record.plate === summary.plate);
              const selectedOnPlate = plateFuelings.filter((record) => selectedIds.has(record.id)).length;

              return (
                <VehicleRow key={summary.plate}>
                  <Info>
                    <Plate>
                      <Truck size={13} aria-hidden="true" />
                      {summary.plate}
                    </Plate>
                    <span>
                      {summary.tripsCount} viagem(ns) · {selectedOnPlate}/{plateFuelings.length}{' '}
                      abastecida(s) selecionada(s)
                    </span>
                  </Info>

                  <Average>
                    <strong>
                      {summary.averageKmPerLiter === null
                        ? '-'
                        : `${formatDecimal(summary.averageKmPerLiter)} km/L`}
                    </strong>
                    <SourceBadge $warning={summary.source !== 'SELECTED'}>
                      {summary.source === 'SELECTED' ? 'Selecionadas' : 'Sem média'}
                    </SourceBadge>
                  </Average>
                </VehicleRow>
              );
            })}
          </VehicleList>
        )}
      </Card>

      <FuelSelectionModal
        isOpen={isFuelModalOpen}
        fuelRecords={fuelRecords}
        selectedFuelRecordIds={selectedFuelRecordIds}
        onToggleFuelRecord={onToggleFuelRecord}
        onSelectPlate={onSelectPlate}
        onClose={() => setIsFuelModalOpen(false)}
      />
    </>
  );
}

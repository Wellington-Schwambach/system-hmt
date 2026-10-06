import { useState } from 'react';
import { Fuel, Gauge, Truck } from 'lucide-react';

import { formatCurrency, formatDecimal } from '../../utils';
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
  onSelectGroup,
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
              const plateFuelings = fuelRecords.filter((record) => record.averageGroupKey === summary.groupKey);
              const selectedOnPlate = plateFuelings.filter((record) => selectedIds.has(record.id)).length;

              return (
                <VehicleRow key={summary.groupKey}>
                  <Info>
                    <Plate>
                      <Truck size={13} aria-hidden="true" />
                      {summary.label ?? summary.plate}
                    </Plate>
                    <span>
                      {summary.tripsCount} viagem(ns) · {selectedOnPlate}/{plateFuelings.length}{' '}
                      abastecida(s) selecionada(s)
                    </span>
                    <span>
                      {!summary.bonusCalculationVersion
                        ? 'Bonificação: regra antiga preservada neste acerto'
                        : summary.bonusEnabled
                          ? summary.bonusPercent && summary.bonusPercent > 0
                            ? `Bonificação: ${formatDecimal(summary.bonusPercent)}% sobre ${formatCurrency(summary.bonusBaseFreight ?? 0)} = ${formatCurrency(summary.bonusValue ?? 0)}${summary.bonusDisengagement ? ' · desengate' : summary.bonusProfileName ? ` · ${summary.bonusProfileName}` : ''}${(summary.bonusExtraPercent ?? 0) > 0 ? ` · +${formatDecimal(summary.bonusExtraPercent ?? 0)} p.p.` : ''}`
                            : 'Bonificação: sem percentual aplicável para esta média'
                          : 'Bonificação por média não ativa para esta placa'}
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
        onSelectGroup={onSelectGroup}
        onClose={() => setIsFuelModalOpen(false)}
      />
    </>
  );
}

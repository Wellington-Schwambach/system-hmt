import { useEffect, useMemo, useState } from 'react';
import { Check, Fuel, Truck, X } from 'lucide-react';

import { formatDate, formatDecimal } from '../../utils';
import type { FuelRecord } from '../../../Fuel/types';
import type { FuelSelectionModalProps } from './types';
import {
  Actions,
  CloseButton,
  EmptyState,
  Footer,
  Header,
  HeaderText,
  Metric,
  Metrics,
  Modal,
  Overlay,
  PlateButton,
  PlateTabs,
  RecordsHeader,
  SelectionCell,
  SelectionSummary,
  StatusDot,
  Table,
  TableScroller,
  Value,
} from './styles';

function hasValidAverage(record: FuelRecord): boolean {
  return (
    record.vehicleKmReference !== null &&
    record.km !== null &&
    record.distanceKm !== null &&
    record.distanceKm > 0 &&
    record.dieselLiters > 0
  );
}

function formatKm(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString('pt-BR')} km`;
}

interface PlateGroup {
  plate: string;
  records: FuelRecord[];
}

export function FuelSelectionModal({
  isOpen,
  fuelRecords,
  selectedFuelRecordIds,
  onToggleFuelRecord,
  onSelectPlate,
  onClose,
}: FuelSelectionModalProps) {
  const [activePlate, setActivePlate] = useState('');
  const selectedIds = useMemo(() => new Set(selectedFuelRecordIds), [selectedFuelRecordIds]);

  const groupedRecords = useMemo<PlateGroup[]>(() => {
    const groups = new Map<string, FuelRecord[]>();

    fuelRecords.forEach((record) => {
      const plate = record.plate || 'SEM PLACA';
      const current = groups.get(plate) ?? [];
      current.push(record);
      groups.set(plate, current);
    });

    return Array.from(groups.entries())
      .map(([plate, records]) => ({ plate, records }))
      .sort((firstGroup, secondGroup) =>
        firstGroup.plate.localeCompare(secondGroup.plate, 'pt-BR'),
      );
  }, [fuelRecords]);

  const validRecords = useMemo(() => fuelRecords.filter(hasValidAverage), [fuelRecords]);
  const selectedValidCount = validRecords.filter((record) => selectedIds.has(record.id)).length;

  const currentGroup =
    groupedRecords.find((group) => group.plate === activePlate) ?? groupedRecords[0] ?? null;

  const currentValidRecords = currentGroup?.records.filter(hasValidAverage) ?? [];
  const currentSelectedRecords = currentValidRecords.filter((record) => selectedIds.has(record.id));

  const selectedDistance = currentSelectedRecords.reduce(
    (total, record) => total + (record.distanceKm ?? 0),
    0,
  );
  const selectedLiters = currentSelectedRecords.reduce(
    (total, record) => total + record.dieselLiters,
    0,
  );
  const selectedAverage = selectedLiters > 0 ? selectedDistance / selectedLiters : null;

  const selectedKmInitial = currentSelectedRecords.length
    ? currentSelectedRecords.reduce<number | null>((lowest, record) => {
        if (record.vehicleKmReference === null) return lowest;
        return lowest === null ? record.vehicleKmReference : Math.min(lowest, record.vehicleKmReference);
      }, null)
    : null;

  const selectedKmFinal = currentSelectedRecords.length
    ? currentSelectedRecords.reduce<number | null>((highest, record) => {
        if (record.km === null) return highest;
        return highest === null ? record.km : Math.max(highest, record.km);
      }, null)
    : null;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay role="presentation" onMouseDown={onClose}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="fuel-selection-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <HeaderText>
            <div>
              <Fuel size={18} aria-hidden="true" />
              <h2 id="fuel-selection-modal-title">Abastecidas do motorista</h2>
            </div>
            <p>
              Selecione somente os abastecimentos que devem entrar no acerto. Quando houver troca
              de caminhão, cada placa mantém sua média separadamente.
            </p>
          </HeaderText>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar seleção de abastecidas">
            <X size={19} aria-hidden="true" />
          </CloseButton>
        </Header>

        <SelectionSummary>
          <span>
            <StatusDot />
            {selectedValidCount} de {validRecords.length} abastecida(s) selecionada(s)
          </span>
          <small>Escolha a placa e confira os dados antes de concluir.</small>
        </SelectionSummary>

        {fuelRecords.length === 0 ? (
          <EmptyState>Nenhuma abastecida deste motorista no período selecionado.</EmptyState>
        ) : (
          <>
            <PlateTabs role="tablist" aria-label="Caminhões utilizados pelo motorista">
              {groupedRecords.map((group) => {
                const valid = group.records.filter(hasValidAverage);
                const selected = valid.filter((record) => selectedIds.has(record.id)).length;
                const isActive = group.plate === currentGroup?.plate;

                return (
                  <button
                    key={group.plate}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-active={isActive || undefined}
                    onClick={() => setActivePlate(group.plate)}
                  >
                    <Truck size={14} aria-hidden="true" />
                    <span>{group.plate}</span>
                    <small>{selected}/{valid.length}</small>
                  </button>
                );
              })}
            </PlateTabs>

            {currentGroup && (
              <>
                <RecordsHeader>
                  <div>
                    <strong>{currentGroup.plate}</strong>
                    <span>
                      {currentSelectedRecords.length} de {currentValidRecords.length} abastecida(s)
                      selecionada(s)
                    </span>
                  </div>
                  <div>
                    <PlateButton
                      type="button"
                      onClick={() => onSelectPlate(currentGroup.plate, true)}
                      disabled={currentValidRecords.length === 0}
                    >
                      Selecionar todas
                    </PlateButton>
                    <PlateButton
                      type="button"
                      onClick={() => onSelectPlate(currentGroup.plate, false)}
                      disabled={currentSelectedRecords.length === 0}
                    >
                      Limpar
                    </PlateButton>
                  </div>
                </RecordsHeader>

                <Metrics>
                  <Metric>
                    <span>KM inicial</span>
                    <strong>{formatKm(selectedKmInitial)}</strong>
                  </Metric>
                  <Metric>
                    <span>KM final</span>
                    <strong>{formatKm(selectedKmFinal)}</strong>
                  </Metric>
                  <Metric>
                    <span>KM percorrido</span>
                    <strong>{formatKm(currentSelectedRecords.length ? selectedDistance : null)}</strong>
                  </Metric>
                  <Metric>
                    <span>Litros consumidos</span>
                    <strong>
                      {currentSelectedRecords.length ? `${formatDecimal(selectedLiters)} L` : '-'}
                    </strong>
                  </Metric>
                  <Metric $accent>
                    <span>Média</span>
                    <strong>
                      {selectedAverage === null ? '-' : `${formatDecimal(selectedAverage)} km/L`}
                    </strong>
                  </Metric>
                </Metrics>

                <TableScroller $scroll={(currentGroup?.records.length ?? 0) > 15}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Selecionar / Data</th>
                        <th>KM inicial</th>
                        <th>KM final</th>
                        <th>KM percorrido</th>
                        <th>Litros consumidos</th>
                        <th>Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGroup.records.map((record) => {
                        const selectable = hasValidAverage(record);
                        const isSelected = selectedIds.has(record.id);

                        return (
                          <tr key={record.id} data-disabled={!selectable || undefined}>
                            <td>
                              <SelectionCell $disabled={!selectable}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!selectable}
                                  onChange={() => onToggleFuelRecord(record.id)}
                                  aria-label={`Usar abastecida de ${formatDate(record.date)} do veículo ${currentGroup.plate}`}
                                />
                                <span>
                                  <strong>{formatDate(record.date)}</strong>
                                  {!selectable && <small>Sem média válida</small>}
                                </span>
                              </SelectionCell>
                            </td>
                            <td><Value>{formatKm(record.vehicleKmReference)}</Value></td>
                            <td><Value>{formatKm(record.km)}</Value></td>
                            <td><Value>{formatKm(record.distanceKm)}</Value></td>
                            <td><Value>{formatDecimal(record.dieselLiters)} L</Value></td>
                            <td>
                              <Value $accent={selectable}>
                                {selectable && record.dieselAverage !== null
                                  ? `${formatDecimal(record.dieselAverage)} km/L`
                                  : '-'}
                              </Value>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableScroller>
              </>
            )}
          </>
        )}

        <Footer>
          <span>A média do acerto é recalculada somente com os registros marcados.</span>
          <Actions>
            <button type="button" onClick={onClose}>
              <Check size={16} aria-hidden="true" />
              Concluir seleção
            </button>
          </Actions>
        </Footer>
      </Modal>
    </Overlay>
  );
}

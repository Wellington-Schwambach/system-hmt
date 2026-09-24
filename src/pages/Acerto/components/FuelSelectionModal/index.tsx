import { useEffect, useMemo, useState } from 'react';
import { Check, Fuel, Truck, X } from 'lucide-react';

import { formatDate, formatDecimal, formatMonth } from '../../utils';
import type { SettlementFuelRecord } from '../../types';
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

function hasValidAverage(record: SettlementFuelRecord): boolean {
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

interface FuelGroup {
  key: string;
  label: string;
  plate: string;
  records: SettlementFuelRecord[];
}

export function FuelSelectionModal({
  isOpen,
  fuelRecords,
  selectedFuelRecordIds,
  onToggleFuelRecord,
  onSelectGroup,
  onClose,
}: FuelSelectionModalProps) {
  const [activeGroupKey, setActiveGroupKey] = useState('');
  const selectedIds = useMemo(() => new Set(selectedFuelRecordIds), [selectedFuelRecordIds]);

  const groupedRecords = useMemo<FuelGroup[]>(() => {
    const groups = new Map<string, SettlementFuelRecord[]>();

    fuelRecords.forEach((record) => {
      const current = groups.get(record.averageGroupKey) ?? [];
      current.push(record);
      groups.set(record.averageGroupKey, current);
    });

    return Array.from(groups.entries())
      .map(([key, records]) => ({
        key,
        label: records[0]?.averageGroupLabel ?? records[0]?.plate ?? 'Sem identificação',
        plate: records[0]?.plate ?? 'SEM PLACA',
        records,
      }))
      .sort((firstGroup, secondGroup) =>
        firstGroup.label.localeCompare(secondGroup.label, 'pt-BR'),
      );
  }, [fuelRecords]);

  const validRecords = useMemo(() => fuelRecords.filter(hasValidAverage), [fuelRecords]);
  const selectedRecords = useMemo(
    () => fuelRecords.filter((record) => selectedIds.has(record.id)),
    [fuelRecords, selectedIds],
  );
  const selectedValidCount = validRecords.filter((record) => selectedIds.has(record.id)).length;

  const currentGroup =
    groupedRecords.find((group) => group.key === activeGroupKey) ?? groupedRecords[0] ?? null;

  const currentRecords = currentGroup?.records ?? [];
  const currentSelectedRecords = currentRecords.filter((record) => selectedIds.has(record.id));
  const currentSelectedAverageRecords = currentSelectedRecords.filter(hasValidAverage);

  const selectedDistance = currentSelectedAverageRecords.reduce(
    (total, record) => total + (record.distanceKm ?? 0),
    0,
  );
  const selectedLiters = currentSelectedAverageRecords.reduce(
    (total, record) => total + record.dieselLiters,
    0,
  );
  const selectedAverage = selectedLiters > 0 ? selectedDistance / selectedLiters : null;

  const selectedKmInitial = currentSelectedAverageRecords.length
    ? currentSelectedAverageRecords.reduce<number | null>((lowest, record) => {
        if (record.vehicleKmReference === null) return lowest;
        return lowest === null ? record.vehicleKmReference : Math.min(lowest, record.vehicleKmReference);
      }, null)
    : null;

  const selectedKmFinal = currentSelectedAverageRecords.length
    ? currentSelectedAverageRecords.reduce<number | null>((highest, record) => {
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
              Selecione os abastecimentos que devem entrar no acerto. A mesma placa fica separada
              entre períodos individuais e períodos em dupla, mantendo a média correta de cada composição.
            </p>
          </HeaderText>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar seleção de abastecidas">
            <X size={19} aria-hidden="true" />
          </CloseButton>
        </Header>

        <SelectionSummary>
          <span>
            <StatusDot />
            {selectedRecords.length} de {fuelRecords.length} abastecida(s) selecionada(s)
          </span>
          <small>{selectedValidCount} selecionada(s) com KM válido entram no cálculo da média.</small>
        </SelectionSummary>

        {fuelRecords.length === 0 ? (
          <EmptyState>Nenhuma abastecida deste motorista no mês faturado selecionado.</EmptyState>
        ) : (
          <>
            <PlateTabs role="tablist" aria-label="Caminhões utilizados pelo motorista">
              {groupedRecords.map((group) => {
                const selected = group.records.filter((record) => selectedIds.has(record.id)).length;
                const isActive = group.key === currentGroup?.key;

                return (
                  <button
                    key={group.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-active={isActive || undefined}
                    onClick={() => setActiveGroupKey(group.key)}
                  >
                    <Truck size={14} aria-hidden="true" />
                    <span>{group.label}</span>
                    <small>{selected}/{group.records.length}</small>
                  </button>
                );
              })}
            </PlateTabs>

            {currentGroup && (
              <>
                <RecordsHeader>
                  <div>
                    <strong>{currentGroup.label}</strong>
                    <span>
                      {currentSelectedRecords.length} de {currentRecords.length} abastecida(s)
                      selecionada(s)
                    </span>
                  </div>
                  <div>
                    <PlateButton
                      type="button"
                      onClick={() => onSelectGroup(currentGroup.key, true)}
                      disabled={currentRecords.length === 0}
                    >
                      Selecionar todas
                    </PlateButton>
                    <PlateButton
                      type="button"
                      onClick={() => onSelectGroup(currentGroup.key, false)}
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
                    <strong>{formatKm(currentSelectedAverageRecords.length ? selectedDistance : null)}</strong>
                  </Metric>
                  <Metric>
                    <span>Litros consumidos</span>
                    <strong>
                      {currentSelectedAverageRecords.length ? `${formatDecimal(selectedLiters)} L` : '-'}
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
                        const hasAverage = hasValidAverage(record);
                        const isSelected = selectedIds.has(record.id);

                        return (
                          <tr key={record.id}>
                            <td>
                              <SelectionCell $disabled={false}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => onToggleFuelRecord(record.id)}
                                  aria-label={`Usar abastecida de ${formatDate(record.date)} do grupo ${currentGroup.label}`}
                                />
                                <span>
                                  <strong>{formatDate(record.date)}</strong>
                                  <small>Mês faturado: {formatMonth(record.billingMonth || record.date.slice(0, 7))}</small>
                                  {!hasAverage && <small>Sem KM válido · não altera a média</small>}
                                </span>
                              </SelectionCell>
                            </td>
                            <td><Value>{formatKm(record.vehicleKmReference)}</Value></td>
                            <td><Value>{formatKm(record.km)}</Value></td>
                            <td><Value>{formatKm(record.distanceKm)}</Value></td>
                            <td><Value>{formatDecimal(record.dieselLiters)} L</Value></td>
                            <td>
                              <Value $accent={hasAverage}>
                                {hasAverage && record.dieselAverage !== null
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
          <span>Abastecidas sem KM também podem ser marcadas; somente registros com KM válido alteram a média.</span>
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

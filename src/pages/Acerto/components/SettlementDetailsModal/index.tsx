import { useEffect } from 'react';
import { Printer, X } from 'lucide-react';

import { ENTRY_LABELS } from '../../constants';
import { formatCurrency, formatDate, formatDecimal } from '../../utils';
import type { SettlementDetailsModalProps } from './types';
import {
  Actions,
  Button,
  CloseButton,
  Content,
  DetailGrid,
  DetailItem,
  Header,
  Modal,
  Overlay,
  Section,
  SectionTitle,
  SummaryGrid,
  SummaryItem,
  Table,
  TableScroll,
  Title,
  Total,
  VehicleList,
  VehicleRow,
} from './styles';

export function SettlementDetailsModal({
  settlement,
  onClose,
  onPrint,
}: SettlementDetailsModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <Overlay role="presentation" onMouseDown={onClose}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="settlement-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="settlement-details-title">Acerto de {settlement.driver}</Title>
            <span>
              {formatDate(settlement.startDate)} a {formatDate(settlement.endDate)}
            </span>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar detalhes do acerto">
            <X size={18} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Content>
          <SummaryGrid>
            <SummaryItem>
              <span>Total de fretes</span>
              <strong>{formatCurrency(settlement.totals.totalNetFreight)}</strong>
            </SummaryItem>
            <SummaryItem>
              <span>Percentual</span>
              <strong>{formatDecimal(settlement.totals.bonusPercent)}%</strong>
            </SummaryItem>
            <SummaryItem>
              <span>Bonificação</span>
              <strong>{formatCurrency(settlement.totals.bonusValue)}</strong>
            </SummaryItem>
            <SummaryItem $highlight>
              <span>Total a receber</span>
              <strong>{formatCurrency(settlement.totals.totalReceivable)}</strong>
            </SummaryItem>
          </SummaryGrid>

          <Section>
            <SectionTitle>Demonstrativo financeiro</SectionTitle>
            <DetailGrid>
              <DetailItem>
                <span>Salário base</span>
                <strong>{formatCurrency(settlement.totals.baseSalary)}</strong>
              </DetailItem>
              <DetailItem>
                <span>Diárias</span>
                <strong>{formatCurrency(settlement.totals.dailyAllowance)}</strong>
              </DetailItem>
              <DetailItem>
                <span>Outros proventos</span>
                <strong>{formatCurrency(settlement.totals.otherEarnings)}</strong>
              </DetailItem>
              <DetailItem>
                <span>Total de descontos</span>
                <strong>{formatCurrency(settlement.totals.totalDiscounts)}</strong>
              </DetailItem>
            </DetailGrid>
          </Section>

          <Section>
            <SectionTitle>Médias por veículo</SectionTitle>
            <VehicleList>
              {settlement.vehicleSummaries.map((summary) => (
                <VehicleRow key={summary.plate}>
                  <strong>{summary.plate}</strong>
                  <span>{summary.tripsCount} viagem(ns)</span>
                  <span>
                    {summary.averageKmPerLiter === null
                      ? 'Sem média disponível'
                      : `${formatDecimal(summary.averageKmPerLiter)} km/L`}
                  </span>
                </VehicleRow>
              ))}
            </VehicleList>
          </Section>

          <Section>
            <SectionTitle>Viagens</SectionTitle>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>CT-e</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Veículo</th>
                    <th>Frete líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.travels.map((travel) => (
                    <tr key={travel.id}>
                      <td>{formatDate(travel.date)}</td>
                      <td>{travel.cteNumber}</td>
                      <td>{travel.origin}</td>
                      <td>{travel.destination}</td>
                      <td>{travel.plate}</td>
                      <td>{formatCurrency(travel.netFreight)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          </Section>

          {settlement.entries.length > 0 && (
            <Section>
              <SectionTitle>Descontos</SectionTitle>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlement.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{formatDate(entry.date)}</td>
                        <td>{ENTRY_LABELS[entry.type]}</td>
                        <td>{entry.description || '-'}</td>
                        <td>{formatCurrency(entry.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            </Section>
          )}

          <Total>
            <span>Total a receber</span>
            <strong>{formatCurrency(settlement.totals.totalReceivable)}</strong>
          </Total>
        </Content>

        <Actions>
          <Button type="button" onClick={onClose}>
            Fechar
          </Button>
          <Button type="button" $primary onClick={() => onPrint(settlement)}>
            <Printer size={16} aria-hidden="true" />
            Imprimir / Salvar PDF
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  );
}

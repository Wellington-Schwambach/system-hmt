import { ENTRY_LABELS } from '../../constants';
import { formatCurrency, formatDate, formatDecimal } from '../../utils';
import type { PrintReportProps } from './types';
import {
  Brand,
  DriverInfo,
  Footer,
  Header,
  PrintGlobalStyle,
  Report,
  Section,
  SectionTitle,
  SummaryGrid,
  SummaryRow,
  Table,
  VehicleCard,
  VehicleGrid,
} from './styles';

export function PrintReport({
  driver,
  startDate,
  endDate,
  travels,
  vehicleSummaries,
  entries,
  totals,
}: PrintReportProps) {
  return (
    <>
      <PrintGlobalStyle />
      <Report id="settlement-print-report">
        <Header>
          <Brand>
            <h1>Henrique Transportes</h1>
            <p>Espelho do acerto de motorista</p>
          </Brand>
          <DriverInfo>
            <strong>{driver || 'Motorista não selecionado'}</strong>
            <span>
              Período: {formatDate(startDate)} a {formatDate(endDate)}
            </span>
          </DriverInfo>
        </Header>

        <Section>
          <SectionTitle>Relação de viagens</SectionTitle>
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
              {travels.map((travel) => (
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
        </Section>

        <Section>
          <SectionTitle>Médias por veículo</SectionTitle>
          <VehicleGrid>
            {vehicleSummaries.map((summary) => (
              <VehicleCard key={summary.plate}>
                <strong>{summary.plate}</strong>
                <span>
                  Média:{' '}
                  {summary.averageKmPerLiter === null
                    ? 'Sem dados'
                    : `${formatDecimal(summary.averageKmPerLiter)} km/L`}
                </span>
                <span>Viagens: {summary.tripsCount}</span>
              </VehicleCard>
            ))}
          </VehicleGrid>
        </Section>

        {entries.length > 0 && (
          <Section>
            <SectionTitle>Descontos lançados</SectionTitle>
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
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{ENTRY_LABELS[entry.type]}</td>
                    <td>{entry.description || '-'}</td>
                    <td>{formatCurrency(entry.value)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        )}

        <Section>
          <SectionTitle>Demonstrativo financeiro</SectionTitle>
          <SummaryGrid>
            <SummaryRow>
              <span>Total de fretes</span>
              <strong>{formatCurrency(totals.totalNetFreight)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Percentual aplicado</span>
              <strong>{totals.bonusPercent}%</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Bonificação</span>
              <strong>{formatCurrency(totals.bonusValue)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Salário</span>
              <strong>{formatCurrency(totals.baseSalary)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Diárias</span>
              <strong>{formatCurrency(totals.dailyAllowance)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Outros proventos</span>
              <strong>{formatCurrency(totals.otherEarnings)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Vales</span>
              <strong>- {formatCurrency(totals.advances)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Multas</span>
              <strong>- {formatCurrency(totals.fines)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Outros descontos</span>
              <strong>- {formatCurrency(totals.otherDiscounts)}</strong>
            </SummaryRow>
          </SummaryGrid>
          <SummaryRow $total>
            <span>Total a receber</span>
            <strong>{formatCurrency(totals.totalReceivable)}</strong>
          </SummaryRow>
        </Section>

        <Footer>
          Documento gerado pelo sistema HMT Transportes em{' '}
          {new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date())}
          .
        </Footer>
      </Report>
    </>
  );
}

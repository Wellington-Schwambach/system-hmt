import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Fuel,
  Gauge,
  Map,
  RefreshCw,
  Route,
  Truck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { MONTH_OPTIONS } from './constants';
import { useBIData } from './hooks';
import {
  ActivePeriodBadge,
  ActivityCopy,
  ActivityIcon,
  ActivityItem,
  ActivityList,
  ActivityValue,
  AnalyticsGrid,
  Bar,
  Bars,
  BIPage,
  DetailGrid,
  EmptyState,
  FilterBlock,
  FilterLabel,
  FilterTab,
  FilterTabs,
  KPIComparison,
  KPICard,
  KPIDetail,
  KPIGrid,
  KPIHeader,
  KPIIcon,
  KPILabel,
  KPIValue,
  Legend,
  LegendItem,
  MonthColumn,
  MonthlyChart,
  MonthlyChartScroll,
  Panel,
  PanelHeading,
  PanelTitle,
  PeriodActions,
  PeriodHeading,
  PeriodPanel,
  PeriodTitle,
  ProgressTrack,
  ProgressValue,
  RefreshButton,
  ShipperHeader,
  ShipperItem,
  ShipperList,
  VehicleBarBlock,
  VehicleBarLabels,
  VehicleIdentity,
  VehicleList,
  VehicleResult,
  VehicleRow,
} from './styles';
import type { BIActivityType } from './types';
import {
  formatCurrency,
  formatDate,
  formatDecimal,
  formatInteger,
  formatPeriodLabel,
} from './utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  comparison?: number | null;
  inverseComparison?: boolean;
}

function getComparisonTone(
  comparison: number | null | undefined,
  inverseComparison: boolean,
): 'positive' | 'negative' | 'neutral' {
  if (comparison === null || comparison === undefined || comparison === 0) {
    return 'neutral';
  }

  const isPositive = inverseComparison ? comparison < 0 : comparison > 0;
  return isPositive ? 'positive' : 'negative';
}

function getComparisonLabel(comparison: number | null | undefined): string {
  if (comparison === null || comparison === undefined) {
    return 'Novo período';
  }

  if (comparison === 0) {
    return 'Estável';
  }

  return `${Math.abs(comparison).toFixed(1).replace('.', ',')}%`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  comparison,
  inverseComparison = false,
}: MetricCardProps) {
  const tone = getComparisonTone(comparison, inverseComparison);
  const isUp = (comparison ?? 0) > 0;

  return (
    <KPICard>
      <KPIHeader>
        <KPIIcon>
          <Icon size={20} aria-hidden="true" />
        </KPIIcon>

        <KPIComparison $tone={tone}>
          {comparison !== null && comparison !== undefined && comparison !== 0 ? (
            isUp ? (
              <ArrowUpRight size={13} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={13} aria-hidden="true" />
            )
          ) : null}
          {getComparisonLabel(comparison)}
        </KPIComparison>
      </KPIHeader>

      <KPILabel>{label}</KPILabel>
      <KPIValue title={value}>{value}</KPIValue>
      <KPIDetail>{detail}</KPIDetail>
    </KPICard>
  );
}

function getActivityIcon(type: BIActivityType) {
  return type === 'TRAVEL' ? Route : Fuel;
}

export function BI() {
  const {
    period,
    metrics,
    comparisons,
    availableYears,
    monthlyPerformance,
    vehiclePerformance,
    shipperPerformance,
    recentActivities,
    loading,
    error,
    selectYear,
    selectMonth,
    refreshData,
  } = useBIData();

  const chartMaximum = Math.max(
    ...monthlyPerformance.flatMap((item) => [item.netFreight, item.fuelInvestment]),
    1,
  );
  const vehicleResultMaximum = Math.max(
    ...vehiclePerformance.map((item) => Math.max(item.operationalResult, 0)),
    1,
  );

  return (
    <BIPage>
      <PeriodPanel>
        <PeriodHeading>
          <PeriodTitle>
            <h2>Período de análise</h2>
            <p>{error || 'Dados carregados diretamente de Viagens e Combustível cadastrados no banco.'}</p>
          </PeriodTitle>

          <PeriodActions>
            <ActivePeriodBadge>
              <CalendarDays size={15} aria-hidden="true" />
              {formatPeriodLabel(period)}
            </ActivePeriodBadge>

            <RefreshButton type="button" onClick={refreshData} disabled={loading}>
              <RefreshCw size={16} aria-hidden="true" />
              {loading ? 'Atualizando...' : 'Atualizar dados'}
            </RefreshButton>
          </PeriodActions>
        </PeriodHeading>

        <FilterBlock>
          <FilterLabel>Ano</FilterLabel>
          <FilterTabs aria-label="Selecionar ano">
            {availableYears.map((year) => (
              <FilterTab
                key={year}
                type="button"
                $isActive={period.year === year}
                onClick={() => selectYear(year)}
                aria-pressed={period.year === year}
              >
                {year}
              </FilterTab>
            ))}
          </FilterTabs>
        </FilterBlock>

        <FilterBlock>
          <FilterLabel>Mês</FilterLabel>
          <FilterTabs aria-label="Selecionar mês">
            {MONTH_OPTIONS.map((month) => (
              <FilterTab
                key={month.value}
                type="button"
                $isActive={period.month === month.value}
                onClick={() => selectMonth(month.value)}
                aria-pressed={period.month === month.value}
              >
                {month.label}
              </FilterTab>
            ))}
          </FilterTabs>
        </FilterBlock>
      </PeriodPanel>

      <KPIGrid aria-label="Indicadores do período selecionado">
        <MetricCard
          icon={Fuel}
          label="Investimento em combustível"
          value={formatCurrency(metrics.fuelInvestment)}
          detail={`${metrics.fuelings} abastecimento(s) • ticket médio ${formatCurrency(metrics.averageFuelTicket)}`}
          comparison={comparisons.fuelInvestment}
          inverseComparison
        />
        <MetricCard
          icon={Gauge}
          label="Diesel consumido"
          value={`${formatDecimal(metrics.dieselLiters)} L`}
          detail={`${formatDecimal(metrics.arlaLiters)} L de ARLA no período`}
        />
        <MetricCard
          icon={Map}
          label="Viagens realizadas"
          value={formatInteger(metrics.trips)}
          detail={`Frete bruto de ${formatCurrency(metrics.grossFreight)}`}
          comparison={comparisons.trips}
        />
        <MetricCard
          icon={Wallet}
          label="Frete líquido"
          value={formatCurrency(metrics.netFreight)}
          detail={`Média de ${formatCurrency(metrics.averageFreight)} por viagem`}
          comparison={comparisons.netFreight}
        />
        <MetricCard
          icon={Truck}
          label="Diferença do frete"
          value={formatCurrency(metrics.freightDifference)}
          detail="Diferença entre frete bruto e líquido"
        />
        <MetricCard
          icon={BarChart3}
          label="Resultado após combustível"
          value={formatCurrency(metrics.operationalResult)}
          detail="Frete líquido menos combustível do período"
          comparison={comparisons.operationalResult}
        />
      </KPIGrid>

      <AnalyticsGrid>
        <Panel>
          <PanelHeading>
            <PanelTitle>
              <h2>Evolução mensal de {period.year}</h2>
              <p>Comparativo visual entre frete líquido e investimento em combustível.</p>
            </PanelTitle>

            <Legend>
              <LegendItem $variant="freight">Frete líquido</LegendItem>
              <LegendItem $variant="fuel">Combustível</LegendItem>
            </Legend>
          </PanelHeading>

          <MonthlyChartScroll>
            <MonthlyChart aria-label={`Evolução mensal de ${period.year}`}>
              {monthlyPerformance.map((item) => (
                <MonthColumn
                  key={item.month}
                  type="button"
                  $isActive={period.month === item.month}
                  onClick={() => selectMonth(item.month)}
                  title={`${item.label}: ${formatCurrency(item.netFreight)} em frete líquido e ${formatCurrency(item.fuelInvestment)} em combustível`}
                >
                  <Bars>
                    <Bar $variant="freight" $height={(item.netFreight / chartMaximum) * 100} />
                    <Bar $variant="fuel" $height={(item.fuelInvestment / chartMaximum) * 100} />
                  </Bars>
                  <span>{item.shortLabel}</span>
                </MonthColumn>
              ))}
            </MonthlyChart>
          </MonthlyChartScroll>
        </Panel>

        <Panel>
          <PanelHeading>
            <PanelTitle>
              <h2>Frete por embarcador</h2>
              <p>Participação no frete líquido do período selecionado.</p>
            </PanelTitle>
          </PanelHeading>

          {shipperPerformance.length > 0 ? (
            <ShipperList $scrollable={shipperPerformance.length > 10}>
              {shipperPerformance.map((item) => (
                <ShipperItem key={item.shipper}>
                  <ShipperHeader>
                    <strong>{item.label}</strong>
                    <span>
                      {item.trips} viagem(ns) • {formatCurrency(item.netFreight)}
                    </span>
                  </ShipperHeader>
                  <ProgressTrack>
                    <ProgressValue $width={item.share} />
                  </ProgressTrack>
                </ShipperItem>
              ))}
            </ShipperList>
          ) : (
            <EmptyState>Nenhuma viagem encontrada para calcular os embarcadores.</EmptyState>
          )}
        </Panel>
      </AnalyticsGrid>

      <DetailGrid>
        <Panel>
          <PanelHeading>
            <PanelTitle>
              <h2>Desempenho por veículo</h2>
              <p>Resultado estimado por placa considerando fretes e abastecimentos.</p>
            </PanelTitle>
          </PanelHeading>

          {vehiclePerformance.length > 0 ? (
            <VehicleList $scrollable={vehiclePerformance.length > 10}>
              {vehiclePerformance.map((vehicle) => (
                <VehicleRow key={vehicle.plate}>
                  <VehicleIdentity>
                    <strong>{vehicle.plate}</strong>
                    <span>
                      {vehicle.trips} viagem(ns) • {formatDecimal(vehicle.dieselLiters)} L
                    </span>
                  </VehicleIdentity>

                  <VehicleBarBlock>
                    <VehicleBarLabels>
                      <span>Fretes {formatCurrency(vehicle.netFreight)}</span>
                      <span>Combustível {formatCurrency(vehicle.fuelInvestment)}</span>
                    </VehicleBarLabels>
                    <ProgressTrack>
                      <ProgressValue
                        $width={
                          (Math.max(vehicle.operationalResult, 0) / vehicleResultMaximum) * 100
                        }
                      />
                    </ProgressTrack>
                  </VehicleBarBlock>

                  <VehicleResult $isPositive={vehicle.operationalResult >= 0}>
                    {formatCurrency(vehicle.operationalResult)}
                  </VehicleResult>
                </VehicleRow>
              ))}
            </VehicleList>
          ) : (
            <EmptyState>Nenhum dado de veículo disponível no período selecionado.</EmptyState>
          )}
        </Panel>

        <Panel>
          <PanelHeading>
            <PanelTitle>
              <h2>Movimentações recentes</h2>
              <p>Últimas viagens e abastecimentos dentro do período.</p>
            </PanelTitle>
          </PanelHeading>

          {recentActivities.length > 0 ? (
            <ActivityList $scrollable={recentActivities.length > 10}>
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);

                return (
                  <ActivityItem key={activity.id}>
                    <ActivityIcon $type={activity.type}>
                      <Icon size={17} aria-hidden="true" />
                    </ActivityIcon>

                    <ActivityCopy>
                      <strong title={activity.title}>{activity.title}</strong>
                      <span title={activity.description}>{activity.description}</span>
                    </ActivityCopy>

                    <ActivityValue>
                      <strong>{formatCurrency(activity.value)}</strong>
                      <span>
                        {activity.plate} • {formatDate(activity.date)}
                      </span>
                    </ActivityValue>
                  </ActivityItem>
                );
              })}
            </ActivityList>
          ) : (
            <EmptyState>Nenhuma movimentação encontrada para esse período.</EmptyState>
          )}
        </Panel>
      </DetailGrid>
    </BIPage>
  );
}

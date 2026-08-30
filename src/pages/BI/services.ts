import { api } from '../../services/api';
import { MONTH_OPTIONS } from './constants';
import type { BIOperationalData, BIPeriod } from './types';

interface ApiOperationalBIResponse {
  period: { year: number; month: number };
  available_years: number[];
  metrics: {
    fuel_investment: number;
    diesel_liters: number;
    arla_liters: number;
    fuelings: number;
    trips: number;
    gross_freight: number;
    net_freight: number;
    freight_difference: number;
    operational_result: number;
    average_freight: number;
    average_fuel_ticket: number;
  };
  comparisons: {
    fuel_investment: number | null;
    trips: number | null;
    net_freight: number | null;
    operational_result: number | null;
  };
  monthly_performance: Array<{
    month: number;
    trips: number;
    net_freight: number;
    fuel_investment: number;
    operational_result: number;
  }>;
  vehicle_performance: Array<{
    plate: string;
    trips: number;
    net_freight: number;
    fuel_investment: number;
    diesel_liters: number;
    operational_result: number;
  }>;
  shipper_performance: Array<{
    shipper: string;
    label: string;
    trips: number;
    net_freight: number;
    share: number;
  }>;
  recent_activities: Array<{
    id: string;
    type: 'TRAVEL' | 'FUEL';
    date: string;
    title: string;
    description: string;
    value: number;
    plate: string;
  }>;
}

function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapResponse(data: ApiOperationalBIResponse): BIOperationalData {
  return {
    period: {
      year: Number(data.period.year),
      month: Number(data.period.month),
    },
    availableYears: (data.available_years ?? []).map(Number).filter(Number.isFinite),
    metrics: {
      fuelInvestment: numberValue(data.metrics.fuel_investment),
      dieselLiters: numberValue(data.metrics.diesel_liters),
      arlaLiters: numberValue(data.metrics.arla_liters),
      fuelings: numberValue(data.metrics.fuelings),
      trips: numberValue(data.metrics.trips),
      grossFreight: numberValue(data.metrics.gross_freight),
      netFreight: numberValue(data.metrics.net_freight),
      freightDifference: numberValue(data.metrics.freight_difference),
      operationalResult: numberValue(data.metrics.operational_result),
      averageFreight: numberValue(data.metrics.average_freight),
      averageFuelTicket: numberValue(data.metrics.average_fuel_ticket),
    },
    comparisons: {
      fuelInvestment: data.comparisons.fuel_investment === null ? null : numberValue(data.comparisons.fuel_investment),
      trips: data.comparisons.trips === null ? null : numberValue(data.comparisons.trips),
      netFreight: data.comparisons.net_freight === null ? null : numberValue(data.comparisons.net_freight),
      operationalResult: data.comparisons.operational_result === null ? null : numberValue(data.comparisons.operational_result),
    },
    monthlyPerformance: (data.monthly_performance ?? []).map((item) => {
      const monthOption = MONTH_OPTIONS.find((option) => option.value === Number(item.month));
      return {
        month: Number(item.month),
        label: monthOption?.label ?? `Mês ${item.month}`,
        shortLabel: monthOption?.shortLabel ?? String(item.month),
        trips: numberValue(item.trips),
        netFreight: numberValue(item.net_freight),
        fuelInvestment: numberValue(item.fuel_investment),
        operationalResult: numberValue(item.operational_result),
      };
    }),
    vehiclePerformance: (data.vehicle_performance ?? []).map((item) => ({
      plate: item.plate || 'Sem placa',
      trips: numberValue(item.trips),
      netFreight: numberValue(item.net_freight),
      fuelInvestment: numberValue(item.fuel_investment),
      dieselLiters: numberValue(item.diesel_liters),
      operationalResult: numberValue(item.operational_result),
    })),
    shipperPerformance: (data.shipper_performance ?? []).map((item) => ({
      shipper: item.shipper || 'Sem embarcador',
      label: item.label || item.shipper || 'Sem embarcador',
      trips: numberValue(item.trips),
      netFreight: numberValue(item.net_freight),
      share: numberValue(item.share),
    })),
    recentActivities: (data.recent_activities ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      date: item.date,
      title: item.title,
      description: item.description,
      value: numberValue(item.value),
      plate: item.plate || 'Sem placa',
    })),
  };
}

export const biService = {
  async operational(period?: BIPeriod): Promise<BIOperationalData> {
    const response = await api.get<ApiOperationalBIResponse>('/api/bi/operational', {
      params: period ? { year: period.year, month: period.month } : undefined,
    });
    return mapResponse(response.data);
  },
};

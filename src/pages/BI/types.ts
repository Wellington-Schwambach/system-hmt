export interface BIPeriod {
  year: number;
  month: number;
}

export interface BIMetrics {
  fuelInvestment: number;
  dieselLiters: number;
  arlaLiters: number;
  fuelings: number;
  trips: number;
  grossFreight: number;
  netFreight: number;
  freightDifference: number;
  operationalResult: number;
  averageFreight: number;
  averageFuelTicket: number;
}

export interface BIComparisons {
  fuelInvestment: number | null;
  trips: number | null;
  netFreight: number | null;
  operationalResult: number | null;
}

export interface MonthlyPerformanceItem {
  month: number;
  label: string;
  shortLabel: string;
  trips: number;
  netFreight: number;
  fuelInvestment: number;
  operationalResult: number;
}

export interface VehiclePerformanceItem {
  plate: string;
  trips: number;
  netFreight: number;
  fuelInvestment: number;
  dieselLiters: number;
  operationalResult: number;
}

export interface ShipperPerformanceItem {
  shipper: string;
  label: string;
  trips: number;
  netFreight: number;
  share: number;
}

export type BIActivityType = 'TRAVEL' | 'FUEL';

export interface BIActivityItem {
  id: string;
  type: BIActivityType;
  date: string;
  title: string;
  description: string;
  value: number;
  plate: string;
}

export interface BIOperationalData {
  period: BIPeriod;
  availableYears: number[];
  metrics: BIMetrics;
  comparisons: BIComparisons;
  monthlyPerformance: MonthlyPerformanceItem[];
  vehiclePerformance: VehiclePerformanceItem[];
  shipperPerformance: ShipperPerformanceItem[];
  recentActivities: BIActivityItem[];
}

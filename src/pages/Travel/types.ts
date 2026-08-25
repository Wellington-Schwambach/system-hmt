export type Shipper = string;
export type TravelShipperFilter = string;
export type CteType = 'NORMAL' | 'FREIGHT_COMPLEMENT' | 'DAILY';
export type TravelCteTypeFilter = 'ALL' | CteType;
export type TravelOperationType = 'FLEET' | 'THIRD_PARTY';

export interface TravelOptionVehicle {
  id: number;
  plate: string;
  fleetNumber: string;
}

export interface TravelOptionDriver {
  id: number;
  employeeCode: string;
  name: string;
}

export interface TravelOptionShipper {
  id: number;
  name: string;
  status: string;
  color: string;
}

export interface TravelCityOption {
  id: number;
  name: string;
  stateAbbreviation: string;
}

export interface TravelOptions {
  tractors: TravelOptionVehicle[];
  trailers: TravelOptionVehicle[];
  drivers: TravelOptionDriver[];
  shippers: TravelOptionShipper[];
  filterShippers: TravelOptionShipper[];
  filterPlates: string[];
  warnings: string[];
}

export interface TravelCteRecord {
  id: number;
  cteType: CteType;
  cteNumber: string;
  cteSeries: string;
  complementedCteNumber: string;
  netFreight: number;
  insuranceAmount: number;
  tollAmount: number;
  icmsAmount: number;
  grossFreight: number;
}

export interface TravelCteFormData {
  key: string;
  cteType: CteType;
  cteNumber: string;
  cteSeries: string;
  complementedCteNumber: string;
  netFreight: string;
  insuranceAmount: string;
  tollAmount: string;
  icmsAmount: string;
}

export interface TravelRecord {
  id: number;
  /** Compatibilidade com BI/Acertos: representa o primeiro CT-e da viagem. */
  cteType: CteType;
  date: string;
  receivedDate: string;
  origin: string;
  destination: string;
  /** Compatibilidade com BI/Acertos: quando houver vários CT-es, os números são unidos por " / ". */
  cteNumber: string;
  cteSeries: string;
  ctes: TravelCteRecord[];
  shipperId: number | null;
  shipper: Shipper;
  shipperColor: string;
  operationType: TravelOperationType;
  vehicleId: number | null;
  plate: string;
  /** Campo compatível com BI/Acertos: dois motoristas ficam unidos por ' / '. */
  driver: string;
  driverOneId: number | null;
  driverOne: string;
  driverTwoId: number | null;
  driverTwo: string;
  thirdPartyName: string;
  thirdPartyPlate: string;
  thirdPartyPayoutAmount: number;
  thirdPartyPayoutDate: string;
  detachedTrailerId: number | null;
  detachedTrailerPlate: string;
  /** Totais somados de todos os CT-es da viagem. */
  netFreight: number;
  insuranceAmount: number;
  tollAmount: number;
  icmsAmount: number;
  grossFreight: number;
  createdAt: string;
  updatedAt: string;
}

export type PersistedTravelRecord = TravelRecord;

export interface TravelRecordWithMetrics extends TravelRecord {
  freightDifference: number;
  driverDisplay: string;
}

export interface TravelFormData {
  date: string;
  receivedDate: string;
  origin: string;
  destination: string;
  shipperId: string;
  operationType: TravelOperationType;
  vehicleId: string;
  driverOneId: string;
  driverTwoId: string;
  thirdPartyName: string;
  thirdPartyPlate: string;
  thirdPartyPayoutAmount: string;
  thirdPartyPayoutDate: string;
  detachedTrailerId: string;
  ctes: TravelCteFormData[];
}

export interface TravelSummary {
  totalTrips: number;
  totalGrossFreight: number;
  totalNetFreight: number;
  totalDifference: number;
  totalInsurance: number;
  totalToll: number;
  totalIcms: number;
}

export interface TravelOperationResult {
  success: boolean;
  error?: string;
}

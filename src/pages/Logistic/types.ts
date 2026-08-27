export type LogisticsStage = 'PROGRAMMING' | 'COLLECTION' | 'LOADING' | 'DELIVERY';
export type LogisticsStatusFilter = 'PROCESSING' | 'FINALIZED' | 'ALL';

export interface LogisticsShipperOption {
  id: number;
  name: string;
  displayColor: string;
}

export interface LogisticsDriverOption {
  id: number;
  employeeCode: string;
  name: string;
}

export interface LogisticsVehicleOption {
  id: number;
  plate: string;
  fleetNumber: string | null;
  brand: string;
  model: string;
}

export interface LogisticsActiveSetOption {
  id: number;
  tractorId: number | null;
  trailerId: number | null;
  driverId: number | null;
  driverTwoId: number | null;
}

export interface LogisticsOptions {
  shippers: LogisticsShipperOption[];
  drivers: LogisticsDriverOption[];
  tractors: LogisticsVehicleOption[];
  trailers: LogisticsVehicleOption[];
  activeSets: LogisticsActiveSetOption[];
}

export interface LogisticsLoadEvent {
  id: number;
  action: 'CREATED' | 'UPDATED' | 'STAGE_CHANGED' | 'FINALIZED';
  fromStage: LogisticsStage | null;
  toStage: LogisticsStage | null;
  details: Record<string, unknown>;
  occurredAt: string;
  userName: string | null;
}

export interface LogisticsLoad {
  id: number;
  referenceCode: string;
  shipmentNumber: string | null;
  loadNumber: string | null;
  shipowner: string | null;
  bookingNumber: string | null;
  shipperId: number;
  shipperName: string;
  shipperColor: string;
  driverId: number | null;
  driverName: string | null;
  driverTwoId: number | null;
  driverTwoName: string | null;
  tractorId: number | null;
  tractorPlate: string | null;
  trailerId: number | null;
  trailerPlate: string | null;
  collectionTerminal: string | null;
  collectionAt: string | null;
  loadingLocation: string | null;
  loadingAt: string | null;
  deliveryLocation: string | null;
  deliveryAt: string | null;
  scheduledAt: string | null;
  stage: LogisticsStage;
  position: number;
  notes: string | null;
  completedAt: string | null;
  completedByName: string | null;
  events: LogisticsLoadEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface LogisticsFilters {
  dateFrom: string;
  dateTo: string;
  shipperId: string;
  driverId: string;
  tractorId: string;
  location: string;
  stage: '' | LogisticsStage;
  status: LogisticsStatusFilter;
  search: string;
}

export interface LogisticsFormData {
  referenceCode: string;
  shipmentNumber: string;
  loadNumber: string;
  shipowner: string;
  bookingNumber: string;
  shipperId: string;
  driverId: string;
  driverTwoId: string;
  tractorId: string;
  trailerId: string;
  collectionTerminal: string;
  collectionAt: string;
  loadingLocation: string;
  loadingAt: string;
  deliveryLocation: string;
  deliveryAt: string;
  stage: LogisticsStage;
  notes: string;
}

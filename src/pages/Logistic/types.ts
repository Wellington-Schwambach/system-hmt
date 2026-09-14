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


export interface LogisticsCatalogOption {
  id: number;
  name: string;
}

export interface LogisticsLocationTypeOption extends LogisticsCatalogOption {
  scope: 'C' | 'B';
}

export interface LogisticsCityOption {
  id: number;
  name: string;
  stateAbbreviation: string;
  label: string;
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
  cargoTypes: LogisticsCatalogOption[];
  containerTypes: LogisticsCatalogOption[];
  shipowners: LogisticsCatalogOption[];
  locationTypes: LogisticsLocationTypeOption[];
  cities: LogisticsCityOption[];
}

export interface LogisticsLoadEvent {
  id: number;
  action: 'CREATED' | 'UPDATED' | 'STAGE_CHANGED' | 'FINALIZED' | 'DELETED';
  fromStage: LogisticsStage | null;
  toStage: LogisticsStage | null;
  details: Record<string, unknown>;
  occurredAt: string;
  userName: string | null;
}

export interface LogisticsLoadEntry {
  status: 'EMPTY' | 'FULL';
  number: string;
}

export interface LogisticsAppointment {
  scheduledAt: string;
  locationTypeId: number | null;
  location: string;
}

export interface LogisticsStatusNote {
  id: number;
  observation: string;
  isVisible: boolean;
  userName: string;
  createdAt: string | null;
}

export interface LogisticsLoad {
  id: number;
  referenceCode: string;
  shipmentNumber: string | null;
  loadNumber: string | null;
  shipowner: string | null;
  bookingNumber: string | null;
  collectionBookingNumber: string | null;
  gradeNumber: string | null;
  gradeAt: string | null;
  cargoTypeId: number | null;
  cargoTypeName: string | null;
  containerTypeId: number | null;
  containerTypeName: string | null;
  shipownerId: number | null;
  shipownerName: string | null;
  shipperId: number;
  shipperName: string;
  shipperColor: string;
  driverId: number | null;
  driverName: string | null;
  driverTwoId: number | null;
  driverTwoName: string | null;
  plateMode: 'FLEET' | 'THIRD_PARTY';
  tractorId: number | null;
  tractorPlate: string | null;
  trailerId: number | null;
  trailerPlate: string | null;
  thirdPartyTractorPlate: string | null;
  thirdPartyTrailerPlate: string | null;
  collectionCityId: number | null;
  collectionTerminal: string | null;
  collectionLocationTypeId: number | null;
  collectionLocationTypeName: string | null;
  collectionScheduledAt: string | null;
  collectionAt: string | null;
  collectionAppointments: LogisticsAppointment[];
  loadingCityId: number | null;
  loadingCityLabel: string | null;
  loadingLocation: string | null;
  loadingAt: string | null;
  deliveryCityId: number | null;
  deliveryCityLabel: string | null;
  deliveryLocation: string | null;
  deliveryLocationTypeId: number | null;
  deliveryLocationTypeName: string | null;
  deliveryAt: string | null;
  deliveryAppointments: LogisticsAppointment[];
  plan: string | null;
  loadMode: 'CARGO' | 'LOAD' | null;
  loadStatus: 'EMPTY' | 'FULL' | null;
  cargoNumber: string | null;
  loadEntries: LogisticsLoadEntry[];
  containerNumber: string | null;
  containerTareKg: number | null;
  containerPayloadKg: number | null;
  shipownerSeal: string | null;
  vessel: string | null;
  deadline: string | null;
  country: string | null;
  temperature: string | null;
  sifSeal: string | null;
  scheduledAt: string | null;
  stage: LogisticsStage;
  position: number;
  notes: string | null;
  completedAt: string | null;
  completedByName: string | null;
  events: LogisticsLoadEvent[];
  statusNotes: LogisticsStatusNote[];
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
  collectionBookingNumber: string;
  gradeNumber: string;
  gradeAt: string;
  cargoTypeId: string;
  containerTypeId: string;
  shipownerId: string;
  shipperId: string;
  driverId: string;
  driverTwoId: string;
  plateMode: 'FLEET' | 'THIRD_PARTY';
  tractorId: string;
  trailerId: string;
  thirdPartyTractorPlate: string;
  thirdPartyTrailerPlate: string;
  collectionCityId: string;
  collectionTerminal: string;
  collectionLocationTypeId: string;
  collectionScheduledAt: string;
  collectionAt: string;
  collectionAppointments: LogisticsAppointment[];
  loadingCityId: string;
  loadingLocation: string;
  loadingAt: string;
  deliveryCityId: string;
  deliveryLocation: string;
  deliveryLocationTypeId: string;
  deliveryAt: string;
  deliveryAppointments: LogisticsAppointment[];
  plan: string;
  loadMode: '' | 'CARGO' | 'LOAD';
  loadStatus: '' | 'EMPTY' | 'FULL';
  cargoNumber: string;
  loadEntries: LogisticsLoadEntry[];
  containerNumber: string;
  containerTareKg: string;
  containerPayloadKg: string;
  shipownerSeal: string;
  vessel: string;
  deadline: string;
  country: string;
  temperature: string;
  sifSeal: string;
  stage: LogisticsStage;
  notes: string;
}

import { api } from '../../services/api';
import type {
  LogisticsFilters,
  LogisticsFormData,
  LogisticsLoad,
  LogisticsLoadEvent,
  LogisticsOptions,
  LogisticsStage,
} from './types';

interface ApiLoadEvent {
  id: number;
  action: LogisticsLoadEvent['action'];
  from_stage: LogisticsStage | null;
  to_stage: LogisticsStage | null;
  details: Record<string, unknown>;
  occurred_at: string;
  user_name: string | null;
}

interface ApiLoad {
  id: number;
  reference_code: string;
  shipment_number: string | null;
  load_number: string | null;
  shipowner: string | null;
  booking_number: string | null;
  collection_booking_number: string | null;
  cargo_type_id: number | null;
  cargo_type_name: string | null;
  container_type_id: number | null;
  container_type_name: string | null;
  shipowner_id: number | null;
  shipowner_name: string | null;
  shipper_id: number;
  shipper_name: string;
  shipper_color: string;
  driver_id: number | null;
  driver_name: string | null;
  driver_two_id: number | null;
  driver_two_name: string | null;
  plate_mode: 'FLEET' | 'THIRD_PARTY' | null;
  tractor_id: number | null;
  tractor_plate: string | null;
  trailer_id: number | null;
  trailer_plate: string | null;
  third_party_tractor_plate: string | null;
  third_party_trailer_plate: string | null;
  collection_city_id: number | null;
  collection_terminal: string | null;
  collection_location_type_id: number | null;
  collection_location_type_name: string | null;
  collection_scheduled_at: string | null;
  collection_at: string | null;
  loading_city_id: number | null;
  loading_location: string | null;
  loading_at: string | null;
  delivery_city_id: number | null;
  delivery_location: string | null;
  delivery_location_type_id: number | null;
  delivery_location_type_name: string | null;
  delivery_at: string | null;
  plan: string | null;
  load_mode: 'CARGO' | 'LOAD' | null;
  load_status: 'EMPTY' | 'FULL' | null;
  cargo_number: string | null;
  load_entries: Array<{ status: 'EMPTY' | 'FULL'; number: string | null }> | null;
  container_number: string | null;
  container_tare_kg: number | null;
  container_payload_kg: number | null;
  shipowner_seal: string | null;
  vessel: string | null;
  deadline: string | null;
  country: string | null;
  temperature: string | null;
  sif_seal: string | null;
  scheduled_at: string | null;
  stage: LogisticsStage;
  position: number;
  notes: string | null;
  completed_at: string | null;
  completed_by_name: string | null;
  events: ApiLoadEvent[];
  created_at: string;
  updated_at: string;
}

interface ApiOptions {
  shippers: Array<{ id: number; name: string; display_color: string }>;
  drivers: Array<{ id: number; employee_code: string; name: string }>;
  tractors: Array<{ id: number; plate: string; fleet_number: string | null; brand: string; model: string }>;
  trailers: Array<{ id: number; plate: string; fleet_number: string | null; brand: string; model: string }>;
  active_sets: Array<{
    id: number;
    tractor_id: number | null;
    trailer_id: number | null;
    driver_id: number | null;
    driver_two_id: number | null;
  }>;
  cargo_types: Array<{ id: number; name: string }>;
  container_types: Array<{ id: number; name: string }>;
  shipowners: Array<{ id: number; name: string }>;
  location_types: Array<{ id: number; name: string; scope: 'C' | 'B' }>;
  cities: Array<{ id: number; name: string; state_abbreviation: string; label: string }>;
}

function mapLoad(item: ApiLoad): LogisticsLoad {
  return {
    id: item.id,
    referenceCode: item.reference_code,
    shipmentNumber: item.shipment_number,
    loadNumber: item.load_number,
    shipowner: item.shipowner,
    bookingNumber: item.booking_number,
    collectionBookingNumber: item.collection_booking_number,
    cargoTypeId: item.cargo_type_id,
    cargoTypeName: item.cargo_type_name,
    containerTypeId: item.container_type_id,
    containerTypeName: item.container_type_name,
    shipownerId: item.shipowner_id,
    shipownerName: item.shipowner_name,
    shipperId: item.shipper_id,
    shipperName: item.shipper_name,
    shipperColor: item.shipper_color,
    driverId: item.driver_id,
    driverName: item.driver_name,
    driverTwoId: item.driver_two_id,
    driverTwoName: item.driver_two_name,
    plateMode: item.plate_mode === 'THIRD_PARTY' ? 'THIRD_PARTY' : 'FLEET',
    tractorId: item.tractor_id,
    tractorPlate: item.tractor_plate,
    trailerId: item.trailer_id,
    trailerPlate: item.trailer_plate,
    thirdPartyTractorPlate: item.third_party_tractor_plate,
    thirdPartyTrailerPlate: item.third_party_trailer_plate,
    collectionCityId: item.collection_city_id,
    collectionTerminal: item.collection_terminal,
    collectionLocationTypeId: item.collection_location_type_id,
    collectionLocationTypeName: item.collection_location_type_name,
    collectionScheduledAt: item.collection_scheduled_at,
    collectionAt: item.collection_at,
    loadingCityId: item.loading_city_id,
    loadingLocation: item.loading_location,
    loadingAt: item.loading_at,
    deliveryCityId: item.delivery_city_id,
    deliveryLocation: item.delivery_location,
    deliveryLocationTypeId: item.delivery_location_type_id,
    deliveryLocationTypeName: item.delivery_location_type_name,
    deliveryAt: item.delivery_at,
    plan: item.plan,
    loadMode: item.load_mode,
    loadStatus: item.load_status,
    cargoNumber: item.cargo_number,
    loadEntries: Array.isArray(item.load_entries) && item.load_entries.length > 0
      ? item.load_entries
          .filter((entry) => entry && (entry.status === 'EMPTY' || entry.status === 'FULL'))
          .map((entry) => ({ status: entry.status, number: String(entry.number ?? '') }))
      : ((item.load_status === 'EMPTY' || item.load_status === 'FULL')
          ? [{ status: item.load_status, number: String(item.load_number ?? '') }]
          : []),
    containerNumber: item.container_number,
    containerTareKg: item.container_tare_kg,
    containerPayloadKg: item.container_payload_kg,
    shipownerSeal: item.shipowner_seal,
    vessel: item.vessel,
    deadline: item.deadline,
    country: item.country,
    temperature: item.temperature,
    sifSeal: item.sif_seal,
    scheduledAt: item.scheduled_at,
    stage: item.stage,
    position: Number(item.position ?? 0),
    notes: item.notes,
    completedAt: item.completed_at,
    completedByName: item.completed_by_name,
    events: (item.events ?? []).map((event) => ({
      id: event.id,
      action: event.action,
      fromStage: event.from_stage,
      toStage: event.to_stage,
      details: event.details ?? {},
      occurredAt: event.occurred_at,
      userName: event.user_name,
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}


export const LOGISTICS_SYNC_STORAGE_KEY = 'hmt:logistics:last-change';

function notifyLogisticsChanged(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOGISTICS_SYNC_STORAGE_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    // O sincronismo entre abas é auxiliar; falhas de storage não impedem salvar a carga.
  }
}

function nullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function formPayload(data: LogisticsFormData) {
  const loadEntries = data.loadMode === 'LOAD'
    ? data.loadEntries
        .filter((entry) => entry.status === 'EMPTY' || entry.status === 'FULL')
        .map((entry) => ({ status: entry.status, number: nullableText(entry.number) }))
    : [];
  const firstLoad = loadEntries[0] ?? null;

  return {
    reference_code: nullableText(data.referenceCode)?.toUpperCase() ?? null,
    shipment_number: nullableText(data.shipmentNumber),
    load_number: data.loadMode === 'LOAD' ? (firstLoad?.number ?? null) : null,
    shipowner: nullableText(data.shipowner),
    booking_number: nullableText(data.bookingNumber),
    collection_booking_number: nullableText(data.collectionBookingNumber),
    cargo_type_id: data.cargoTypeId ? Number(data.cargoTypeId) : null,
    container_type_id: data.containerTypeId ? Number(data.containerTypeId) : null,
    shipowner_id: data.shipownerId ? Number(data.shipownerId) : null,
    shipper_id: Number(data.shipperId),
    driver_id: data.driverId ? Number(data.driverId) : null,
    driver_two_id: data.driverTwoId ? Number(data.driverTwoId) : null,
    plate_mode: data.plateMode,
    tractor_id: data.plateMode === 'FLEET' && data.tractorId ? Number(data.tractorId) : null,
    trailer_id: data.plateMode === 'FLEET' && data.trailerId ? Number(data.trailerId) : null,
    third_party_tractor_plate: data.plateMode === 'THIRD_PARTY' ? nullableText(data.thirdPartyTractorPlate)?.toUpperCase() ?? null : null,
    third_party_trailer_plate: data.plateMode === 'THIRD_PARTY' ? nullableText(data.thirdPartyTrailerPlate)?.toUpperCase() ?? null : null,
    collection_city_id: data.collectionCityId ? Number(data.collectionCityId) : null,
    collection_terminal: nullableText(data.collectionTerminal),
    collection_location_type_id: data.collectionLocationTypeId ? Number(data.collectionLocationTypeId) : null,
    collection_scheduled_at: data.collectionScheduledAt || null,
    collection_at: data.collectionAt || null,
    loading_city_id: data.loadingCityId ? Number(data.loadingCityId) : null,
    loading_location: nullableText(data.loadingLocation),
    loading_at: data.loadingAt || null,
    delivery_city_id: data.deliveryCityId ? Number(data.deliveryCityId) : null,
    delivery_location: nullableText(data.deliveryLocation),
    delivery_location_type_id: data.deliveryLocationTypeId ? Number(data.deliveryLocationTypeId) : null,
    delivery_at: data.deliveryAt || null,
    plan: nullableText(data.plan),
    load_mode: data.loadMode || null,
    load_status: data.loadMode === 'LOAD' ? (firstLoad?.status ?? null) : null,
    cargo_number: data.loadMode === 'CARGO' ? nullableText(data.cargoNumber) : null,
    load_entries: data.loadMode === 'LOAD' ? loadEntries : null,
    container_number: nullableText(data.containerNumber),
    container_tare_kg: data.containerTareKg ? Number(data.containerTareKg.replace(',', '.')) : null,
    container_payload_kg: data.containerPayloadKg ? Number(data.containerPayloadKg.replace(',', '.')) : null,
    shipowner_seal: nullableText(data.shipownerSeal),
    vessel: nullableText(data.vessel),
    deadline: data.deadline || null,
    country: nullableText(data.country),
    temperature: nullableText(data.temperature),
    sif_seal: nullableText(data.sifSeal),
    stage: data.stage,
    notes: nullableText(data.notes),
  };
}

export const logisticsService = {
  async options(): Promise<LogisticsOptions> {
    const response = await api.get<ApiOptions>('/api/logistics/options');
    return {
      shippers: response.data.shippers.map((item) => ({
        id: item.id,
        name: item.name,
        displayColor: item.display_color,
      })),
      drivers: response.data.drivers.map((item) => ({
        id: item.id,
        employeeCode: item.employee_code,
        name: item.name,
      })),
      tractors: response.data.tractors.map((item) => ({
        id: item.id,
        plate: item.plate,
        fleetNumber: item.fleet_number,
        brand: item.brand,
        model: item.model,
      })),
      trailers: response.data.trailers.map((item) => ({
        id: item.id,
        plate: item.plate,
        fleetNumber: item.fleet_number,
        brand: item.brand,
        model: item.model,
      })),
      activeSets: response.data.active_sets.map((item) => ({
        id: item.id,
        tractorId: item.tractor_id,
        trailerId: item.trailer_id,
        driverId: item.driver_id,
        driverTwoId: item.driver_two_id,
      })),
      cargoTypes: (response.data.cargo_types ?? []).map((item) => ({ id: item.id, name: item.name })),
      containerTypes: (response.data.container_types ?? []).map((item) => ({ id: item.id, name: item.name })),
      shipowners: (response.data.shipowners ?? []).map((item) => ({ id: item.id, name: item.name })),
      locationTypes: (response.data.location_types ?? []).map((item) => ({ id: item.id, name: item.name, scope: item.scope })),
      cities: (response.data.cities ?? []).map((item) => ({ id: item.id, name: item.name, stateAbbreviation: item.state_abbreviation, label: item.label })),
    };
  },

  async createCatalog(catalog: 'shippers' | 'cargo-types' | 'container-types' | 'shipowners' | 'location-types', name: string, scope?: 'C' | 'B') {
    const response = await api.post<{ item: { id: number; name: string; display_color?: string; scope?: 'C' | 'B' } }>(`/api/logistics/catalogs/${catalog}`, { name, scope });
    notifyLogisticsChanged();
    return response.data.item;
  },

  async calendar(month: string, shipperId = ''): Promise<{ loads: LogisticsLoad[]; counts: Record<string, number> }> {
    const response = await api.get<{ month: string; counts: Record<string, number>; loads: ApiLoad[] }>('/api/logistics/calendar', {
      params: {
        month,
        shipper_id: shipperId || undefined,
      },
    });

    return {
      loads: response.data.loads.map(mapLoad),
      counts: response.data.counts ?? {},
    };
  },

  async calendarWeek(dateFrom: string, dateTo: string, shipperId = ''): Promise<LogisticsLoad[]> {
    const response = await api.get<{ date_from: string; date_to: string; loads: ApiLoad[] }>('/api/logistics/calendar', {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
        shipper_id: shipperId || undefined,
      },
    });

    return response.data.loads.map(mapLoad);
  },

  async list(filters: LogisticsFilters): Promise<LogisticsLoad[]> {
    const params = {
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      shipper_id: filters.shipperId || undefined,
      driver_id: filters.driverId || undefined,
      tractor_id: filters.tractorId || undefined,
      location: filters.location.trim() || undefined,
      stage: filters.stage || undefined,
      status: filters.status,
      search: filters.search.trim() || undefined,
    };
    const response = await api.get<{ loads: ApiLoad[] }>('/api/logistics', { params });
    return response.data.loads.map(mapLoad);
  },

  async create(data: LogisticsFormData): Promise<LogisticsLoad> {
    const response = await api.post<{ message: string; load: ApiLoad }>('/api/logistics', formPayload(data));
    const load = mapLoad(response.data.load);
    notifyLogisticsChanged();
    return load;
  },

  async update(id: number, data: LogisticsFormData): Promise<LogisticsLoad> {
    const response = await api.put<{ message: string; load: ApiLoad }>(`/api/logistics/${id}`, formPayload(data));
    const load = mapLoad(response.data.load);
    notifyLogisticsChanged();
    return load;
  },

  async move(id: number, stage: LogisticsStage, position: number): Promise<LogisticsLoad> {
    const response = await api.patch<{ message: string; load: ApiLoad }>(`/api/logistics/${id}/move`, {
      stage,
      position,
    });
    const load = mapLoad(response.data.load);
    notifyLogisticsChanged();
    return load;
  },

  async finish(id: number): Promise<LogisticsLoad> {
    const response = await api.patch<{ message: string; load: ApiLoad }>(`/api/logistics/${id}/finish`);
    const load = mapLoad(response.data.load);
    notifyLogisticsChanged();
    return load;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/logistics/${id}`);
    notifyLogisticsChanged();
  },
};

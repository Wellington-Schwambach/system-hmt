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
  shipper_id: number;
  shipper_name: string;
  shipper_color: string;
  driver_id: number | null;
  driver_name: string | null;
  driver_two_id: number | null;
  driver_two_name: string | null;
  tractor_id: number | null;
  tractor_plate: string | null;
  trailer_id: number | null;
  trailer_plate: string | null;
  collection_terminal: string | null;
  collection_at: string | null;
  loading_location: string | null;
  loading_at: string | null;
  delivery_location: string | null;
  delivery_at: string | null;
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
}

function mapLoad(item: ApiLoad): LogisticsLoad {
  return {
    id: item.id,
    referenceCode: item.reference_code,
    shipmentNumber: item.shipment_number,
    loadNumber: item.load_number,
    shipowner: item.shipowner,
    bookingNumber: item.booking_number,
    shipperId: item.shipper_id,
    shipperName: item.shipper_name,
    shipperColor: item.shipper_color,
    driverId: item.driver_id,
    driverName: item.driver_name,
    driverTwoId: item.driver_two_id,
    driverTwoName: item.driver_two_name,
    tractorId: item.tractor_id,
    tractorPlate: item.tractor_plate,
    trailerId: item.trailer_id,
    trailerPlate: item.trailer_plate,
    collectionTerminal: item.collection_terminal,
    collectionAt: item.collection_at,
    loadingLocation: item.loading_location,
    loadingAt: item.loading_at,
    deliveryLocation: item.delivery_location,
    deliveryAt: item.delivery_at,
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
  return {
    reference_code: nullableText(data.referenceCode)?.toUpperCase() ?? null,
    shipment_number: nullableText(data.shipmentNumber),
    load_number: nullableText(data.loadNumber),
    shipowner: nullableText(data.shipowner),
    booking_number: nullableText(data.bookingNumber),
    shipper_id: Number(data.shipperId),
    driver_id: data.driverId ? Number(data.driverId) : null,
    driver_two_id: data.driverTwoId ? Number(data.driverTwoId) : null,
    tractor_id: data.tractorId ? Number(data.tractorId) : null,
    trailer_id: data.trailerId ? Number(data.trailerId) : null,
    collection_terminal: nullableText(data.collectionTerminal),
    collection_at: data.collectionAt || null,
    loading_location: nullableText(data.loadingLocation),
    loading_at: data.loadingAt || null,
    delivery_location: nullableText(data.deliveryLocation),
    delivery_at: data.deliveryAt || null,
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
    };
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

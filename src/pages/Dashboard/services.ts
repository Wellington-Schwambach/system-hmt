import { api } from '../../services/api';
import type { DashboardData, DashboardLoad } from './types';

interface ApiDashboardLoad {
  id: number;
  reference_code: string;
  loading_at: string | null;
  shipment_number: string | null;
  load_number: string | null;
  shipowner: string | null;
  booking_number: string | null;
  shipper_name: string;
  shipper_color: string;
  origin: string | null;
  destination: string | null;
  tractor_plate: string | null;
  trailer_plate: string | null;
  driver_name: string | null;
  driver_two_name: string | null;
  completed_at: string | null;
}

interface ApiDashboardResponse {
  period: DashboardData['period'];
  metrics: {
    loads: number;
    travels: number;
    fuelings: number;
  };
  load_counts: Record<string, number>;
  loads: ApiDashboardLoad[];
}

function mapLoad(load: ApiDashboardLoad): DashboardLoad {
  return {
    id: Number(load.id),
    referenceCode: load.reference_code,
    loadingAt: load.loading_at,
    shipmentNumber: load.shipment_number,
    loadNumber: load.load_number,
    shipowner: load.shipowner,
    bookingNumber: load.booking_number,
    shipperName: load.shipper_name || 'Sem embarcador',
    shipperColor: load.shipper_color || '#3FA66C',
    origin: load.origin,
    destination: load.destination,
    tractorPlate: load.tractor_plate,
    trailerPlate: load.trailer_plate,
    driverName: load.driver_name,
    driverTwoName: load.driver_two_name,
    completedAt: load.completed_at,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<ApiDashboardResponse>('/api/dashboard');
  return {
    period: {
      year: Number(response.data.period.year),
      month: Number(response.data.period.month),
      key: response.data.period.key,
      start: response.data.period.start,
      end: response.data.period.end,
    },
    metrics: {
      loads: Number(response.data.metrics.loads ?? 0),
      travels: Number(response.data.metrics.travels ?? 0),
      fuelings: Number(response.data.metrics.fuelings ?? 0),
    },
    loadCounts: response.data.load_counts ?? {},
    loads: (response.data.loads ?? []).map(mapLoad),
  };
}

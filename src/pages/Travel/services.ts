import { api } from '../../services/api';
import type {
  TravelCityOption,
  TravelCteRecord,
  TravelFormData,
  TravelOptionShipper,
  TravelOptions,
  TravelRecord,
} from './types';
import { parseDecimalInput } from './utils';

interface ApiTravelCte {
  id: number;
  cte_type: string;
  cte_number: string;
  cte_series: string;
  complemented_cte_number: string | null;
  net_freight: number;
  insurance_amount: number;
  toll_amount: number;
  icms_amount: number;
  gross_freight: number;
}

interface ApiTravel {
  id: number;
  cte_type: string;
  travel_date: string;
  receipt_date: string | null;
  origin: string;
  destination: string;
  cte_number: string;
  cte_series: string;
  ctes?: ApiTravelCte[];
  shipper_id: number | null;
  shipper: string;
  shipper_color: string;
  operation_type: TravelRecord['operationType'];
  vehicle_id: number | null;
  plate: string;
  driver_one_id: number | null;
  driver_one_name: string | null;
  driver_two_id: number | null;
  driver_two_name: string | null;
  third_party_name: string | null;
  third_party_plate: string | null;
  third_party_payout_amount: number;
  third_party_payout_date: string | null;
  detached_trailer_id: number | null;
  detached_trailer_plate: string | null;
  net_freight: number;
  insurance_amount: number;
  toll_amount: number;
  icms_amount: number;
  gross_freight: number;
  created_at: string;
  updated_at: string;
}

interface ApiShipper {
  id: number;
  name: string;
  status: string;
  color: string;
}

interface ApiTravelCity {
  id: number;
  name: string;
  state_abbreviation: string;
}

interface ApiOptions {
  tractors: Array<{ id: number; plate: string; fleet_number: string | null }>;
  trailers: Array<{ id: number; plate: string; fleet_number: string | null }>;
  drivers: Array<{ id: number; employee_code: string; name: string }>;
  shippers: ApiShipper[];
  filter_shippers: ApiShipper[];
  filter_plates: string[];
  warnings?: string[];
}

function normalizeCteType(value: string): TravelCteRecord['cteType'] {
  if (value === 'FREIGHT_COMPLEMENT') return 'FREIGHT_COMPLEMENT';
  if (value === 'DAILY') return 'DAILY';
  return 'NORMAL';
}

function mapShipper(shipper: ApiShipper): TravelOptionShipper {
  return { id: shipper.id, name: shipper.name, status: shipper.status, color: shipper.color };
}

function mapCte(cte: ApiTravelCte): TravelCteRecord {
  return {
    id: cte.id,
    cteType: normalizeCteType(cte.cte_type),
    cteNumber: cte.cte_number,
    cteSeries: cte.cte_series,
    complementedCteNumber: cte.complemented_cte_number ?? '',
    netFreight: Number(cte.net_freight),
    insuranceAmount: Number(cte.insurance_amount),
    tollAmount: Number(cte.toll_amount),
    icmsAmount: Number(cte.icms_amount),
    grossFreight: Number(cte.gross_freight),
  };
}

function mapTravel(travel: ApiTravel): TravelRecord {
  const ctes =
    travel.ctes?.length
      ? travel.ctes.map(mapCte)
      : [
          {
            id: 0,
            cteType: normalizeCteType(travel.cte_type),
            cteNumber: travel.cte_number,
            cteSeries: travel.cte_series,
            complementedCteNumber: '',
            netFreight: Number(travel.net_freight),
            insuranceAmount: Number(travel.insurance_amount),
            tollAmount: Number(travel.toll_amount),
            icmsAmount: Number(travel.icms_amount),
            grossFreight: Number(travel.gross_freight),
          },
        ];

  return {
    id: travel.id,
    cteType: ctes[0]?.cteType ?? normalizeCteType(travel.cte_type),
    date: travel.travel_date,
    receivedDate: travel.receipt_date ?? '',
    origin: travel.origin,
    destination: travel.destination,
    cteNumber: ctes.map((cte) => cte.cteNumber).filter(Boolean).join(' / '),
    cteSeries: ctes.map((cte) => cte.cteSeries).filter(Boolean).join(' / '),
    ctes,
    shipperId: travel.shipper_id,
    shipper: travel.shipper,
    shipperColor: travel.shipper_color || '#009E60',
    operationType: travel.operation_type,
    vehicleId: travel.vehicle_id,
    plate: travel.plate,
    driver:
      travel.operation_type === 'THIRD_PARTY'
        ? `Terceiro: ${travel.third_party_name ?? 'Não informado'}`
        : [travel.driver_one_name, travel.driver_two_name].filter(Boolean).join(' / '),
    driverOneId: travel.driver_one_id,
    driverOne: travel.driver_one_name ?? '',
    driverTwoId: travel.driver_two_id,
    driverTwo: travel.driver_two_name ?? '',
    thirdPartyName: travel.third_party_name ?? '',
    thirdPartyPlate: travel.third_party_plate ?? '',
    thirdPartyPayoutAmount: Number(travel.third_party_payout_amount ?? 0),
    thirdPartyPayoutDate: travel.third_party_payout_date ?? '',
    detachedTrailerId: travel.detached_trailer_id,
    detachedTrailerPlate: travel.detached_trailer_plate ?? '',
    netFreight: Number(travel.net_freight),
    insuranceAmount: Number(travel.insurance_amount),
    tollAmount: Number(travel.toll_amount),
    icmsAmount: Number(travel.icms_amount),
    grossFreight: Number(travel.gross_freight),
    createdAt: travel.created_at,
    updatedAt: travel.updated_at,
  };
}

function buildPayload(data: TravelFormData) {
  return {
    travel_date: data.date,
    receipt_date: data.receivedDate || null,
    origin: data.origin.trim(),
    destination: data.destination.trim(),
    shipper_id: data.shipperId ? Number(data.shipperId) : null,
    operation_type: data.operationType,
    vehicle_id: data.operationType === 'FLEET' && data.vehicleId ? Number(data.vehicleId) : null,
    driver_one_id:
      data.operationType === 'FLEET' && data.driverOneId ? Number(data.driverOneId) : null,
    driver_two_id:
      data.operationType === 'FLEET' && data.driverTwoId ? Number(data.driverTwoId) : null,
    third_party_name: data.operationType === 'THIRD_PARTY' ? data.thirdPartyName.trim() : null,
    third_party_plate: data.operationType === 'THIRD_PARTY' ? data.thirdPartyPlate.trim() : null,
    third_party_payout_amount:
      data.operationType === 'THIRD_PARTY' ? parseDecimalInput(data.thirdPartyPayoutAmount) : 0,
    third_party_payout_date:
      data.operationType === 'THIRD_PARTY' && data.thirdPartyPayoutDate ? data.thirdPartyPayoutDate : null,
    detached_trailer_id: data.detachedTrailerId ? Number(data.detachedTrailerId) : null,
    ctes: data.ctes.map((cte) => ({
      cte_type: cte.cteType,
      cte_number: cte.cteNumber.trim(),
      cte_series: cte.cteSeries.trim(),
      complemented_cte_number:
        cte.cteType === 'FREIGHT_COMPLEMENT' ? cte.complementedCteNumber.trim() : null,
      net_freight: parseDecimalInput(cte.netFreight),
      insurance_amount: parseDecimalInput(cte.insuranceAmount),
      toll_amount: parseDecimalInput(cte.tollAmount),
      icms_amount: parseDecimalInput(cte.icmsAmount),
    })),
  };
}

export const travelService = {
  async list(): Promise<TravelRecord[]> {
    const response = await api.get<{ travels: ApiTravel[] }>('/api/travels');
    return response.data.travels.map(mapTravel);
  },

  async options(): Promise<TravelOptions> {
    const response = await api.get<ApiOptions>('/api/travels/options');
    return {
      tractors: response.data.tractors.map((item) => ({
        id: item.id,
        plate: item.plate,
        fleetNumber: item.fleet_number ?? '',
      })),
      trailers: response.data.trailers.map((item) => ({
        id: item.id,
        plate: item.plate,
        fleetNumber: item.fleet_number ?? '',
      })),
      drivers: response.data.drivers.map((item) => ({
        id: item.id,
        employeeCode: item.employee_code,
        name: item.name,
      })),
      shippers: response.data.shippers.map(mapShipper),
      filterShippers: response.data.filter_shippers.map(mapShipper),
      filterPlates: response.data.filter_plates,
      warnings: response.data.warnings ?? [],
    };
  },

  async cities(): Promise<TravelCityOption[]> {
    const response = await api.get<{ cities: ApiTravelCity[] }>('/api/travels/cities');
    return response.data.cities.map((city) => ({
      id: city.id,
      name: city.name,
      stateAbbreviation: city.state_abbreviation,
    }));
  },

  async createShipper(name: string): Promise<{ message: string; shipper: TravelOptionShipper }> {
    const response = await api.post<{ message: string; shipper: ApiShipper }>('/api/travels/shippers', {
      name,
    });
    return { message: response.data.message, shipper: mapShipper(response.data.shipper) };
  },

  async create(data: TravelFormData): Promise<{ message: string; travel: TravelRecord }> {
    const response = await api.post<{ message: string; travel: ApiTravel }>(
      '/api/travels',
      buildPayload(data),
    );
    return { message: response.data.message, travel: mapTravel(response.data.travel) };
  },

  async update(
    id: number,
    data: TravelFormData,
  ): Promise<{ message: string; travel: TravelRecord }> {
    const response = await api.put<{ message: string; travel: ApiTravel }>(
      `/api/travels/${id}`,
      buildPayload(data),
    );
    return { message: response.data.message, travel: mapTravel(response.data.travel) };
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/travels/${id}`);
  },
};

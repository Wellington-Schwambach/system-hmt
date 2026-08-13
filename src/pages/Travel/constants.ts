import type { CteType, TravelCteFormData, TravelFormData, TravelRecord } from './types';

export const CTE_TYPE_OPTIONS: Array<{ value: CteType; label: string }> = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'FREIGHT_COMPLEMENT', label: 'Complemento de frete' },
];

export function createEmptyCte(): TravelCteFormData {
  return {
    key: `cte-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    cteType: 'NORMAL',
    cteNumber: '',
    cteSeries: '1',
    netFreight: '',
    insuranceAmount: '',
    tollAmount: '',
    icmsAmount: '',
  };
}

export const INITIAL_TRAVEL_FORM: TravelFormData = {
  date: new Date().toISOString().slice(0, 10),
  receivedDate: '',
  origin: '',
  destination: '',
  shipperId: '',
  operationType: 'FLEET',
  vehicleId: '',
  driverOneId: '',
  driverTwoId: '',
  thirdPartyName: '',
  thirdPartyPlate: '',
  thirdPartyPayoutAmount: '',
  detachedTrailerId: '',
  ctes: [createEmptyCte()],
};

export const TRAVEL_STORAGE_KEY = 'henrique-transportes:travel-records';
export const INITIAL_TRAVEL_RECORDS: TravelRecord[] = [];

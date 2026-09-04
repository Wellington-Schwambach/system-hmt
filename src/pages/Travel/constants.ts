import type { CteType, TravelCteFormData, TravelFormData, TravelFreightType, TravelRecord } from './types';


export const FREIGHT_TYPE_OPTIONS: Array<{ value: TravelFreightType; label: string }> = [
  { value: 'CABOTAGE', label: 'Cabotagem' },
  { value: 'EXPORT_PORT', label: 'Exportação Porto' },
  { value: 'OTHER', label: 'Outros' },
];

export const CST_OPTIONS = [
  { value: '00', label: '00 - Tributação normal ICMS' },
  { value: '90', label: '90 - ICMS outros' },
  { value: '60', label: '60 - ICMS cobrado anteriormente por substituição tributária' },
  { value: '41', label: '41 - ICMS não tributada' },
  { value: '40', label: '40 - ICMS isenção' },
  { value: '51', label: '51 - ICMS diferido' },
  { value: '20', label: '20 - Tributação com BC reduzida do ICMS' },
] as const;

export const CTE_TYPE_OPTIONS: Array<{ value: CteType; label: string }> = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'FREIGHT_COMPLEMENT', label: 'Complemento de frete' },
  { value: 'DAILY', label: 'Diária' },
];

export function createEmptyCte(): TravelCteFormData {
  return {
    key: `cte-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    cteType: 'NORMAL',
    cteNumber: '',
    cteSeries: '1',
    complementedCteNumber: '',
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
  freightType: '',
  cst: '',
  vehicleId: '',
  driverOneId: '',
  driverTwoId: '',
  thirdPartyName: '',
  thirdPartyPlate: '',
  thirdPartyPayoutAmount: '',
  thirdPartyPayoutDate: '',
  detachedTrailerId: '',
  ctes: [createEmptyCte()],
};

export const TRAVEL_STORAGE_KEY = 'henrique-transportes:travel-records';
export const INITIAL_TRAVEL_RECORDS: TravelRecord[] = [];

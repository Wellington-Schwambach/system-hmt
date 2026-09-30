import { api } from '../../services/api';
import type {
  ThirdPartyManagementDraft,
  ThirdPartyManagementRecord,
  ThirdPartyPaymentType,
} from './types';

interface ApiThirdPartyManagementRecord {
  id: number;
  travel_date: string;
  cte_numbers: string;
  origin: string;
  destination: string;
  third_party_name: string | null;
  third_party_plate: string | null;
  payment_type: ThirdPartyPaymentType | null;
  payout_amount: number;
  counter_freight_number: string | null;
  payout_date: string | null;
  paid: boolean;
  paid_at: string | null;
  gross_freight: number;
}

function mapRecord(record: ApiThirdPartyManagementRecord): ThirdPartyManagementRecord {
  return {
    id: record.id,
    travelDate: record.travel_date,
    cteNumbers: record.cte_numbers,
    origin: record.origin,
    destination: record.destination,
    thirdPartyName: record.third_party_name?.trim() || 'Terceiro não informado',
    thirdPartyPlate: record.third_party_plate?.trim() || '',
    paymentType: record.payment_type ?? '',
    payoutAmount: Number(record.payout_amount ?? 0),
    counterFreightNumber: record.counter_freight_number ?? '',
    payoutDate: record.payout_date ?? '',
    paid: Boolean(record.paid),
    paidAt: record.paid_at ?? '',
    grossFreight: Number(record.gross_freight ?? 0),
  };
}

export const thirdPartyManagementService = {
  async list(): Promise<ThirdPartyManagementRecord[]> {
    const response = await api.get<{ records: ApiThirdPartyManagementRecord[] }>('/api/third-party-management');
    return response.data.records.map(mapRecord);
  },

  async update(id: number, draft: ThirdPartyManagementDraft): Promise<ThirdPartyManagementRecord> {
    const response = await api.patch<{ record: ApiThirdPartyManagementRecord }>(`/api/third-party-management/${id}`, {
      payment_type: draft.paymentType || null,
      counter_freight_number: draft.counterFreightNumber.trim() || null,
      payout_date: draft.payoutDate || null,
    });
    return mapRecord(response.data.record);
  },

  async markPaid(id: number): Promise<ThirdPartyManagementRecord> {
    const response = await api.patch<{ record: ApiThirdPartyManagementRecord }>(`/api/third-party-management/${id}/paid`);
    return mapRecord(response.data.record);
  },
};

export type ThirdPartyPaymentType = '' | 'ADVANCE' | 'BALANCE';
export type ThirdPartyPaidFilter = 'ALL' | 'OPEN' | 'PAID';

export interface ThirdPartyManagementRecord {
  id: number;
  travelDate: string;
  cteNumbers: string;
  origin: string;
  destination: string;
  thirdPartyName: string;
  thirdPartyPlate: string;
  paymentType: ThirdPartyPaymentType;
  payoutAmount: number;
  counterFreightNumber: string;
  payoutDate: string;
  paid: boolean;
  paidAt: string;
  grossFreight: number;
}

export interface ThirdPartyManagementDraft {
  paymentType: ThirdPartyPaymentType;
  counterFreightNumber: string;
  payoutDate: string;
}

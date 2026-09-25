export type ValeCategory = 'ADVANCE' | 'FINE' | 'LOAN' | 'OTHER_DISCOUNT';
export type ValeStatus = 'PENDING' | 'SETTLED';

export interface ValeEmployeeOption {
  id: number;
  code: string | null;
  name: string;
  jobTitle: string | null;
  isDriver: boolean;
}

export interface ValeRecord {
  id: number;
  employeeId: number;
  employeeCode: string | null;
  employeeName: string;
  jobTitle: string | null;
  category: ValeCategory;
  date: string;
  discountMonth: string;
  withdrawalDate: string | null;
  description: string;
  finePlate: string | null;
  fineLocation: string | null;
  fineNumber: string | null;
  amount: number;
  installmentGroup: string | null;
  installmentNumber: number;
  installmentsTotal: number;
  status: ValeStatus;
  settlementId: number | null;
  settlementStartDate: string | null;
  settlementEndDate: string | null;
  invoiced: boolean;
  invoicedAt: string | null;
  canEdit: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ValeFormData {
  employeeId: string;
  category: ValeCategory;
  date: string;
  discountStartMonth: string;
  description: string;
  amount: string;
  installments: string;
  finePlate: string;
  fineLocation: string;
  fineNumber: string;
}

export interface ValeHistoryEvent {
  id: number;
  recordId: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'SETTLED' | 'REOPENED' | 'INVOICED';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  userName: string | null;
  occurredAt: string;
}

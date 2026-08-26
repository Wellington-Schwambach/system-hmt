export type ShipperStatus = 'ACTIVE' | 'INACTIVE';
export type ShipperTab = 'FORM' | 'LIST';

export interface ShipperDocumentRecord {
  id: number;
  name: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShipperRecord {
  id: number;
  name: string;
  displayColor: string;
  receiptTermDays: number | null;
  status: ShipperStatus;
  travelsCount: number;
  documents: ShipperDocumentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipperFormData {
  name: string;
  displayColor: string;
  receiptTermDays: string;
  status: ShipperStatus;
}

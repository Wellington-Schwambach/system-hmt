export type ShipperStatus = 'ACTIVE' | 'INACTIVE';
export type ShipperTab = 'FORM' | 'LIST';

export interface ShipperRecord {
  id: number;
  name: string;
  displayColor: string;
  status: ShipperStatus;
  travelsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShipperFormData {
  name: string;
  displayColor: string;
  status: ShipperStatus;
}

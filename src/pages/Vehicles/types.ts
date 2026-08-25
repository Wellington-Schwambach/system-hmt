export type VehicleTab = 'FORM' | 'LIST';

export type VehicleType = 'TRACTOR' | 'TRAILER' | 'OTHER';

export type VehicleFuelType = 'DIESEL' | 'FLEX' | 'GASOLINE' | 'ELECTRIC' | 'OTHER';

export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type VehiclePlateEndFilter = 'ALL' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface VehicleCrlv {
  name: string;
  mimeType: string | null;
  size: number | null;
  validUntil: string;
}

export interface VehicleRecord {
  id: number;
  fleetNumber: string;
  plate: string;
  type: VehicleType;
  brand: string;
  model: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  chassis: string;
  renavam: string;
  fuelType: VehicleFuelType;
  loadCapacityKg: number;
  tareKg: number;
  currentKm: number;
  status: VehicleStatus;
  opentechExpiryDate: string;
  angelliraExpiryDate: string;
  licensingExpiryDate: string;
  tachographExpiryDate: string;
  notes: string;
  crlv: VehicleCrlv | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  fleetNumber: string;
  plate: string;
  type: VehicleType | '';
  brand: string;
  model: string;
  manufactureYear: string;
  modelYear: string;
  color: string;
  chassis: string;
  renavam: string;
  fuelType: VehicleFuelType | '';
  loadCapacityKg: string;
  tareKg: string;
  currentKm: string;
  status: VehicleStatus;
  opentechExpiryDate: string;
  angelliraExpiryDate: string;
  licensingExpiryDate: string;
  tachographExpiryDate: string;
  notes: string;
  crlvFile: File | null;
  crlvValidUntil: string;
  removeCrlv: boolean;
}

export interface VehicleOperationResult {
  success: boolean;
  error?: string;
}

export interface VehicleFeedback {
  type: 'success' | 'error';
  message: string;
}

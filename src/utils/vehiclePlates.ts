const VEHICLES_STORAGE_KEY = 'hmt-vehicles';

export const DEFAULT_VEHICLE_PLATES = ['SKT8H52', 'ABC1D23', 'DEF4G56'] as const;

interface StoredVehicleCandidate {
  plate?: unknown;
}

function normalizePlate(value: string): string {
  return value
    .trim()
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z0-9]/g, '');
}

function loadStoredVehiclePlates(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedVehicles = window.localStorage.getItem(VEHICLES_STORAGE_KEY);

    if (!storedVehicles) {
      return [];
    }

    const parsedVehicles = JSON.parse(storedVehicles) as unknown;

    if (!Array.isArray(parsedVehicles)) {
      return [];
    }

    return parsedVehicles
      .map((vehicle) => (vehicle as StoredVehicleCandidate).plate)
      .filter((plate): plate is string => typeof plate === 'string')
      .map(normalizePlate)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function getVehiclePlateOptions(additionalPlates: readonly string[] = []): string[] {
  const normalizedAdditionalPlates = additionalPlates.map(normalizePlate).filter(Boolean);

  return Array.from(
    new Set([
      ...DEFAULT_VEHICLE_PLATES,
      ...loadStoredVehiclePlates(),
      ...normalizedAdditionalPlates,
    ]),
  ).sort((plateA, plateB) => plateA.localeCompare(plateB, 'pt-BR'));
}

import type { FuelFilter } from '../../types';

export interface FuelFiltersProps {
  filter: FuelFilter;
  plateFilter: string;
  plateOptions: string[];
  searchTerm: string;
  onFilterChange: (filter: FuelFilter) => void;
  onPlateFilterChange: (plate: string) => void;
  onSearchChange: (value: string) => void;
}

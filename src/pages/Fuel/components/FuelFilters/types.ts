import type { FuelFilter } from '../../types';

export interface FuelFiltersProps {
  filter: FuelFilter;
  plateFilter: string[];
  plateOptions: string[];
  billingMonthFilter: string;
  billingMonthOptions: string[];
  searchTerm: string;
  onFilterChange: (filter: FuelFilter) => void;
  onPlateFilterChange: (plates: string[]) => void;
  onBillingMonthFilterChange: (month: string) => void;
  onSearchChange: (value: string) => void;
}

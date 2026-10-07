import type { FuelCompanyUnit, FuelFilter } from '../../types';

export interface FuelFiltersProps {
  filter: FuelFilter;
  plateFilter: string[];
  plateOptions: string[];
  billingMonthFilter: string;
  billingMonthOptions: string[];
  companyUnitFilter: 'ALL' | FuelCompanyUnit;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
  onFilterChange: (filter: FuelFilter) => void;
  onPlateFilterChange: (plates: string[]) => void;
  onBillingMonthFilterChange: (month: string) => void;
  onCompanyUnitFilterChange: (unit: 'ALL' | FuelCompanyUnit) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

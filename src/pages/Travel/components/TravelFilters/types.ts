import type {
  TravelCompanyUnit,
  TravelCteTypeFilter,
  TravelOptionShipper,
} from '../../types';

export interface TravelFiltersProps {
  shipperFilter: string[];
  shipperOptions: TravelOptionShipper[];
  plateFilter: string[];
  plateOptions: string[];
  cteTypeFilter: TravelCteTypeFilter;
  companyUnitFilter: 'ALL' | TravelCompanyUnit;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
  onShipperFilterChange: (filter: string[]) => void;
  onPlateFilterChange: (plates: string[]) => void;
  onCteTypeFilterChange: (filter: TravelCteTypeFilter) => void;
  onCompanyUnitFilterChange: (filter: 'ALL' | TravelCompanyUnit) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

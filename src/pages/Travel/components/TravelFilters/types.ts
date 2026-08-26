import type {
  TravelCteTypeFilter,
  TravelOptionShipper,
} from '../../types';

export interface TravelFiltersProps {
  shipperFilter: string[];
  shipperOptions: TravelOptionShipper[];
  plateFilter: string[];
  plateOptions: string[];
  cteTypeFilter: TravelCteTypeFilter;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
  onShipperFilterChange: (filter: string[]) => void;
  onPlateFilterChange: (plates: string[]) => void;
  onCteTypeFilterChange: (filter: TravelCteTypeFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

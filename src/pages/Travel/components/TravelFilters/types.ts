import type {
  TravelCteTypeFilter,
  TravelOptionShipper,
  TravelShipperFilter,
} from '../../types';

export interface TravelFiltersProps {
  shipperFilter: TravelShipperFilter;
  shipperOptions: TravelOptionShipper[];
  plateFilter: string;
  plateOptions: string[];
  cteTypeFilter: TravelCteTypeFilter;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
  onShipperFilterChange: (filter: TravelShipperFilter) => void;
  onPlateFilterChange: (plate: string) => void;
  onCteTypeFilterChange: (filter: TravelCteTypeFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

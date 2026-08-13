import { Search } from 'lucide-react';

import { CTE_TYPE_OPTIONS } from '../../constants';
import type { TravelCteTypeFilter } from '../../types';
import type { TravelFiltersProps } from './types';
import {
  FilterLabel,
  FiltersBar,
  SearchBox,
  SearchIcon,
  SearchInput,
  Select,
  SelectWrapper,
} from './styles';

export function TravelFilters({
  shipperFilter,
  shipperOptions,
  plateFilter,
  plateOptions,
  cteTypeFilter,
  searchTerm,
  onShipperFilterChange,
  onPlateFilterChange,
  onCteTypeFilterChange,
  onSearchChange,
}: TravelFiltersProps) {
  return (
    <FiltersBar>
      <SelectWrapper>
        <FilterLabel htmlFor="travel-plate-filter">Placa</FilterLabel>
        <Select
          id="travel-plate-filter"
          value={plateFilter}
          onChange={(event) => onPlateFilterChange(event.target.value)}
          aria-label="Filtrar viagens por placa"
        >
          <option value="ALL">Todas as placas</option>
          {plateOptions.map((plate) => (
            <option key={plate} value={plate}>
              {plate}
            </option>
          ))}
        </Select>
      </SelectWrapper>

      <SelectWrapper>
        <FilterLabel htmlFor="travel-shipper-filter">Embarcador</FilterLabel>
        <Select
          id="travel-shipper-filter"
          value={shipperFilter}
          onChange={(event) => onShipperFilterChange(event.target.value)}
          aria-label="Filtrar viagens por embarcador"
        >
          <option value="ALL">Todos os embarcadores</option>
          {shipperOptions.map((shipper) => (
            <option key={shipper.id} value={String(shipper.id)}>
              {shipper.name}
            </option>
          ))}
        </Select>
      </SelectWrapper>

      <SelectWrapper>
        <FilterLabel htmlFor="travel-cte-type-filter">Tipo de CT-e</FilterLabel>
        <Select
          id="travel-cte-type-filter"
          value={cteTypeFilter}
          onChange={(event) =>
            onCteTypeFilterChange(event.target.value as TravelCteTypeFilter)
          }
          aria-label="Filtrar viagens por tipo de CT-e"
        >
          <option value="ALL">Todos os tipos</option>
          {CTE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </SelectWrapper>

      <SearchBox>
        <SearchIcon aria-hidden="true">
          <Search size={18} />
        </SearchIcon>
        <SearchInput
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por placa, motorista, origem, destino, CT-e ou embarcador"
          aria-label="Buscar viagens"
        />
      </SearchBox>
    </FiltersBar>
  );
}

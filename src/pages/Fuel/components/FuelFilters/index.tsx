import { Search } from 'lucide-react';

import type { FuelFilter } from '../../types';
import type { FuelFiltersProps } from './types';
import {
  FilterButton,
  FilterGroup,
  FilterLabel,
  FiltersBar,
  SearchBox,
  SearchIcon,
  SearchInput,
  Select,
  SelectWrapper,
} from './styles';

const FILTERS: Array<{ value: FuelFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'WITH_ARLA', label: 'Com Arla' },
  { value: 'DIESEL_ONLY', label: 'Somente Diesel' },
];

export function FuelFilters({
  filter,
  plateFilter,
  plateOptions,
  searchTerm,
  onFilterChange,
  onPlateFilterChange,
  onSearchChange,
}: FuelFiltersProps) {
  return (
    <FiltersBar>
      <SelectWrapper>
        <FilterLabel htmlFor="fuel-plate-filter">Placa</FilterLabel>
        <Select
          id="fuel-plate-filter"
          value={plateFilter}
          onChange={(event) => onPlateFilterChange(event.target.value)}
          aria-label="Filtrar abastecimentos por placa"
        >
          <option value="ALL">Todas as placas</option>
          {plateOptions.map((plate) => (
            <option key={plate} value={plate}>
              {plate}
            </option>
          ))}
        </Select>
      </SelectWrapper>

      <FilterGroup aria-label="Filtrar abastecimentos por composição">
        {FILTERS.map((item) => (
          <FilterButton
            key={item.value}
            type="button"
            $active={filter === item.value}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </FilterButton>
        ))}
      </FilterGroup>

      <SearchBox>
        <SearchIcon aria-hidden="true">
          <Search size={18} />
        </SearchIcon>
        <SearchInput
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por posto, placa, motorista ou KM"
          aria-label="Buscar abastecimentos"
        />
      </SearchBox>
    </FiltersBar>
  );
}

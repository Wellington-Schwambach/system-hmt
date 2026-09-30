import { Search } from 'lucide-react';

import { CheckboxMultiSelect } from '../../../../components/CheckboxMultiSelect';

import { CTE_TYPE_OPTIONS } from '../../constants';
import type { TravelCteTypeFilter } from '../../types';
import type { TravelFiltersProps } from './types';
import {
  DateInput,
  DateRange,
  DateSeparator,
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
  dateFrom,
  dateTo,
  searchTerm,
  onShipperFilterChange,
  onPlateFilterChange,
  onCteTypeFilterChange,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
}: TravelFiltersProps) {
  return (
    <FiltersBar>
      <SelectWrapper>
        <FilterLabel>Placa</FilterLabel>
        <CheckboxMultiSelect
          value={plateFilter}
          options={plateOptions.map((plate) => ({ value: plate, label: plate }))}
          allLabel="Todas as placas"
          searchPlaceholder="Pesquisar placa..."
          ariaLabel="Filtrar viagens por uma ou mais placas"
          onChange={onPlateFilterChange}
        />
      </SelectWrapper>

      <SelectWrapper>
        <FilterLabel>Embarcador</FilterLabel>
        <CheckboxMultiSelect
          value={shipperFilter}
          options={shipperOptions.map((shipper) => ({
            value: String(shipper.id),
            label: shipper.name,
            searchText: shipper.name,
          }))}
          allLabel="Todos os embarcadores"
          searchPlaceholder="Pesquisar embarcador..."
          ariaLabel="Filtrar viagens por um ou mais embarcadores"
          onChange={onShipperFilterChange}
        />
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

      <SelectWrapper>
        <FilterLabel>Período</FilterLabel>
        <DateRange>
          <DateInput
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            aria-label="Filtrar viagens a partir da data"
            title="Data inicial"
          />
          <DateSeparator>até</DateSeparator>
          <DateInput
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            aria-label="Filtrar viagens até a data"
            title="Data final"
          />
        </DateRange>
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

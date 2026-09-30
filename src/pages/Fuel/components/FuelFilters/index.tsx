import { Search } from 'lucide-react';

import { CheckboxMultiSelect } from '../../../../components/CheckboxMultiSelect';
import type { FuelFilter } from '../../types';
import { formatBillingMonth } from '../../utils';
import type { FuelFiltersProps } from './types';
import {
  DateInput,
  DateRange,
  DateSeparator,
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
  { value: 'N', label: 'Não faturado' },
  { value: 'P', label: 'Metade faturado' },
  { value: 'F', label: 'Faturado' },
];

export function FuelFilters({
  filter,
  plateFilter,
  plateOptions,
  billingMonthFilter,
  billingMonthOptions,
  dateFrom,
  dateTo,
  searchTerm,
  onFilterChange,
  onPlateFilterChange,
  onBillingMonthFilterChange,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
}: FuelFiltersProps) {
  return (
    <FiltersBar>
      <SelectWrapper>
        <FilterLabel>Placa</FilterLabel>
        <CheckboxMultiSelect
          value={plateFilter}
          options={plateOptions.map((plate) => ({ value: plate, label: plate }))}
          allLabel="Todos os cavalos"
          searchPlaceholder="Pesquisar placa..."
          ariaLabel="Filtrar abastecimentos por um ou mais cavalos"
          onChange={onPlateFilterChange}
        />
      </SelectWrapper>

      <SelectWrapper>
        <FilterLabel htmlFor="fuel-billing-month-filter">Mês faturado</FilterLabel>
        <Select
          id="fuel-billing-month-filter"
          value={billingMonthFilter}
          onChange={(event) => onBillingMonthFilterChange(event.target.value)}
          aria-label="Filtrar abastecimentos pelo mês faturado"
        >
          <option value="ALL">Todos os meses</option>
          {billingMonthOptions.map((month) => (
            <option key={month} value={month}>
              {formatBillingMonth(month)}
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
            aria-label="Filtrar abastecimentos a partir da data"
            title="Data inicial"
          />
          <DateSeparator>até</DateSeparator>
          <DateInput
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            aria-label="Filtrar abastecimentos até a data"
            title="Data final"
          />
        </DateRange>
      </SelectWrapper>

      <FilterGroup aria-label="Filtrar abastecimentos por faturamento">
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

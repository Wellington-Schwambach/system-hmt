import type { ChangeEvent, FocusEvent } from 'react';
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

const maskDateBR = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;

  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

const formatDateBR = (value: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const parseDateBR = (value: string): string | null => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;

  const [dayText, monthText, yearText] = value.split('/');
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return null;

  const lastDayOfMonth = new Date(year, month, 0).getDate();
  if (day > lastDayOfMonth) return null;

  return `${yearText}-${monthText}-${dayText}`;
};

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
  const handleDateInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => {
    const formatted = maskDateBR(event.currentTarget.value);
    event.currentTarget.value = formatted;

    if (!formatted) {
      onChange('');
      return;
    }

    if (formatted.length === 10) {
      const parsedDate = parseDateBR(formatted);
      if (parsedDate) onChange(parsedDate);
    }
  };

  const handleDateInputBlur = (
    event: FocusEvent<HTMLInputElement>,
    currentValue: string,
  ) => {
    const value = event.currentTarget.value;

    if (value && !parseDateBR(value)) {
      event.currentTarget.value = formatDateBR(currentValue);
    }
  };

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
            key={`fuel-date-from-${dateFrom}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            defaultValue={formatDateBR(dateFrom)}
            onChange={(event) => handleDateInputChange(event, onDateFromChange)}
            onBlur={(event) => handleDateInputBlur(event, dateFrom)}
            aria-label="Filtrar abastecimentos a partir da data"
            title="Data inicial no formato dd/mm/aaaa"
          />
          <DateSeparator>até</DateSeparator>
          <DateInput
            key={`fuel-date-to-${dateTo}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            defaultValue={formatDateBR(dateTo)}
            onChange={(event) => handleDateInputChange(event, onDateToChange)}
            onBlur={(event) => handleDateInputBlur(event, dateTo)}
            aria-label="Filtrar abastecimentos até a data"
            title="Data final no formato dd/mm/aaaa"
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

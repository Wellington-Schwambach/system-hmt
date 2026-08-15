import type { ChangeEvent, FocusEvent } from 'react';
import { Search } from 'lucide-react';

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

const maskDateBR = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }

  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

const formatDateBR = (value: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return '';
  }

  const [year, month, day] = value.split('-');

  return `${day}/${month}/${year}`;
};

const parseDateBR = (value: string): string | null => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return null;
  }

  const [dayText, monthText, yearText] = value.split('/');
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) {
    return null;
  }

  const lastDayOfMonth = new Date(year, month, 0).getDate();

  if (day > lastDayOfMonth) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
};

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

      if (parsedDate) {
        onChange(parsedDate);
      }
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

      <SelectWrapper>
        <FilterLabel>Período</FilterLabel>
        <DateRange>
          <DateInput
            key={`date-from-${dateFrom}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            defaultValue={formatDateBR(dateFrom)}
            onChange={(event) => handleDateInputChange(event, onDateFromChange)}
            onBlur={(event) => handleDateInputBlur(event, dateFrom)}
            aria-label="Filtrar viagens a partir da data"
            title="Data inicial no formato dd/mm/aaaa"
          />
          <DateSeparator>até</DateSeparator>
          <DateInput
            key={`date-to-${dateTo}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            defaultValue={formatDateBR(dateTo)}
            onChange={(event) => handleDateInputChange(event, onDateToChange)}
            onBlur={(event) => handleDateInputBlur(event, dateTo)}
            aria-label="Filtrar viagens até a data"
            title="Data final no formato dd/mm/aaaa"
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

import { CalendarRange } from 'lucide-react';

import { formatDate, formatMonth } from '../../utils';
import type { SettlementFiltersProps } from './types';
import {
  ActivePeriod,
  Container,
  CustomPeriodButton,
  Field,
  Label,
  MonthInput,
  Select,
} from './styles';

export function SettlementFilters({
  drivers,
  selectedDriver,
  periodMode,
  selectedMonth,
  startDate,
  endDate,
  onDriverChange,
  onMonthChange,
  onOpenCustomPeriod,
}: SettlementFiltersProps) {
  return (
    <Container>
      <Field>
        <Label htmlFor="settlement-driver">Motorista</Label>
        <Select
          id="settlement-driver"
          value={selectedDriver}
          onChange={(event) => onDriverChange(event.target.value)}
        >
          {drivers.length === 0 && <option value="">Nenhum motorista cadastrado</option>}
          {drivers.map((driver) => (
            <option key={driver} value={driver}>
              {driver}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label htmlFor="settlement-month">Competência</Label>
        <MonthInput
          id="settlement-month"
          type="month"
          lang="pt-BR"
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </Field>

      <CustomPeriodButton type="button" onClick={onOpenCustomPeriod}>
        <CalendarRange size={17} aria-hidden="true" />
        Período personalizado
      </CustomPeriodButton>

      <ActivePeriod>
        <CalendarRange size={15} aria-hidden="true" />
        {periodMode === 'MONTH' ? (
          <span>
            Exibindo a competência <strong>{formatMonth(selectedMonth)}</strong>
          </span>
        ) : (
          <span>
            Exibindo de <strong>{formatDate(startDate)}</strong> até{' '}
            <strong>{formatDate(endDate)}</strong>
          </span>
        )}
      </ActivePeriod>
    </Container>
  );
}

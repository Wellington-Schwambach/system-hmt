import { useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';

import { CalendarButton, Container, NativeDateInput, VisibleInput } from './styles';
import type { DateInputProps } from './types';
import {
  applyBrazilianDateMask,
  brazilianDateToIso,
  formatIsoDateToBrazilian,
  isValidBrazilianDate,
} from './utils';

export function DateInput({
  value,
  onValueChange,
  id,
  required,
  disabled,
  name,
  'aria-label': ariaLabel,
  ...inputProps
}: DateInputProps) {
  const visibleInputRef = useRef<HTMLInputElement>(null);
  const nativeDateInputRef = useRef<HTMLInputElement>(null);
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const displayValue = draftValue ?? formatIsoDateToBrazilian(value);

  function updateValidity(nextValue: string) {
    const input = visibleInputRef.current;

    if (!input) {
      return;
    }

    if (!nextValue) {
      input.setCustomValidity('');
      return;
    }

    if (nextValue.length < 10) {
      input.setCustomValidity('Informe a data completa no formato DD/MM/AAAA.');
      return;
    }

    input.setCustomValidity(
      isValidBrazilianDate(nextValue) ? '' : 'Informe uma data válida no formato DD/MM/AAAA.',
    );
  }

  function handleVisibleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const maskedValue = applyBrazilianDateMask(event.target.value);

    setDraftValue(maskedValue);
    updateValidity(maskedValue);

    if (!maskedValue) {
      onValueChange('');
      setDraftValue(null);
      return;
    }

    if (maskedValue.length === 10 && isValidBrazilianDate(maskedValue)) {
      onValueChange(brazilianDateToIso(maskedValue));
      setDraftValue(null);
    }
  }

  function handleVisibleBlur() {
    updateValidity(displayValue);
  }

  function handleNativeDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    onValueChange(nextValue);
    setDraftValue(null);
    visibleInputRef.current?.setCustomValidity('');
  }

  function handleOpenCalendar() {
    const nativeInput = nativeDateInputRef.current;

    if (!nativeInput || disabled) {
      return;
    }

    try {
      if (typeof nativeInput.showPicker === 'function') {
        nativeInput.showPicker();
        return;
      }

      nativeInput.click();
    } catch {
      visibleInputRef.current?.focus();
    }
  }

  return (
    <Container>
      <CalendarButton
        type="button"
        onClick={handleOpenCalendar}
        aria-label="Abrir calendário"
        disabled={disabled}
      >
        <CalendarDays size={18} aria-hidden="true" />
      </CalendarButton>

      <VisibleInput
        {...inputProps}
        ref={visibleInputRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/AAAA"
        value={displayValue}
        onChange={handleVisibleChange}
        onBlur={handleVisibleBlur}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel ?? 'Data no formato dia, mês e ano'}
        maxLength={10}
      />

      <NativeDateInput
        ref={nativeDateInputRef}
        type="date"
        lang="pt-BR"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={handleNativeDateChange}
        disabled={disabled}
      />
    </Container>
  );
}

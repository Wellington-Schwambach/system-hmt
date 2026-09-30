import { DateField } from './styles';
import type { DateInputProps } from './types';

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
  return (
    <DateField
      {...inputProps}
      id={id}
      name={name}
      type="date"
      lang="pt-BR"
      value={value || ''}
      onChange={(event) => onValueChange(event.target.value)}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel ?? 'Data'}
    />
  );
}

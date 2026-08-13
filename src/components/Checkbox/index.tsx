import { CheckboxInput, CheckboxLabel } from './styles';
import type { CheckboxProps } from './types';

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <CheckboxLabel htmlFor={checkboxId}>
      <CheckboxInput id={checkboxId} type="checkbox" {...props} />
      <span>{label}</span>
    </CheckboxLabel>
  );
}

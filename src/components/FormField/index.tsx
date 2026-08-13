import {
  FieldError,
  FieldGroup,
  FieldLabel,
  InputElement,
  InputShell,
  TrailingSlot,
} from './styles';
import type { FormFieldProps } from './types';

export function FormField({
  id,
  label,
  error,
  leadingIcon,
  trailingAction,
  ...inputProps
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <FieldGroup>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputShell $hasError={Boolean(error)}>
        {leadingIcon}
        <InputElement
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          {...inputProps}
        />
        {trailingAction ? <TrailingSlot>{trailingAction}</TrailingSlot> : null}
      </InputShell>
      {error ? (
        <FieldError id={errorId} role="alert">
          {error}
        </FieldError>
      ) : null}
    </FieldGroup>
  );
}

import styled from 'styled-components';

interface InputShellProps {
  $hasError: boolean;
}

export const FieldGroup = styled.div`
  display: grid;
  gap: 0.65rem;
`;

export const FieldLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 650;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

export const InputShell = styled.div<InputShellProps>`
  min-height: 3.7rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0 1rem;
  border: 1px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ $hasError, theme }) =>
    $hasError ? theme.colors.danger : theme.colors.dashboardTextMuted};
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;

  &:focus-within {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.brandGreen};
    box-shadow: 0 0 0 0.22rem
      ${({ $hasError, theme }) =>
        $hasError ? theme.colors.dangerSoft : theme.colors.brandGreenFocus};
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }
`;

export const InputElement = styled.input`
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
  }
`;

export const TrailingSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const FieldError = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.84rem;
  font-weight: 600;
`;

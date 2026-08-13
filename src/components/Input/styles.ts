import styled, { css } from 'styled-components';

interface WrapperProps {
  $hasError: boolean;
  $fullWidth?: boolean;
}

export const Wrapper = styled.div<WrapperProps>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
`;

export const InputContainer = styled.div<WrapperProps>`
  display: flex;
  align-items: center;

  height: 3.5rem;

  padding: 0 1rem;

  border-radius: ${({ theme }) => theme.borderRadius.md};

  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};

  background: ${({ theme }) => theme.colors.surfaceElevated};

  transition: 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};

    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }

  svg {
    color: #94a3b8;
    font-size: 1.1rem;
  }
`;

export const StyledInput = styled.input`
  flex: 1;

  border: none;

  background: transparent;

  padding: 0 0.75rem;

  font-size: 1rem;

  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const HelperText = styled.small`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ErrorText = styled.small`
  color: ${({ theme }) => theme.colors.danger};
`;

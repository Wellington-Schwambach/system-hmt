import styled, { css } from 'styled-components';

import type { ButtonVariant } from './types';

interface StyledButtonProps {
  $variant: ButtonVariant;
  $fullWidth: boolean;
}

const variants = {
  primary: css`
    color: ${({ theme }) => theme.colors.white};
    border-color: transparent;
    background: linear-gradient(
      100deg,
      ${({ theme }) => theme.colors.brandGreen} 0%,
      ${({ theme }) => theme.colors.brandGreenDark} 100%
    );
    box-shadow: ${({ theme }) => theme.shadow.green};

    &:hover {
      transform: translateY(-1px);
      filter: brightness(1.03);
    }
  `,
  secondary: css`
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    border-color: ${({ theme }) => theme.colors.dashboardBorderStrong};
    background: ${({ theme }) => theme.colors.surfaceGlass};

    &:hover {
      color: ${({ theme }) => theme.colors.brandGreenDark};
      border-color: ${({ theme }) => theme.colors.brandGreen};
      background: ${({ theme }) => theme.colors.brandGreenSoft};
    }
  `,
};

export const StyledButton = styled.button<StyledButtonProps>`
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-height: 3.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    background 160ms ease,
    filter 160ms ease;

  ${({ $variant }) => variants[$variant]}

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
  }
`;

import styled from 'styled-components';

export const ThemeButton = styled.button<{ $isDarkMode: boolean }>`
  min-height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.65rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ $isDarkMode, theme }) => ($isDarkMode ? theme.shadow.green : 'none')};
  font-size: 0.82rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  svg {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    transition: transform 220ms ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};

    svg {
      transform: rotate(12deg) scale(1.06);
    }
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  @media (max-width: 44rem) {
    width: 2.8rem;
    padding: 0;
  }

  @media (max-width: 36rem) {
    width: 2.65rem;
    min-height: 2.65rem;
  }
`;

export const ThemeButtonLabel = styled.span`
  @media (max-width: 44rem) {
    display: none;
  }
`;

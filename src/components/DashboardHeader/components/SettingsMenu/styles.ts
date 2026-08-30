import styled from 'styled-components';

interface SettingsButtonProps {
  $open: boolean;
}

export const SettingsButton = styled.button<SettingsButtonProps>`
  min-height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.65rem 0.9rem;
  border: 1px solid
    ${({ $open, theme }) => ($open ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong)};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $open, theme }) =>
    $open ? theme.colors.brandGreenDark : theme.colors.dashboardText};
  background: ${({ $open, theme }) => ($open ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  font-size: 0.82rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  @media (max-width: 36rem) {
    width: 2.65rem;
    min-height: 2.65rem;
    padding: 0;

    > span:not([aria-hidden='true']) {
      display: none;
    }
  }
`;

export const Chevron = styled.span<{ $open: boolean }>`
  display: grid;
  place-items: center;
  transition: transform 160ms ease;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};

  @media (max-width: 36rem) {
    display: none;
  }
`;

import styled, { keyframes } from 'styled-components';

interface DropdownItemProps {
  $danger?: boolean;
}

const dropdownEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-0.45rem) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const DropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  z-index: 9999;
  width: min(19rem, calc(100vw - 2rem));
  padding: 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surfaceGlassStrong};
  box-shadow:
    0 1.25rem 3rem rgba(15, 23, 42, 0.14),
    0 0.25rem 0.75rem rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(1rem);
  transform-origin: top right;
  animation: ${dropdownEnter} 160ms ease-out;
`;

export const DropdownHeader = styled.div`
  padding: 0.75rem 0.8rem 0.65rem;
`;

export const DropdownTitle = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.92rem;
  font-weight: 800;
`;

export const DropdownDescription = styled.span`
  display: block;
  margin-top: 0.2rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
  line-height: 1.45;
`;

export const DropdownDivider = styled.div`
  width: 100%;
  height: 1px;
  margin: 0.35rem 0;
  background: ${({ theme }) => theme.colors.dashboardBorder};
`;

export const DropdownItem = styled.button<DropdownItemProps>`
  width: 100%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 0;
  border-radius: 0.75rem;
  color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.dashboardText)};
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.brandGreenDark)};
    background: ${({ $danger, theme }) =>
      $danger ? 'rgba(204, 61, 61, 0.08)' : theme.colors.brandGreenSoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }
`;

export const DropdownItemIcon = styled.span<{ $danger?: boolean }>`
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
  color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.brandGreenDark)};
  background: ${({ $danger, theme }) =>
    $danger ? 'rgba(204, 61, 61, 0.08)' : theme.colors.brandGreenSoft};
`;

export const DropdownItemContent = styled.span`
  min-width: 0;
  flex: 1;
`;

export const DropdownItemTitle = styled.strong`
  display: block;
  color: inherit;
  font-size: 0.84rem;
  font-weight: 750;
`;

export const DropdownItemDescription = styled.span`
  display: block;
  margin-top: 0.15rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  line-height: 1.35;
`;

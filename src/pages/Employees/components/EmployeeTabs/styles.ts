import styled from 'styled-components';

export const TabsContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.1rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  overflow-x: auto;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.65rem 1rem;
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.brandGreenBorder : 'transparent')};
  border-radius: 0.8rem;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.brandGreenDark : theme.colors.dashboardTextMuted};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : 'transparent')};
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }
`;

export const CountBadge = styled.span`
  min-width: 1.45rem;
  height: 1.45rem;
  display: inline-grid;
  place-items: center;
  padding: 0 0.35rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
`;

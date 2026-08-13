import styled from 'styled-components';

export const Tabs = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  max-width: 100%;
  padding: 0.3rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.95rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const Tab = styled.button<{ $active: boolean }>`
  min-height: 2.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.7rem;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.dashboardTextMuted};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.brandGreen : 'transparent'};
  font-size: 0.76rem;
  font-weight: 850;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease;

  &:hover {
    color: ${({ $active, theme }) =>
      $active ? theme.colors.white : theme.colors.brandGreenDark};
    background: ${({ $active, theme }) =>
      $active ? theme.colors.brandGreen : theme.colors.brandGreenSoft};
  }
`;

export const Count = styled.span`
  min-width: 1.45rem;
  min-height: 1.45rem;
  display: grid;
  place-items: center;
  padding: 0 0.3rem;
  border-radius: 999px;
  color: inherit;
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.67rem;
`;

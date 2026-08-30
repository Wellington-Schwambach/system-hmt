import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Card = styled.section`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.15rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  > div:first-child > span {
    display: block;
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.98rem;
`;

export const SearchWrapper = styled.label`
  position: relative;
  width: min(18rem, 100%);
`;

export const SearchIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.8rem;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  transform: translateY(-50%);
`;

export const SearchInput = styled.input`
  width: 100%;
  min-height: 2.55rem;
  padding: 0.55rem 0.75rem 0.55rem 2.35rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.78rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Scroll = styled.div`
  overflow-x: auto;

  @media (max-width: ${breakpoints.tablet}) {
    display: none;
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: 74rem;
  border-collapse: collapse;
`;

export const TH = styled.th`
  padding: 0.72rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.64rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const TD = styled.td<{
  $numeric?: boolean;
  $strong?: boolean;
  $highlight?: boolean;
}>`
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.brandGreenDark : theme.colors.dashboardText};
  font-size: 0.76rem;
  font-weight: ${({ $highlight, $strong }) => ($highlight || $strong ? 800 : 500)};
  font-variant-numeric: ${({ $numeric }) => ($numeric ? 'tabular-nums' : 'normal')};
  white-space: nowrap;
`;

export const DriverCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

export const DriverName = styled.span`
  color: inherit;
  font: inherit;
`;

export const DriverInlineActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export const IconActionButton = styled.button<{ $danger?: boolean }>`
  width: 1.8rem;
  height: 1.8rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid
    ${({ $danger, theme }) =>
      $danger ? theme.colors.dangerBorder : theme.colors.dashboardBorderStrong};
  border-radius: 0.5rem;
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
  transition:
    border-color 160ms ease,
    color 160ms ease,
    background 160ms ease;

  &:hover {
    border-color: ${({ $danger, theme }) =>
      $danger ? theme.colors.danger : theme.colors.brandGreen};
    color: ${({ $danger, theme }) =>
      $danger ? theme.colors.white : theme.colors.brandGreenDark};
    background: ${({ $danger, theme }) =>
      $danger ? theme.colors.danger : theme.colors.brandGreenSoft};
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 2.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong};
  border-radius: 0.6rem;
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.white : theme.colors.dashboardText};
  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.brandGreen : theme.colors.surfaceElevated};
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
`;

export const EmptyState = styled.div`
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding: 1.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.82rem;
`;

export const MobileList = styled.div`
  display: none;
  padding: 0.75rem;
  gap: 0.7rem;

  @media (max-width: ${breakpoints.tablet}) {
    display: grid;
  }
`;

export const MobileCard = styled.article`
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};


  ${Actions} {
    margin-top: 0.8rem;
  }
`;

export const MobileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;

  > div:first-child {
    min-width: 0;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.86rem;
  }

  span {
    display: block;
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
  }
`;

export const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.75rem;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const MobileLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
`;

export const MobileValue = styled.strong<{ $highlight?: boolean }>`
  display: block;
  margin-top: 0.15rem;
  color: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.brandGreenDark : theme.colors.dashboardText};
  font-size: 0.78rem;
`;

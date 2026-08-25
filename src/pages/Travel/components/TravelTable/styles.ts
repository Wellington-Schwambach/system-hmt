import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const TableCard = styled.section`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.35rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: ${breakpoints.mobile}) {
    display: none;
  }
`;

export const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 78rem;
  border-collapse: collapse;
`;

export const THead = styled.thead`
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

interface TableHeaderProps {
  $align?: 'left' | 'center' | 'right';
}

export const TH = styled.th<TableHeaderProps>`
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-align: ${({ $align = 'left' }) => $align};
  text-transform: uppercase;
  white-space: nowrap;
`;
export const TBody = styled.tbody``;

export const TR = styled.tr`
  transition: background 140ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  }
`;

interface TableCellProps {
  $align?: 'left' | 'center' | 'right';
}

export const TD = styled.td<TableCellProps>`
  padding: 0.85rem 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.8rem;
  text-align: ${({ $align = 'left' }) => $align};
  white-space: nowrap;
`;

export const NumericCell = styled(TD)`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

export const Route = styled.div`
  width: 14rem;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
`;

export const RoutePoint = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RouteArrow = styled.span`
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.brandGreen};
`;

export const ActionsCell = styled(TD)`
  width: 1%;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const EditButton = styled.button`
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease,
    transform 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }
`;

export const EmptyState = styled.div`
  padding: 3rem 1.25rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1.35rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  text-align: center;

  @media (max-width: ${breakpoints.mobile}) {
    display: none;
  }
`;


export const DeleteButton = styled.button`
  width: 2.35rem;
  min-height: 2.35rem;
  display: inline-grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  cursor: pointer;
  transition: transform 150ms ease, opacity 150ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: wait;
  }
`;

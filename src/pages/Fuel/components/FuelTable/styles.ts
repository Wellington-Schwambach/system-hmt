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
  min-width: 104rem;
  border-collapse: collapse;
`;

export const THead = styled.thead`
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const TH = styled.th`
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-align: left;
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

export const TD = styled.td`
  padding: 0.8rem 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.8rem;
  white-space: nowrap;
`;

export const NumericCell = styled(TD)`
  font-variant-numeric: tabular-nums;
`;

export const ActionsCell = styled(TD)`
  width: 1%;
`;

export const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const actionButtonStyles = `
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border-radius: 0.7rem;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease,
    transform 150ms ease;
`;

export const EditButton = styled.button`
  ${actionButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.surfaceElevated};

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

export const InvoiceButton = styled.button`
  ${actionButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.brandGreen};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.brandGreenDark};
    border-color: ${({ theme }) => theme.colors.brandGreenDark};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;


export const InvoicedLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
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
  ${actionButtonStyles}
  width: 2.35rem;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.danger};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

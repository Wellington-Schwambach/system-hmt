import styled from 'styled-components';

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
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.98rem;
`;

export const Count = styled.span`
  min-width: 2rem;
  min-height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.75rem;
  font-weight: 850;
`;

export const Scroll = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;
`;

export const TH = styled.th`
  padding: 0.72rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const TD = styled.td<{ $numeric?: boolean }>`
  padding: 0.72rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
  font-weight: ${({ $numeric }) => ($numeric ? 750 : 500)};
  font-variant-numeric: ${({ $numeric }) => ($numeric ? 'tabular-nums' : 'normal')};
  white-space: nowrap;
`;

export const RouteText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  strong {
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const TotalRow = styled.tfoot`
  td {
    padding: 0.9rem 0.75rem;
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    font-size: 0.8rem;
    font-weight: 850;
  }
`;

export const TotalValue = styled.td`
  color: ${({ theme }) => theme.colors.brandGreenDark} !important;
  font-size: 0.95rem !important;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const EmptyState = styled.div`
  display: grid;
  place-items: center;
  min-height: 10rem;
  padding: 1.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.82rem;
`;

import styled from 'styled-components';

export const Card = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.85rem;
  }

  span {
    display: block;
    margin-top: 0.12rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.63rem;
  }
`;

export const RefreshButton = styled.button`
  min-height: 2.15rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: transparent;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
`;

export const Scroll = styled.div`
  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;

  th,
  td {
    padding: 0.62rem 0.72rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    text-align: left;
    vertical-align: middle;
    font-size: 0.65rem;
  }

  th {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    background: ${({ theme }) => theme.colors.dashboardSurface};
    font-size: 0.58rem;
    text-transform: uppercase;
  }

  td {
    color: ${({ theme }) => theme.colors.dashboardText};
  }
`;

export const Badge = styled.span<{ $action: 'CREATED' | 'UPDATED' | 'DELETED' }>`
  display: inline-flex;
  padding: 0.2rem 0.42rem;
  border-radius: 999px;
  color: ${({ $action, theme }) =>
    $action === 'DELETED' ? theme.colors.danger : theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.55rem;
  font-weight: 900;
`;

export const Empty = styled.div`
  padding: 1.25rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.72rem;
`;

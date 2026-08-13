import styled from 'styled-components';

export const Card = styled.aside`
  min-width: 0;
  align-self: start;
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
  gap: 0.7rem;
  padding: 0.78rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  > span {
    min-width: 1.7rem;
    min-height: 1.7rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    font-size: 0.68rem;
    font-weight: 850;
  }
`;

export const Title = styled.h2`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.85rem;
`;

export const VehicleList = styled.div`
  display: grid;
`;

export const VehicleRow = styled.article`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.72rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:last-child {
    border-bottom: 0;
  }
`;

export const Info = styled.div`
  min-width: 0;

  > span {
    display: block;
    margin-top: 0.15rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.62rem;
  }
`;

export const Plate = styled.strong`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.75rem;
  white-space: nowrap;
`;

export const Average = styled.div`
  flex: 0 0 auto;
  text-align: right;

  > strong {
    display: block;
    color: ${({ theme }) => theme.colors.brandGreenDark};
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;

export const SourceBadge = styled.span<{ $warning?: boolean }>`
  display: inline-block;
  margin-top: 0.18rem;
  padding: 0.16rem 0.35rem;
  border-radius: 999px;
  color: ${({ $warning, theme }) =>
    $warning ? theme.colors.dashboardTextMuted : theme.colors.brandGreenDark};
  background: ${({ $warning, theme }) =>
    $warning ? theme.colors.dashboardBorder : theme.colors.brandGreenSoft};
  font-size: 0.52rem;
  font-weight: 850;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const EmptyState = styled.div`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.7rem;
`;

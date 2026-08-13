import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const List = styled.section`
  display: none;

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    gap: 0.8rem;
  }
`;

export const Card = styled.article`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const CardHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
`;

export const Cte = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const Route = styled.div`
  display: grid;
  gap: 0.4rem;
  padding: 0.9rem 0;
`;

export const RoutePoint = styled.div`
  display: grid;
  gap: 0.18rem;

  small {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.88rem;
  }
`;

export const RouteArrow = styled.span`
  width: 1.8rem;
  height: 1.8rem;
  display: grid;
  place-items: center;
  border-radius: 0.6rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  padding-top: 0.85rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const DataItem = styled.div<{ $fullWidth?: boolean }>`
  min-width: 0;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

export const DataLabel = styled.span`
  display: block;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const DataValue = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.82rem;
`;

export const CardActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const EditButton = styled.button`
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
`;

export const EmptyState = styled.div`
  display: none;

  @media (max-width: ${breakpoints.mobile}) {
    display: block;
    padding: 2rem 1rem;
    border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
    border-radius: 1.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    text-align: center;
  }
`;


export const DeleteButton = styled(EditButton)`
  border-color: ${({ theme }) => theme.colors.dangerBorder};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

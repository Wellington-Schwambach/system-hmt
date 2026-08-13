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

export const Station = styled.strong`
  display: block;
  margin-bottom: 0.2rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.95rem;
`;

export const Plate = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0 0.5rem 0.2rem 0;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  font-weight: 800;
`;

export const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding-top: 0.85rem;
`;

export const DataItem = styled.div`
  min-width: 0;
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
  overflow: hidden;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  > :only-child {
    grid-column: 1 / -1;
  }
`;

const actionButtonStyles = `
  min-height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 0.85rem;
  border-radius: 0.8rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
`;

export const EditButton = styled.button`
  ${actionButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const InvoiceButton = styled.button`
  ${actionButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.brandGreen};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
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

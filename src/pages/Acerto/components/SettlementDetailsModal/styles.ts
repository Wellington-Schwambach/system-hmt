import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(0.25rem);
`;

export const Modal = styled.section`
  width: min(68rem, 100%);
  max-height: min(54rem, calc(100dvh - 2rem));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 1.5rem 4rem rgba(15, 23, 42, 0.22);
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  span {
    display: block;
    margin-top: 0.25rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.72rem;
  }
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const CloseButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const Content = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.1rem;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const SummaryItem = styled.div<{ $highlight?: boolean }>`
  padding: 0.75rem;
  border: 1px solid
    ${({ $highlight, theme }) =>
      $highlight ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.brandGreenSoft : theme.colors.dashboardSurface};

  span,
  strong {
    display: block;
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.63rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    margin-top: 0.25rem;
    color: ${({ $highlight, theme }) =>
      $highlight ? theme.colors.brandGreenDark : theme.colors.dashboardText};
    font-size: 0.9rem;
  }
`;

export const Section = styled.section`
  margin-top: 1rem;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.84rem;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const DetailItem = styled.div`
  padding: 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.75rem;

  span,
  strong {
    display: block;
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.63rem;
  }

  strong {
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.78rem;
  }
`;

export const VehicleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const VehicleRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.7rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
  }
`;

export const TableScroll = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.8rem;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 44rem;
  border-collapse: collapse;

  th,
  td {
    padding: 0.55rem 0.6rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.7rem;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    background: ${({ theme }) => theme.colors.dashboardSurface};
    font-size: 0.61rem;
    text-transform: uppercase;
  }

  td:last-child,
  th:last-child {
    text-align: right;
  }
`;

export const Total = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.9rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};

  span {
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    font-size: 1.15rem;
  }
`;

export const Actions = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  padding: 0.85rem 1.1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const Button = styled.button<{ $primary?: boolean }>`
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.white : theme.colors.dashboardText};
  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.brandGreen : theme.colors.surfaceElevated};
  font-size: 0.73rem;
  font-weight: 800;
  cursor: pointer;
`;

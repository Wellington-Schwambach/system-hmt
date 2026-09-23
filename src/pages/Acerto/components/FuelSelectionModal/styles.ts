import styled, { keyframes } from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

const modalIn = keyframes`
  from { opacity: 0; transform: translateY(0.6rem) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(10, 25, 17, 0.64);
  backdrop-filter: blur(0.28rem);
`;

export const Modal = styled.section`
  width: min(100%, 70rem);
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 5rem rgba(10, 25, 17, 0.34);
  animation: ${modalIn} 160ms ease-out;
`;

export const Header = styled.header`
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const HeaderText = styled.div`
  min-width: 0;

  > div {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: ${({ theme }) => theme.colors.brandGreen};

    h2 {
      margin: 0;
      color: ${({ theme }) => theme.colors.dashboardText};
      font-size: 1rem;
    }
  }

  p {
    margin: 0.3rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
    line-height: 1.45;
  }
`;

export const CloseButton = styled.button`
  width: 2.2rem;
  height: 2.2rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.dashboardText};
    border-color: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }
`;

export const SelectionSummary = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.58rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.65rem;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    font-weight: 800;
  }

  small {
    font-size: 0.6rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const StatusDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const PlateTabs = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.8rem;
  overflow-x: auto;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  button {
    min-height: 2.15rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex: 0 0 auto;
    padding: 0.35rem 0.55rem;
    border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
    border-radius: 0.65rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    background: ${({ theme }) => theme.colors.dashboardSurface};
    font-size: 0.63rem;
    font-weight: 850;
    cursor: pointer;

    small {
      min-width: 1.3rem;
      padding: 0.12rem 0.28rem;
      border-radius: 999px;
      background: ${({ theme }) => theme.colors.dashboardBorder};
      font-size: 0.52rem;
      text-align: center;
    }

    &[data-active='true'] {
      color: ${({ theme }) => theme.colors.brandGreenDark};
      border-color: ${({ theme }) => theme.colors.brandGreenBorder};
      background: ${({ theme }) => theme.colors.brandGreenSoft};

      small {
        background: ${({ theme }) => theme.colors.surfaceElevated};
      }
    }
  }
`;

export const RecordsHeader = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  > div:first-child {
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;

    strong {
      color: ${({ theme }) => theme.colors.dashboardText};
      font-size: 0.74rem;
    }

    span {
      color: ${({ theme }) => theme.colors.dashboardTextMuted};
      font-size: 0.58rem;
    }
  }

  > div:last-child {
    display: flex;
    gap: 0.35rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PlateButton = styled.button`
  min-height: 1.9rem;
  padding: 0.3rem 0.52rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.57rem;
  font-weight: 850;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const Metrics = styled.div`
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.45rem;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Metric = styled.div<{ $accent?: boolean }>`
  min-width: 0;
  padding: 0.48rem 0.55rem;
  border: 1px solid ${({ $accent, theme }) =>
    $accent ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  background: ${({ $accent, theme }) =>
    $accent ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated};

  span,
  strong {
    display: block;
    white-space: nowrap;
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.52rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    margin-top: 0.12rem;
    overflow: hidden;
    color: ${({ $accent, theme }) =>
      $accent ? theme.colors.brandGreenDark : theme.colors.dashboardText};
    font-size: 0.68rem;
    font-variant-numeric: tabular-nums;
    text-overflow: ellipsis;
  }
`;

export const TableScroller = styled.div<{ $scroll: boolean }>`
  min-height: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: ${({ $scroll }) => ($scroll ? 'auto' : 'visible')};
  overscroll-behavior: contain;
  max-height: ${({ $scroll }) => ($scroll ? '27rem' : 'none')};

  @media (max-width: ${breakpoints.mobile}) {
    overflow-y: auto;
    max-height: 48vh;
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 0.48rem 0.65rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    text-align: right;
    vertical-align: middle;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    background: ${({ theme }) => theme.colors.dashboardSurface};
    font-size: 0.56rem;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  td {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.64rem;
  }

  th:first-child,
  td:first-child {
    width: 10.5rem;
    text-align: left;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr[data-disabled='true'] {
    opacity: 0.58;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }
`;

export const SelectionCell = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  input {
    width: 0.95rem;
    height: 0.95rem;
    flex: 0 0 auto;
    accent-color: ${({ theme }) => theme.colors.brandGreen};
  }

  > span {
    display: grid;
    gap: 0.08rem;

    strong {
      font-size: 0.63rem;
      white-space: nowrap;
    }

    small {
      color: ${({ theme }) => theme.colors.dashboardTextMuted};
      font-size: 0.52rem;
      white-space: nowrap;
    }
  }
`;

export const Value = styled.strong<{ $accent?: boolean }>`
  color: ${({ $accent, theme }) =>
    $accent ? theme.colors.brandGreenDark : theme.colors.dashboardText};
  font-size: 0.63rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const EmptyState = styled.div`
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.72rem;
`;

export const Footer = styled.footer`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  > span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.62rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    min-height: 2.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.42rem 0.7rem;
    border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
    border-radius: 0.65rem;
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    font-size: 0.62rem;
    font-weight: 850;
    cursor: pointer;
  }
`;

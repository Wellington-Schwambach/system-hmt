import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const Page = styled.main`
  display: grid;
  gap: 1rem;
  padding-bottom: 4rem;
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const TitleGroup = styled.div`
  display: grid;
  gap: 0.25rem;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.5rem, 3vw, 2.1rem);
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.84rem;
`;

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(190px, 1.25fr) minmax(145px, 0.7fr) minmax(145px, 0.7fr) minmax(170px, 0.8fr) auto;
  align-items: end;
  gap: 0.7rem;
  padding: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const FilterField = styled.label`
  min-width: 0;
  display: grid;
  gap: 0.35rem;

  > span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
`;

const fieldStyles = `
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 2.55rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.75rem;
  font: inherit;
  font-size: 0.78rem;
`;

export const Select = styled.select`
  ${fieldStyles}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const DateField = styled.input`
  ${fieldStyles}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const ClearButton = styled.button`
  min-height: 2.55rem;
  padding: 0 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }
`;

export const Loading = styled.div`
  padding: 2.5rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

export const ErrorBox = styled.div`
  margin: 1rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 890px;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 0.65rem 0.65rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.76rem;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.65rem;
    font-weight: 850;
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;
  }

  th:nth-child(1), td:nth-child(1) { width: 9%; }
  th:nth-child(2), td:nth-child(2) { width: 13%; }
  th:nth-child(3), td:nth-child(3) { width: 15%; }
  th:nth-child(4), td:nth-child(4) { width: 13%; }
  th:nth-child(5), td:nth-child(5) { width: 12%; }
  th:nth-child(6), td:nth-child(6) { width: 13%; }
  th:nth-child(7), td:nth-child(7) { width: 13%; }
  th:nth-child(8), td:nth-child(8) { width: 12%; }
`;

export const GroupHeaderRow = styled.tr`
  > td {
    padding: 0.72rem 0.85rem;
    border-top: 2px solid ${({ theme }) => theme.colors.brandGreenBorder};
    border-bottom: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:first-child > td {
    border-top: 0;
  }
`;

export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;

  > strong {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    font-size: 0.82rem;
    text-transform: uppercase;
  }
`;

export const GroupStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.7rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
  }
`;

export const CompactSelect = styled.select`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 2.15rem;
  padding: 0.35rem 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-size: 0.72rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const InlineInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 2.15rem;
  padding: 0.35rem 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-size: 0.72rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const Money = styled.strong`
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

export const RouteText = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PaidButton = styled.button<{ $paid?: boolean }>`
  min-height: 2.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  padding: 0 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreen};
  border-radius: 0.6rem;
  color: ${({ theme, $paid }) => ($paid ? theme.colors.brandGreenDark : theme.colors.white)};
  background: ${({ theme, $paid }) => ($paid ? theme.colors.brandGreenSoft : theme.colors.brandGreen)};
  font-size: 0.7rem;
  font-weight: 850;
  cursor: ${({ $paid }) => ($paid ? 'default' : 'pointer')};

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

export const Empty = styled.div`
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

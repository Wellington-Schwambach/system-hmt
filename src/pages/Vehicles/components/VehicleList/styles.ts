import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const ListCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  overflow: hidden;
`;

export const ListToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: ${breakpoints.tablet}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const Filters = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(14rem, 1fr) minmax(10rem, 13rem) minmax(9rem, 11rem);
  gap: 0.7rem;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: minmax(0, 1fr) minmax(10rem, 13rem);
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

export const SearchShell = styled.div`
  position: relative;
`;

export const SearchIcon = styled.span`
  position: absolute;
  left: 0.8rem;
  top: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.brandGreen};
  transform: translateY(-50%);
  pointer-events: none;
`;

export const SearchInput = styled.input`
  width: 100%;
  min-height: 2.85rem;
  padding: 0.65rem 0.8rem 0.65rem 2.55rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const FilterSelect = styled.select`
  min-height: 2.85rem;
  padding: 0.65rem 2rem 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
`;

export const CreateButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border: 0;
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  font-weight: 800;
  cursor: pointer;
`;

export const ExportButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const ListMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.74rem;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;

  @media (max-width: ${breakpoints.tablet}) {
    display: none;
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: 98rem;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 0.75rem 0.85rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const Td = styled.td`
  max-width: 15rem;
  padding: 0.82rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  vertical-align: middle;
`;

export const StrongValue = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
`;

export const MutedValue = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
`;

export const CodeValue = styled.code`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.7rem;
  white-space: nowrap;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const ActionButton = styled.button<{ $danger?: boolean; $document?: boolean }>`
  width: 2.15rem;
  height: 2.15rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid
    ${({ $danger, $document, theme }) =>
      $danger
        ? theme.colors.dangerBorder
        : $document
          ? theme.colors.brandGreenBorder
          : theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  color: ${({ $danger, $document, theme }) =>
    $danger
      ? theme.colors.danger
      : $document
        ? theme.colors.brandGreenDark
        : theme.colors.dashboardTextMuted};
  background: ${({ $document, theme }) =>
    $document ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &:not(:disabled):hover {
    color: ${({ $danger, theme }) => ($danger ? theme.colors.white : theme.colors.brandGreenDark)};
    border-color: ${({ $danger, theme }) =>
      $danger ? theme.colors.danger : theme.colors.brandGreen};
    background: ${({ $danger, theme }) =>
      $danger ? theme.colors.danger : theme.colors.brandGreenSoft};
  }
`;

export const MobileList = styled.div`
  display: none;
  gap: 0.7rem;
  padding: 0 0.8rem 0.8rem;

  @media (max-width: ${breakpoints.tablet}) {
    display: grid;
  }
`;

export const MobileCard = styled.article`
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.95rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const MobileCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
`;

export const MobilePlate = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const MobileType = styled.span`
  padding: 0.3rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.66rem;
  font-weight: 850;
`;

export const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.8rem;
`;

export const MobileItem = styled.div`
  min-width: 0;
`;

export const MobileLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
`;

export const MobileValue = styled.strong`
  display: block;
  margin-top: 0.2rem;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const MobileActionButton = styled.button<{ $danger?: boolean; $document?: boolean }>`
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid
    ${({ $danger, $document, theme }) =>
      $danger
        ? theme.colors.dangerBorder
        : $document
          ? theme.colors.brandGreenBorder
          : theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ $danger, $document, theme }) =>
    $danger
      ? theme.colors.danger
      : $document
        ? theme.colors.brandGreenDark
        : theme.colors.dashboardTextMuted};
  background: ${({ $document, theme }) =>
    $document ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated};
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const EmptyState = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

export const EmptyTitle = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.95rem;
`;

export const EmptyText = styled.p`
  max-width: 27rem;
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.5;
`;


export const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4rem;
  padding: 0.8rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PaginationSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const PageSizeSelect = styled.select`
  min-height: 2.2rem;
  padding: 0.35rem 1.7rem 0.35rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-size: 0.72rem;
  font-weight: 750;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const PaginationActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;

  @media (max-width: ${breakpoints.mobile}) {
    justify-content: space-between;
  }
`;

export const PageButton = styled.button`
  width: 2.35rem;
  height: 2.35rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;

  &:not(:disabled):hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.38;
  }
`;

export const PageInfo = styled.span`
  min-width: 8.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  text-align: center;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-weight: 850;
  }
`;

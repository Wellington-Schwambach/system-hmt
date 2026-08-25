import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';

export const Page = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-bottom: 1rem;
`;

export const Tabs = styled.nav`
  display: flex;
  gap: 0.4rem;
  padding: 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.1rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const TabButton = styled.button<{ $active: boolean }>`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1rem;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.brandGreenBorder : 'transparent')};
  border-radius: 0.8rem;
  color: ${({ $active, theme }) => ($active ? theme.colors.brandGreenDark : theme.colors.dashboardTextMuted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : 'transparent')};
  font-weight: 800;
  cursor: pointer;
`;

export const CountBadge = styled.span`
  min-width: 1.45rem;
  height: 1.45rem;
  display: inline-grid;
  place-items: center;
  padding: 0 0.35rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.68rem;
`;

export const Card = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  overflow: hidden;
`;

export const CardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  h2 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1rem; }
  p { margin: 0.3rem 0 0; color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.76rem; }
`;

export const Form = styled.form`
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(14rem, 1.6fr) minmax(12rem, 1fr) minmax(10rem, 0.8fr);
  gap: 0.9rem;
  align-items: end;

  @media (max-width: ${breakpoints.tablet}) { grid-template-columns: 1fr; }
`;

export const Field = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.74rem;
  font-weight: 800;
`;

export const Input = styled.input`
  min-height: 2.85rem;
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  &:focus { border-color: ${({ theme }) => theme.colors.brandGreen}; box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus}; }
`;

export const Select = styled.select`
  min-height: 2.85rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const ColorField = styled.div`
  display: grid;
  grid-template-columns: 3.2rem 1fr;
  gap: 0.6rem;
  align-items: center;
`;

export const ColorInput = styled.input`
  width: 3.2rem;
  height: 2.85rem;
  padding: 0.2rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
`;

export const Palette = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
`;

export const ColorButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 1.7rem;
  height: 1.7rem;
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.dashboardText : 'transparent')};
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.dashboardBorderStrong};
  cursor: pointer;
`;

export const Preview = styled.div<{ $color: string; $textColor: string }>`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.85rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $textColor }) => $textColor};
  background: ${({ $color }) => $color};
  font-size: 0.76rem;
  font-weight: 900;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding-top: 0.2rem;
`;

export const PrimaryButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-weight: 850;
  cursor: pointer;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

export const SecondaryButton = styled.button`
  min-height: 2.85rem;
  padding: 0.65rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-weight: 800;
  cursor: pointer;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  @media (max-width: ${breakpoints.tablet}) { flex-direction: column; }
`;

export const Filters = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(14rem, 1fr) minmax(10rem, 13rem);
  gap: 0.7rem;
  @media (max-width: ${breakpoints.mobile}) { grid-template-columns: 1fr; }
`;

export const SearchShell = styled.div`position: relative;`;
export const SearchIcon = styled.span`
  position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.brandGreen}; pointer-events: none;
`;
export const SearchInput = styled(Input)`padding-left: 2.55rem;`;

export const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.74rem;
`;

export const TableWrap = styled.div`overflow-x: auto;`;
export const Table = styled.table`width: 100%; border-collapse: collapse; min-width: 48rem;`;
export const Th = styled.th`
  padding: 0.75rem 0.85rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.66rem; font-weight: 850; text-transform: uppercase; text-align: left;
`;
export const Td = styled.td`
  padding: 0.82rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
`;

export const ColorBadge = styled.span<{ $color: string; $textColor: string }>`
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.4rem 0.7rem; border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $textColor }) => $textColor}; background: ${({ $color }) => $color};
  font-weight: 850;
`;
export const Dot = styled.span<{ $color: string }>`width: 0.7rem; height: 0.7rem; border-radius: 50%; background: ${({ $color }) => $color};`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex; padding: 0.35rem 0.65rem; border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $active, theme }) => ($active ? theme.colors.brandGreenDark : theme.colors.danger)};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : theme.colors.dangerSoft)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.brandGreenBorder : theme.colors.dangerBorder)};
  font-weight: 850;
`;

export const RowActions = styled.div`display: flex; gap: 0.4rem;`;
export const IconButton = styled.button<{ $danger?: boolean }>`
  width: 2.2rem; height: 2.2rem; display: grid; place-items: center; padding: 0;
  border: 1px solid ${({ $danger, theme }) => ($danger ? theme.colors.dangerBorder : theme.colors.dashboardBorderStrong)};
  border-radius: 0.65rem;
  color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.brandGreenDark)};
  background: ${({ $danger, theme }) => ($danger ? theme.colors.dangerSoft : theme.colors.brandGreenSoft)};
  cursor: pointer;
`;

export const Empty = styled.div`
  padding: 3rem 1rem; text-align: center; color: ${({ theme }) => theme.colors.dashboardTextMuted};
`;

export const Pagination = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  padding: 0.85rem 1rem; border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  @media (max-width: ${breakpoints.mobile}) { align-items: stretch; flex-direction: column; }
`;
export const PageActions = styled.div`display: flex; align-items: center; gap: 0.5rem;`;
export const PageButton = styled.button`
  min-height: 2.35rem; padding: 0.45rem 0.7rem; border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem; color: ${({ theme }) => theme.colors.dashboardText}; background: ${({ theme }) => theme.colors.surfaceElevated}; cursor: pointer;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
export const PageSize = styled.select`
  min-height: 2.35rem; padding: 0.4rem 0.7rem; border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem; color: ${({ theme }) => theme.colors.dashboardText}; background: ${({ theme }) => theme.colors.surfaceElevated};
`;

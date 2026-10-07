import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const FiltersBar = styled.section`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: end;
  gap: 0.8rem;
  width: 100%;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  > :nth-child(1) {
    grid-column: span 2;
  }

  > :nth-child(2) {
    grid-column: span 2;
  }

  > :nth-child(3) {
    grid-column: span 2;
  }

  > :nth-child(4) {
    grid-column: span 1;
  }

  > :nth-child(5) {
    grid-column: span 3;
  }

  > :nth-child(6) {
    grid-column: span 2;
  }

  @media (max-width: 82rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > :nth-child(n) {
      grid-column: span 1;
    }

    > :nth-child(5),
    > :nth-child(6) {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;

    > :nth-child(n) {
      grid-column: auto;
    }
  }
`;

export const SelectWrapper = styled.div`
  display: grid;
  min-width: 0;
  gap: 0.35rem;
`;

export const CompactSelectWrapper = styled(SelectWrapper)`
  width: 100%;
  max-width: 8.5rem;

  @media (max-width: 82rem) {
    max-width: none;
  }
`;

export const FilterLabel = styled.label`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const Select = styled.select`
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.65rem 2.15rem 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font: inherit;
  font-size: 0.82rem;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const SearchBox = styled.label`
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
`;

export const SearchIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.85rem;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  pointer-events: none;
`;

export const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.65rem 0.9rem 0.65rem 2.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const DateRange = styled.div`
  min-height: 2.75rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
`;

export const DateInput = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.58rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font: inherit;
  font-size: 0.78rem;
  outline: none;
  color-scheme: ${({ theme }) => (theme.mode === 'dark' ? 'dark' : 'light')};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const DateSeparator = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 700;
`;

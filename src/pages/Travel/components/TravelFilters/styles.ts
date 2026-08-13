import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const FiltersBar = styled.section`
  display: grid;
  grid-template-columns: minmax(9rem, 0.18fr) minmax(11rem, 0.23fr) minmax(12rem, 0.24fr) minmax(18rem, 0.35fr);
  align-items: end;
  gap: 1rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > label:last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;

    > label:last-child {
      grid-column: auto;
    }
  }
`;

export const SelectWrapper = styled.div`
  display: grid;
  gap: 0.35rem;
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
  min-height: 2.75rem;
  padding: 0.65rem 2.4rem 0.65rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font: inherit;
  font-size: 0.84rem;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const SearchBox = styled.label`
  position: relative;
  width: 100%;
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

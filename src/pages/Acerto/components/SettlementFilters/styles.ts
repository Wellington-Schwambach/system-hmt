import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Container = styled.section`
  display: grid;
  grid-template-columns: minmax(13rem, 1.4fr) minmax(10rem, 0.8fr) auto;
  align-items: end;
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.15rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  min-width: 0;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const controlStyles = `
  width: 100%;
  min-height: 2.85rem;
  border-radius: 0.8rem;
  outline: none;
`;

export const Select = styled.select`
  ${controlStyles}
  padding: 0.65rem 2.2rem 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const MonthInput = styled.input`
  ${controlStyles}
  padding: 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.82rem;
  font-weight: 700;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const CustomPeriodButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.78rem;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;

  @media (max-width: ${breakpoints.tablet}) {
    grid-column: 1 / -1;
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-column: auto;
  }
`;

export const ActivePeriod = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.73rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
  }
`;

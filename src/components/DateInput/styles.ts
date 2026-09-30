import styled from 'styled-components';

export const DateField = styled.input`
  box-sizing: border-box;
  width: 100%;
  min-height: 3rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-variant-numeric: tabular-nums;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  width: 100%;
`;

export const CalendarButton = styled.button`
  position: absolute;
  left: 0.55rem;
  top: 50%;
  z-index: 2;
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: transparent;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease;
  transform: translateY(-50%);

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }
`;

export const VisibleInput = styled.input`
  width: 100%;
  min-height: 3rem;
  padding: 0.7rem 0.85rem 0.7rem 2.95rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-variant-numeric: tabular-nums;

  &::placeholder {
    color: ${({ theme }) => theme.colors.dashboardTextSoft};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }

  &:invalid:not(:placeholder-shown) {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

export const NativeDateInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
`;

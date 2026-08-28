import styled, { keyframes } from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

const modalEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(14, 31, 21, 0.56);
  backdrop-filter: blur(0.35rem);
`;

export const Modal = styled.section`
  width: min(100%, 48rem);
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.6rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 5rem rgba(14, 31, 21, 0.3);
  animation: ${modalEnter} 180ms ease-out;

  @media (max-width: ${breakpoints.mobile}) {
    border-radius: 1.25rem;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.25rem;
`;

export const Subtitle = styled.p`
  max-width: 38rem;
  margin: 0.35rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.82rem;
  line-height: 1.5;
`;

export const CloseButton = styled.button`
  width: 2.5rem;
  aspect-ratio: 1;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
`;

export const BillingPeriodPanel = styled.section`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const BillingPeriodCopy = styled.div`
  min-width: 0;
`;

export const BillingPeriodTitle = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.9rem;
`;

export const BillingPeriodDescription = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  line-height: 1.4;
`;

export const BillingPeriodField = styled.div`
  width: 100%;
  min-width: 0;
`;

export const FormSection = styled.section`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const FormSectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
`;

export const FormSectionTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.92rem;
`;

export const FormSectionDescription = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.75rem;
  line-height: 1.45;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div<{ $fullWidth?: boolean }>`
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};

  @media (max-width: ${breakpoints.mobile}) {
    grid-column: auto;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.8rem;
  font-weight: 750;
`;

export const FieldControl = styled.div`
  position: relative;
`;

export const FieldIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.85rem;
  z-index: 1;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.brandGreen};
  pointer-events: none;
`;

const fieldStyles = `
  width: 100%;
  min-height: 3rem;
  border-radius: 0.85rem;
  outline: none;
`;

export const Input = styled.input`
  ${fieldStyles}
  padding: 0.7rem 0.85rem 0.7rem 2.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const ReadonlyInput = styled(Input)`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: default;
`;

export const FieldHelp = styled.small`
  display: block;
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  line-height: 1.35;
`;

export const Select = styled.select`
  ${fieldStyles}
  padding: 0.7rem 2.2rem 0.7rem 2.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const ArlaToggle = styled.label`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
`;

export const ToggleInput = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${({ theme }) => theme.colors.brandGreen};
`;

export const CalculationPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.brandGreenSoft};

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const CalculationItem = styled.div`
  min-width: 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const CalculationLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 750;
`;

export const CalculationValue = styled.strong`
  display: block;
  margin-top: 0.25rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

export const CancelButton = styled.button`
  min-height: 2.85rem;
  padding: 0.65rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SaveButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

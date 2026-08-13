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
  z-index: 12000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(14, 31, 21, 0.56);
  backdrop-filter: blur(0.35rem);
`;

export const Modal = styled.section`
  width: min(100%, 62rem);
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
    cursor: wait;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
`;

export const FormSection = styled.section`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const FormSectionHeader = styled.div`
  margin-bottom: 0.9rem;
`;


export const FormSectionHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
  }
`;

export const AddCteButton = styled.button`
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    filter: brightness(1.04);
  }
`;

export const CteList = styled.div`
  display: grid;
  gap: 0.85rem;
`;

export const CteCard = styled.article`
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const CteCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
`;

export const CteCardTitle = styled.strong`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.85rem;

  svg {
    color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const CteRemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.25rem;
  padding: 0.4rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
`;

export const CteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const CteTotalBox = styled.div`
  min-height: 3rem;
  align-self: end;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.62rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const CteTotalLabel = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
`;

export const CteTotalValue = styled.strong`
  margin-top: 0.18rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
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
  position: relative;
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

export const FieldIcon = styled.span`
  position: absolute;
  left: 0.85rem;
  bottom: 0.86rem;
  z-index: 1;
  display: grid;
  place-items: center;
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


export const SelectWithAction = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0.55rem;
`;

export const SelectControl = styled.div`
  position: relative;
  min-width: 0;
  flex: 1;
`;

export const InlineAddButton = styled.button`
  width: 3rem;
  min-width: 3rem;
  min-height: 3rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  cursor: pointer;
  transition: transform 140ms ease, filter 140ms ease;

  &:hover {
    filter: brightness(1.04);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const RoutePreview = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.9rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.9rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const RoutePreviewPoint = styled.strong`
  min-width: 0;
  overflow: hidden;
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RoutePreviewArrow = styled.span`
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.brandGreen};

  @media (max-width: ${breakpoints.mobile}) {
    transform: rotate(90deg);
    justify-self: start;
  }
`;

export const CalculationPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.brandGreenSoft};

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

export const ErrorMessage = styled.div`
  padding: 0.8rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.8rem;
  font-weight: 700;
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
    cursor: wait;
  }
`;

export const InlineInfo = styled.p`
  margin: 0.85rem 0 0;
  padding: 0.7rem 0.8rem;
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.76rem;
  font-weight: 700;
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
    opacity: 0.6;
    cursor: wait;
  }
`;

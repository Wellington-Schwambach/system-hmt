import styled from 'styled-components';
import { breakpoints } from '../../../../styles/breakpoints';

export const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-width: 0;
`;

export const Section = styled.section`
  min-width: 0;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const SectionTitle = styled.h3`
  margin: 0 0 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.9rem;
`;

export const Grid = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 1050px) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  @media (max-width: ${breakpoints.mobile}) { grid-template-columns: 1fr; }
`;

export const GroupTitle = styled.div`
  grid-column: 1 / -1;
  margin-top: 0.2rem;
  padding-top: 0.85rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.8rem;
  font-weight: 800;
`;

export const Field = styled.label<{ $span?: number }>`
  min-width: 0;
  grid-column: span ${({ $span = 4 }) => $span};
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.74rem;
  font-weight: 750;

  @media (max-width: 1050px) { grid-column: span ${({ $span = 4 }) => Math.min(6, Math.max(3, $span))}; }
  @media (max-width: ${breakpoints.mobile}) { grid-column: 1; }
`;

const control = `
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  box-sizing: border-box;
  border-radius: 0.72rem;
  outline: none;
`;

export const Input = styled.input`
  ${control}
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  &:focus { border-color: ${({ theme }) => theme.colors.brandGreen}; box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus}; }
`;

export const Select = styled.select`
  ${control}
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const Textarea = styled.textarea`
  ${control}
  min-height: 8rem;
  resize: vertical;
  padding: 0.7rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const SelectAction = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.75rem;
  gap: 0.42rem;

  > div { min-width: 0; }
`;

export const AddButton = styled.button`
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.72rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  cursor: pointer;
`;

export const Hint = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 500;
  line-height: 1.35;
`;

export const QuickBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(8, 18, 13, 0.58);
`;
export const QuickModal = styled.div`
  width: min(100%, 28rem);
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 1.5rem 4rem rgba(0,0,0,.28);
`;
export const QuickTitle = styled.h3`
  margin: 0 0 .75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;
export const QuickActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: .55rem;
  margin-top: .85rem;
  @media (max-width: ${breakpoints.mobile}) { flex-direction: column-reverse; > button { width: 100%; } }
`;
export const QuickButton = styled.button<{ $primary?: boolean }>`
  min-height: 2.5rem;
  padding: .55rem .85rem;
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.brandGreen : theme.colors.dashboardBorder};
  border-radius: .65rem;
  color: ${({ $primary, theme }) => $primary ? '#fff' : theme.colors.dashboardText};
  background: ${({ $primary, theme }) => $primary ? theme.colors.brandGreen : theme.colors.dashboardSurface};
  font-weight: 750;
  cursor: pointer;
`;

export const LoadEntriesArea = styled.div`
  min-width: 0;
  grid-column: span 8;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;

  @media (max-width: 1050px) { grid-column: span 6; }
  @media (max-width: ${breakpoints.mobile}) { grid-column: 1; }
`;

export const LoadEntryRow = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(8rem, 0.75fr) minmax(10rem, 1.25fr) 2.75rem;
  gap: 0.45rem;
  align-items: end;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr 1fr 2.75rem;
  }

  @media (max-width: 470px) {
    grid-template-columns: 1fr;
  }
`;

export const LoadEntryField = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.74rem;
  font-weight: 750;
`;

export const LoadEntryActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

export const LoadAddButton = styled.button`
  min-height: 2.45rem;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.38rem;
  padding: 0.48rem 0.72rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.68rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadRemoveButton = styled.button`
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.72rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

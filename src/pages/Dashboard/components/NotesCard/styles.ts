import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Card = styled.article`
  min-width: 0;
  min-height: 20rem;
  padding: 1.15rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.6rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const HeaderTitleWrap = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const HeaderIcon = styled.span`
  width: 2.8rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
`;

export const HeaderTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const AddButton = styled.button`
  width: 2.5rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  cursor: pointer;
  transition: transform 150ms ease, background 150ms ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.colors.brandGreenBorder};
  }
`;

export const NotesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
`;

export const NoteItem = styled.li<{ $completed: boolean }>`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid
    ${({ $completed, theme }) => ($completed ? theme.colors.brandGreen : theme.colors.dashboardBorder)};
  border-radius: 1.35rem;
  background: ${({ $completed, theme }) =>
    $completed ? theme.colors.brandGreenSoft : theme.colors.dashboardSurface};
  box-shadow: ${({ $completed, theme }) => ($completed ? theme.shadow.green : 'none')};
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
`;

export const NoteButton = styled.button`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 0.8rem 0.9rem 1rem;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

export const CompletionButton = styled.button<{ $completed: boolean }>`
  width: 3.35rem;
  min-width: 3.35rem;
  display: grid;
  place-items: center;
  align-self: stretch;
  border: 0;
  border-left: 1px solid
    ${({ $completed, theme }) => ($completed ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder)};
  color: ${({ $completed, theme }) => ($completed ? theme.colors.white : theme.colors.dashboardTextMuted)};
  background: ${({ $completed, theme }) => ($completed ? theme.colors.brandGreen : 'transparent')};
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.brandGreen};
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

export const NoteIcon = styled.span`
  width: 2.5rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const NoteCopy = styled.span`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
`;

export const NoteText = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.9rem;
  font-weight: 760;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

export const NoteMeta = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 650;
`;

export const NoteTime = styled.time`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;

  @media (max-width: ${breakpoints.mobile}) {
    grid-column: 2;
    justify-self: start;
  }
`;

export const EmptyState = styled.div`
  min-height: 9rem;
  display: grid;
  place-items: center;
  margin-top: 1rem;
  padding: 1.25rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1.2rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.85rem;
  text-align: center;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(0.3rem);
`;

export const Modal = styled.section`
  width: min(38rem, 100%);
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.4rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.38);
`;

export const ModalHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const ModalTitleWrap = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.05rem;
`;

export const ModalSubtitle = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
  font-weight: 650;
`;

export const CloseButton = styled.button`
  width: 2.25rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const ModalBody = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  overflow-y: auto;
`;

export const DetailCard = styled.div`
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 0.7rem;
  align-items: start;

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }

  strong,
  p {
    min-width: 0;
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  font-weight: 800;
`;

export const FullField = styled(Field)`
  grid-column: 1 / -1;
`;

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  height: 2.75rem;
  padding: 0 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-width: 0;
  min-height: 7rem;
  resize: vertical;
  padding: 0.75rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Recipients = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  max-height: 12rem;
  padding: 0.7rem;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Recipient = styled.label`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.5rem;
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  input {
    accent-color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem 1.05rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const ActionButton = styled.button<{ $danger?: boolean; $primary?: boolean }>`
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  border: 1px solid
    ${({ $danger, $primary, theme }) =>
      $danger ? theme.colors.dangerBorder : $primary ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder};
  border-radius: 0.75rem;
  color: ${({ $danger, $primary, theme }) =>
    $danger ? theme.colors.danger : $primary ? theme.colors.brandGreenDark : theme.colors.dashboardText};
  background: ${({ $danger, $primary, theme }) =>
    $danger ? theme.colors.dangerSoft : $primary ? theme.colors.brandGreenSoft : theme.colors.dashboardSurface};
  font: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

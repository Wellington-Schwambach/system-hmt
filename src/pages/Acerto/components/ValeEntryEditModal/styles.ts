import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
`;

export const Modal = styled.section`
  width: min(100%, 38rem);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  h2 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1rem; }
`;

export const CloseButton = styled.button`
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const Form = styled.form`
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 620px) { grid-template-columns: 1fr; }
`;

export const Field = styled.label`
  min-width: 0;
  display: grid;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.7rem;
  font-weight: 800;
`;

const control = `
  box-sizing: border-box;
  width: 100%;
  min-height: 2.65rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.7rem;
  font: inherit;
`;

export const Input = styled.input`
  ${control}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.brandGreen}; box-shadow: 0 0 0 0.16rem ${({ theme }) => theme.colors.brandGreenFocus}; }
`;

export const Select = styled.select`
  ${control}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  outline: none;
`;

export const Textarea = styled.textarea`
  ${control}
  min-height: 5rem;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  outline: none;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding-top: 0.3rem;
`;

export const Button = styled.button<{ $primary?: boolean }>`
  min-height: 2.55rem;
  padding: 0 0.9rem;
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ $primary, theme }) => $primary ? theme.colors.white : theme.colors.dashboardText};
  background: ${({ $primary, theme }) => $primary ? theme.colors.brandGreen : theme.colors.dashboardSurface};
  font-weight: 850;
  cursor: pointer;
  &:disabled { opacity: 0.55; cursor: wait; }
`;

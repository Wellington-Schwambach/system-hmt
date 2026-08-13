import styled, { keyframes } from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

const modalIn = keyframes`
  from { opacity: 0; transform: translateY(0.75rem) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(14, 31, 21, 0.58);
  backdrop-filter: blur(0.3rem);
`;

export const Modal = styled.section`
  width: min(100%, 31rem);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 5rem rgba(14, 31, 21, 0.3);
  animation: ${modalIn} 160ms ease-out;
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
`;

export const CloseButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const Form = styled.form`
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
`;

export const Field = styled.div``;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.74rem;
  font-weight: 800;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.8rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Error = styled.div`
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

export const Button = styled.button<{ $primary?: boolean }>`
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong};
  border-radius: 0.75rem;
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.white : theme.colors.dashboardTextMuted};
  background: ${({ $primary, theme }) => ($primary ? theme.colors.brandGreen : theme.colors.surfaceElevated)};
  font-size: 0.75rem;
  font-weight: 850;
  cursor: pointer;
`;

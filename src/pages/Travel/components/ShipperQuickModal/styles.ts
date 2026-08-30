import styled, { keyframes } from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

const enter = keyframes`
  from { opacity: 0; transform: translateY(0.65rem) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 13000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(8, 20, 14, 0.62);
  backdrop-filter: blur(0.45rem);

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.45rem;
  }
`;

export const Modal = styled.section`
  width: min(100%, 31rem);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.35rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 5rem rgba(8, 20, 14, 0.34);
  animation: ${enter} 160ms ease-out;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    max-height: calc(100dvh - 0.9rem);
    overflow-y: auto;
    border-radius: 1rem;
  }
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem 0.95rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const Subtitle = styled.p`
  margin: 0.3rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
  line-height: 1.45;
`;

export const CloseButton = styled.button`
  width: 2.35rem;
  height: 2.35rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const Form = styled.form`
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
`;

export const Label = styled.label`
  min-width: 0;
  display: grid;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.8rem;
  font-weight: 800;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 3rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Hint = styled.p`
  margin: -0.35rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  line-height: 1.45;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.25rem;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column-reverse;

    > button { width: 100%; }
  }
`;

export const CancelButton = styled.button`
  min-height: 2.7rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-weight: 800;
  cursor: pointer;
`;

export const SaveButton = styled.button`
  min-height: 2.7rem;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-weight: 850;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

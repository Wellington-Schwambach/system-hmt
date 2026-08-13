import styled from 'styled-components';

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(0.16rem);
  overscroll-behavior: contain;
`;

export const Modal = styled.form`
  width: min(31rem, 100%);
  max-height: calc(100vh - 2rem);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const HeaderCopy = styled.div`
  display: grid;
  gap: 0.3rem;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.2rem;
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.86rem;
  line-height: 1.45;
`;

export const CloseButton = styled.button`
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardBackground};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.dashboardText};
    border-color: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }
`;

export const Body = styled.div`
  display: grid;
  gap: 0.9rem;
  padding: 1.1rem;
  overflow-y: auto;
`;

export const Field = styled.label`
  display: grid;
  gap: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.82rem;
  font-weight: 750;
`;

export const PasswordField = styled.div`
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.8rem;
  padding: 0.6rem 3rem 0.6rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardBackground};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brandGreenFocus};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const VisibilityButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.42rem;
  width: 2.15rem;
  height: 2.15rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  transform: translateY(-50%);
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }
`;

export const Hint = styled.small`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  line-height: 1.45;
`;

export const ErrorBox = styled.div`
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.86rem;
  font-weight: 700;
`;

export const SuccessBox = styled.div`
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.86rem;
  font-weight: 700;
`;

export const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 1rem 1.1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const SecondaryButton = styled.button`
  min-height: 2.65rem;
  padding: 0.55rem 0.95rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardBackground};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const PrimaryButton = styled.button`
  min-height: 2.65rem;
  padding: 0.55rem 1rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  font-weight: 850;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.brandGreenDark};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Form = styled.form`
  display: grid;
  gap: 1.55rem;
`;

export const FormUtilities = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const ForgotPasswordButton = styled.button`
  padding: 0;
  border: 0;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: transparent;
  font-size: 0.92rem;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 160ms ease;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 3px;
    border-radius: 0.2rem;
  }
`;

export const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 0.4rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;


export const FormNotice = styled.div`
  padding: 0.9rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.45;
`;

export const FormError = styled.div`
  padding: 0.9rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.9rem;
  font-weight: 650;
`;

export const LoadingIcon = styled.span`
  display: inline-flex;
  animation: ${spin} 0.8s linear infinite;
`;

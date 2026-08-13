import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Wrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.875rem;
  background: ${({ theme }) => theme.colors.page};
`;

export const Loader = styled.span`
  width: 2.5rem;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 0.2rem solid ${({ theme }) => theme.colors.brandGreenSoft};
  border-top-color: ${({ theme }) => theme.colors.brandGreen};
  animation: ${rotate} 0.85s linear infinite;
`;

export const LoaderText = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
  font-weight: 600;
`;

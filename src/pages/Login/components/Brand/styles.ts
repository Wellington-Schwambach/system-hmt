import styled from 'styled-components';

interface BrandWrapperProps {
  $compact: boolean;
}

interface BrandLogoProps {
  $compact: boolean;
}

export const BrandWrapper = styled.div<BrandWrapperProps>`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  padding: ${({ $compact }) => ($compact ? '0.65rem 0.9rem' : '0.8rem 1.1rem')};
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: 0 0.75rem 2rem rgba(0, 45, 22, 0.13);
  backdrop-filter: blur(0.75rem);
`;

export const BrandLogo = styled.img<BrandLogoProps>`
  display: block;
  width: ${({ $compact }) => ($compact ? 'min(14rem, 56vw)' : 'min(17rem, 26vw)')};
  height: auto;
  object-fit: contain;
`;

import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Button = styled.button`
  position: fixed;
  right: clamp(1rem, 2.4vw, 2rem);
  bottom: clamp(1rem, 2.4vw, 2rem);
  z-index: 60;
  min-height: 3.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.8rem 1.15rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.brandGreen},
    ${({ theme }) => theme.colors.brandGreenDark}
  );
  box-shadow: ${({ theme }) => theme.shadow.greenStrong};
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-0.15rem);
    box-shadow: 0 1rem 2.4rem rgba(0, 123, 61, 0.32);
  }

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.2rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    width: 3.6rem;
    padding: 0;
  }
`;

export const ButtonLabel = styled.span`
  @media (max-width: ${breakpoints.mobile}) {
    display: none;
  }
`;

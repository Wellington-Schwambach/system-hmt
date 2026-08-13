import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Button = styled.button`
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 25;
  min-height: 3.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.7rem 1rem;
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
  transition: transform 160ms ease;

  &:hover {
    transform: translateY(-0.15rem);
  }

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.15rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    right: 1rem;
    bottom: 1rem;

    span {
      display: none;
    }
  }
`;

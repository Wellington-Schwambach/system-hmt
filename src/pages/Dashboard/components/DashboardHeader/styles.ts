import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Header = styled.header`
  position: relative;
  z-index: 1000;
  min-height: 6.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: clamp(1rem, 2vw, 1.4rem) clamp(1rem, 3vw, 1.75rem);
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.75rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  backdrop-filter: blur(0.8rem);

  @media (max-width: ${breakpoints.mobile}) {
    min-height: auto;
    align-items: flex-start;
    flex-wrap: wrap;
    border-radius: 1.35rem;
  }
`;

export const MenuButton = styled.button`
  display: none;

  @media (max-width: ${breakpoints.tablet}) {
    width: 2.8rem;
    aspect-ratio: 1;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.md};
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.brandGreen};
    cursor: pointer;
    transition:
      background 160ms ease,
      transform 160ms ease;

    &:hover {
      background: ${({ theme }) => theme.colors.brandGreenDark};
    }

    &:active {
      transform: translateY(1px);
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
      outline-offset: 3px;
    }
  }
`;

export const HeaderCopy = styled.div`
  min-width: 0;
  flex: 1;
`;

export const Eyebrow = styled.span`
  display: block;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.2rem, 2.3vw, 1.7rem);
  font-weight: 800;
  line-height: 1.15;
`;

export const Subtitle = styled.p`
  margin: 0.4rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: clamp(0.8rem, 1.5vw, 0.93rem);
  line-height: 1.5;
`;

export const Actions = styled.div`
  position: relative;
  z-index: 1010;

  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-left: auto;
`;

export const MenuSlot = styled.div`
  position: relative;
  z-index: 1020;
  overflow: visible;
`;

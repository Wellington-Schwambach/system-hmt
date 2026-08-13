import styled from 'styled-components';

import { BANNERPRINCIPAL_IMAGE } from '../../constants/assets';
import { breakpoints } from '../../styles/breakpoints';

export const LoginPage = styled.main`
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(31rem, 0.88fr);
  overflow: hidden;
  background: ${({ theme }) => theme.colors.dashboardBackground};

  &::before {
    content: '';
    position: absolute;
    inset: 0 39% 0 0;
    z-index: 0;
    background:
      linear-gradient(
        90deg,
        rgba(0, 58, 29, 0.9) 0%,
        rgba(0, 89, 44, 0.68) 42%,
        rgba(0, 123, 61, 0.28) 72%,
        rgba(0, 123, 61, 0.08) 100%
      ),
      linear-gradient(180deg, rgba(0, 35, 18, 0.15), rgba(0, 35, 18, 0.52)),
      url(${BANNERPRINCIPAL_IMAGE}) center / cover no-repeat;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    z-index: 1;
    left: 42%;
    bottom: -13rem;
    width: 34rem;
    height: 35rem;
    transform: rotate(20deg);
    border-radius: 5rem;
    background: linear-gradient(145deg, rgba(0, 166, 81, 0.42), rgba(0, 123, 61, 0.03));
    pointer-events: none;
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
    place-items: center;
    padding: 2rem 1rem;
    background:
      linear-gradient(rgba(0, 71, 35, 0.82), rgba(0, 55, 28, 0.88)),
      url(${BANNERPRINCIPAL_IMAGE}) center / cover no-repeat;

    &::before,
    &::after {
      display: none;
    }
  }
`;

export const PanelArea = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 2.3rem 2rem 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0 -12rem 0 -5rem;
    z-index: -1;
    background: radial-gradient(circle at center, #ffffff 0%, #f7fbf8 54%, #edf6f0 100%);
    clip-path: ellipse(67% 66% at 68% 50%);
  }

  @media (max-width: ${breakpoints.tablet}) {
    min-height: auto;
    width: 100%;
    padding: 0;

    &::before {
      display: none;
    }
  }
`;

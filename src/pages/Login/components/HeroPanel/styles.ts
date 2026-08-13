import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const HeroContainer = styled.section`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(2.5rem, 5vw, 5rem) clamp(2rem, 5vw, 5rem) clamp(2.2rem, 4vw, 3.6rem);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 42%;
    z-index: -1;
    background: linear-gradient(180deg, transparent, rgba(0, 40, 20, 0.48));
    pointer-events: none;
  }

  @media (max-width: ${breakpoints.tablet}) {
    display: none;
  }
`;

export const HeroContent = styled.div`
  display: grid;
  gap: clamp(2rem, 5vw, 4.25rem);
  max-width: 35rem;
`;

export const HeroEyebrow = styled.span`
  display: inline-block;
  margin-bottom: 0.75rem;
  color: #bdf2d2;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  max-width: 31rem;
  color: ${({ theme }) => theme.colors.white};
  font-size: clamp(2.45rem, 4.1vw, 4rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  text-shadow: 0 0.35rem 1.2rem rgba(0, 30, 14, 0.32);
`;

export const HeroDescription = styled.p`
  margin: 1rem 0 0;
  max-width: 31rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(1.02rem, 1.7vw, 1.28rem);
  line-height: 1.55;
  text-shadow: 0 0.2rem 0.8rem rgba(0, 30, 14, 0.3);
`;

export const HeroFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
`;

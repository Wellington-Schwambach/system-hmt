import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const PanelContainer = styled.section`
  position: relative;
  z-index: 3;
  align-self: center;
  width: min(100%, 41.5rem);
  min-height: min(53rem, calc(100vh - 4rem));
  display: flex;
  flex-direction: column;
  padding: clamp(2rem, 4vw, 4.6rem) clamp(1.5rem, 4vw, 4.7rem) 2rem;
  border: 1px solid rgba(0, 166, 81, 0.14);
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: 0 1.5rem 4rem rgba(0, 92, 45, 0.14);
  backdrop-filter: blur(1rem);

  @media (max-width: ${breakpoints.tablet}) {
    width: min(100%, 37rem);
    min-height: auto;
  }

  @media (max-width: ${breakpoints.mobile}) {
    border-radius: 1.25rem;
    padding: 1.5rem;
  }
`;

export const MobileBrand = styled.div`
  display: none;
  margin-bottom: 2rem;

  @media (max-width: ${breakpoints.tablet}) {
    display: block;
  }
`;

export const PanelHeader = styled.header`
  display: grid;
  gap: 0.65rem;
  margin-bottom: 2.8rem;
  text-align: center;
`;

export const PanelEyebrow = styled.span`
  color: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(2rem, 3vw, 2.55rem);
  letter-spacing: -0.035em;
`;

export const PanelSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: clamp(1rem, 1.5vw, 1.15rem);
`;

export const PanelFooter = styled.footer`
  margin-top: auto;
  padding-top: 3.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.82rem;
  text-align: center;
`;

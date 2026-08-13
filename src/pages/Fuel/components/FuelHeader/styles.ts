import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Header = styled.section`
  min-height: 9.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.75rem;
  background:
    radial-gradient(circle at 88% 18%, rgba(0, 166, 81, 0.16), transparent 12rem),
    ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: ${breakpoints.mobile}) {
    min-height: auto;
    align-items: flex-start;
    border-radius: 1.35rem;
  }
`;

export const TitleGroup = styled.div`
  max-width: 48rem;
`;

export const Kicker = styled.span`
  display: block;
  margin-bottom: 0.35rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  line-height: 1.05;
`;

export const Description = styled.p`
  max-width: 46rem;
  margin: 0.7rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: clamp(0.86rem, 1.6vw, 0.98rem);
  line-height: 1.6;
`;

export const IconCluster = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding-right: 0.5rem;

  @media (max-width: ${breakpoints.mobile}) {
    display: none;
  }
`;

export const IconTile = styled.span<{ $secondary?: boolean }>`
  width: 3.4rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 0.25rem solid ${({ theme }) => theme.colors.white};
  border-radius: 1rem;
  color: ${({ theme, $secondary }) => ($secondary ? theme.colors.brandGreenDark : theme.colors.white)};
  background: ${({ theme, $secondary }) =>
    $secondary ? theme.colors.brandGreenSoft : theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};

  & + & {
    margin-left: -0.8rem;
    transform: translateY(1rem);
  }
`;

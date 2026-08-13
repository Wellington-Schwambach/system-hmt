import styled from 'styled-components';

export const Container = styled.section`
  min-height: 28rem;
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 4vw, 3.5rem);
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.75rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  text-align: center;
`;

export const Content = styled.div`
  max-width: 34rem;
`;

export const IconBox = styled.div`
  width: 4.5rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  margin: 0 auto 1.25rem;
  border-radius: 1.35rem;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.colors.brandGreen},
    ${({ theme }) => theme.colors.brandGreenDark}
  );
  box-shadow: ${({ theme }) => theme.shadow.green};
`;

export const Eyebrow = styled.span`
  display: block;
  margin-bottom: 0.45rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  line-height: 1.15;
`;

export const Description = styled.p`
  margin: 0.8rem auto 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.98rem;
  line-height: 1.7;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem;
  padding: 0.55rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.82rem;
  font-weight: 800;
`;

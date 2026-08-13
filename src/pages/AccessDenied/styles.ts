import styled from 'styled-components';

export const Page = styled.div`
  min-height: 55vh;
  display: grid;
  place-items: center;
`;

export const Card = styled.section`
  width: min(32rem, 100%);
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  text-align: center;
`;

export const IconWrap = styled.div`
  width: 3.6rem;
  height: 3.6rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.4rem;
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  line-height: 1.6;
`;

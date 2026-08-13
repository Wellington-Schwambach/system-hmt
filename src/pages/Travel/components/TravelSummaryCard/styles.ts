import styled from 'styled-components';

export const Card = styled.article`
  min-width: 0;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.35rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const IconBox = styled.span`
  width: 2.65rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  margin-bottom: 0.8rem;
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.brandGreen},
    ${({ theme }) => theme.colors.brandGreenDark}
  );
`;

export const Label = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Value = styled.strong`
  display: block;
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  line-height: 1.15;
`;

export const Helper = styled.span`
  display: block;
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
`;

export const Breakdown = styled.div`
  display: grid;
  gap: 0.32rem;
  margin-top: 0.7rem;
  padding-top: 0.65rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const BreakdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
`;

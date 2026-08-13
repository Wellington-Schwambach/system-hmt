import styled from 'styled-components';

export const Card = styled.article`
  min-width: 0;
  min-height: 4rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const IconBox = styled.span`
  width: 2.55rem;
  aspect-ratio: 1;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
`;

export const Value = styled.strong`
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.05rem, 1.8vw, 1.35rem);
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
`;

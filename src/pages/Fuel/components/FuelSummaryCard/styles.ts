import styled from 'styled-components';

export const Card = styled.article`
  position: relative;
  min-width: 0;
  min-height: 4.15rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.05rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const IconBox = styled.span`
  width: 2.35rem;
  aspect-ratio: 1;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
`;

export const Content = styled.div`
  min-width: 0;
`;

export const Label = styled.span`
  display: block;
  margin-bottom: 0.18rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.035em;
  text-transform: uppercase;
`;

export const Value = styled.strong`
  display: block;
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
`;

export const CardAction = styled.div`
  position: absolute;
  top: 0.42rem;
  right: 0.42rem;

  button {
    width: 1.9rem;
    height: 1.9rem;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
    border-radius: 0.62rem;
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.dashboardSurface};
    cursor: pointer;
    transition: transform 150ms ease, background 150ms ease;
  }

  button:hover {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }
`;

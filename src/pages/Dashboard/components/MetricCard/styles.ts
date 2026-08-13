import styled, { css } from 'styled-components';

interface CardStateProps {
  $isClickable?: boolean;
}

const cardStyles = css<CardStateProps>`
  min-width: 0;
  min-height: 10.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.15rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.5rem;
  color: inherit;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  overflow: hidden;
  text-align: left;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;

  ${({ $isClickable }) =>
    $isClickable &&
    css`
      cursor: pointer;

      &:focus-visible {
        outline: 3px solid ${({ theme }) => theme.colors.brandGreenBorder};
        outline-offset: 3px;
      }
    `}

  &::after {
    content: '';
    position: absolute;
    right: -2.4rem;
    bottom: -3.2rem;
    width: 7rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:hover {
    transform: translateY(-0.2rem);
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    box-shadow: ${({ theme }) => theme.shadow.dashboardHover};
  }
`;

export const Card = styled.article<CardStateProps>`
  ${cardStyles}
`;

export const ClickableCard = styled.button<CardStateProps>`
  ${cardStyles}
  width: 100%;
  font: inherit;
`;

export const CardHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const IconWrapper = styled.span`
  width: 2.8rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.brandGreen},
    ${({ theme }) => theme.colors.brandGreenDark}
  );
  box-shadow: ${({ theme }) => theme.shadow.green};
`;

export const TrendIcon = styled.span`
  color: ${({ theme }) => theme.colors.brandGreen};
`;

export const Title = styled.h2`
  position: relative;
  z-index: 1;
  margin: 1rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const Value = styled.strong`
  position: relative;
  z-index: 1;
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1.1;
`;

export const Caption = styled.span`
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding-top: 0.6rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
`;

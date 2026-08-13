import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const Page = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-bottom: 2rem;
`;

export const Toolbar = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.2rem 0.15rem;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
  }
`;

export const TitleGroup = styled.div``;

export const Eyebrow = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0.2rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.25rem, 2.3vw, 1.75rem);
`;

export const Subtitle = styled.p`
  margin: 0.3rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
  line-height: 1.45;
`;

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

export const ToolbarButton = styled.button<{ $primary?: boolean }>`
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ $primary, theme }) => ($primary ? theme.colors.white : theme.colors.dashboardText)};
  background: ${({ $primary, theme }) => ($primary ? theme.colors.brandGreen : theme.colors.surfaceElevated)};
  box-shadow: ${({ $primary, theme }) => ($primary ? theme.shadow.green : 'none')};
  font-size: 0.74rem;
  font-weight: 850;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;
  }
`;

export const SavedNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.74rem;
  font-weight: 750;
`;

export const TripGrid = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
  align-items: start;
  gap: 0.85rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: minmax(0, 1fr) minmax(13rem, 15.5rem);
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

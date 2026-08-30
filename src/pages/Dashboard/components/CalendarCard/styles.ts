import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

interface DayProps {
  $isCurrentMonth: boolean;
  $isToday: boolean;
  $hasLoads: boolean;
}

export const Card = styled.article`
  min-width: 0;
  min-height: 20rem;
  padding: 1.15rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.6rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const HeaderIcon = styled.span`
  width: 2.5rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
`;

export const HeaderTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
  text-transform: capitalize;
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: clamp(0.25rem, 0.8vw, 0.5rem);
  margin-top: 1rem;
`;

export const WeekDay = styled.span`
  min-width: 0;
  padding: 0.25rem 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: clamp(0.62rem, 1vw, 0.72rem);
  font-weight: 800;
  text-align: center;
`;

export const Day = styled.button<DayProps>`
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ $hasLoads, $isCurrentMonth, theme }) =>
    $isCurrentMonth && $hasLoads ? theme.colors.brandGreenBorder : 'transparent'};
  border-radius: 50%;
  color: ${({ $isCurrentMonth, $isToday, theme }) => {
    if ($isToday) return theme.colors.white;
    return $isCurrentMonth ? theme.colors.dashboardText : theme.colors.dashboardTextSoft;
  }};
  background: ${({ $isToday, $hasLoads, $isCurrentMonth, theme }) => {
    if ($isToday) return theme.colors.brandGreen;
    if ($isCurrentMonth && $hasLoads) return theme.colors.brandGreenSoft;
    return 'transparent';
  }};
  font: inherit;
  cursor: ${({ $isCurrentMonth }) => ($isCurrentMonth ? 'pointer' : 'default')};
  transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;

  &:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.brandGreen};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 1;
  }
`;

export const DayNumber = styled.span`
  font-size: clamp(0.7rem, 1.2vw, 0.82rem);
  font-weight: 700;
`;

export const DayCount = styled.span`
  position: absolute;
  right: -0.15rem;
  bottom: -0.05rem;
  min-width: 1.2rem;
  height: 1.2rem;
  display: grid;
  place-items: center;
  padding: 0 0.28rem;
  border: 2px solid ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 999px;
  color: #fff;
  background: ${({ theme }) => theme.colors.brandGreenDark};
  font-size: 0.62rem;
  font-weight: 900;
  line-height: 1;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2400;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(7, 18, 12, 0.62);
  backdrop-filter: blur(0.35rem);
`;

export const Modal = styled.section`
  width: min(72rem, 100%);
  max-height: calc(100dvh - 2.5rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.5rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.35);

  @media (max-width: ${breakpoints.mobile}) {
    max-height: calc(100dvh - 1rem);
    border-radius: 1rem;
  }
`;

export const ModalHeader = styled.header`
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.08rem;
`;

export const ModalSubtitle = styled.p`
  margin: 0.3rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
`;

export const ModalClose = styled.button`
  width: 2.4rem;
  aspect-ratio: 1;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const ModalBody = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem 1.25rem 1.25rem;
  overflow-y: auto;
`;

export const LoadCard = styled.article<{ $accent: string }>`
  flex: 0 0 auto;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ $accent }) => `${$accent}55`};
  border-left: 0.28rem solid ${({ $accent }) => $accent};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const LoadCardHeader = styled.header<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${({ $accent }) => `${$accent}35`};
  background: ${({ $accent }) => `${$accent}12`};

  @media (max-width: ${breakpoints.mobile}) {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }
`;

export const ShipperName = styled.strong`
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
  font-weight: 850;
  overflow-wrap: anywhere;
`;

export const ShipownerName = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.92rem;
  font-weight: 800;
  text-align: right;
  overflow-wrap: anywhere;

  @media (max-width: ${breakpoints.mobile}) {
    justify-content: flex-start;
    text-align: left;
  }
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.28rem 0.5rem;
  border-radius: 999px;
  color: #0b6b35;
  background: #dff6e8;
  font-size: 0.66rem;
  font-weight: 850;
  white-space: nowrap;
`;

export const LoadCardBody = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 0.9fr 0.9fr 1.2fr 1.2fr 1fr 1.1fr;

  @media (max-width: 68rem) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const LoadMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  color: ${({ theme }) => theme.colors.dashboardTextMuted};

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const LoadMetaItem = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.72rem 0.85rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.63rem;
    font-weight: 800;
    letter-spacing: 0.045em;
    text-transform: uppercase;
  }

  strong {
    min-width: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.78rem;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
`;

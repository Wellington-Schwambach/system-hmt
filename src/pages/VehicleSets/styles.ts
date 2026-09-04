import styled, { css, keyframes } from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.72; }
  50% { transform: scale(1.08); opacity: 1; }
`;

const control = css`
  width: 100%;
  min-height: 2.85rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Page = styled.main`
  min-width: 0;
  display: grid;
  gap: 1rem;
  padding-bottom: 3rem;
`;

export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: clamp(1.35rem, 3vw, 1.85rem);
  }

  p {
    margin: 0.28rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.82rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const HeaderStats = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

export const StatChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.72rem;
  font-weight: 850;
`;

export const Builder = styled.section`
  overflow: visible;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.15rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const BuilderTop = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3.6rem minmax(0, 1fr);
  gap: 0.8rem;
  align-items: start;
  padding: 1rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export const SelectionBlock = styled.div`
  min-width: 0;
  display: grid;
  align-content: start;
  align-self: start;
  gap: 0.7rem;
`;

export const SecondaryTrailerPanel = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.6rem;
  margin-top: 0.15rem;
  padding: 0.75rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const SecondaryTrailerHeader = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.72rem;
  }

  small {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.66rem;
    font-weight: 700;
  }

  > button {
    min-height: 2.2rem;
    padding-block: 0.4rem;
  }
`;

export const StepTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

export const StepNumber = styled.span`
  width: 1.55rem;
  height: 1.55rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.72rem;
`;

export const VehicleCard = styled.div<{ $selected: boolean }>`
  min-height: 13.5rem;
  display: grid;
  grid-template-columns: minmax(10rem, 1.05fr) minmax(12rem, 0.95fr);
  gap: 0.8rem;
  align-items: center;
  padding: 0.9rem;
  border: 1px solid ${({ $selected, theme }) =>
    $selected ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder};
  border-radius: 0.95rem;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated};
  transition: border-color 160ms ease, background 160ms ease;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const EmptyVehicle = styled.div`
  grid-column: 1 / -1;
  min-height: 11rem;
  display: grid;
  place-items: center;
  padding: 1.2rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.78rem;
`;

export const VehicleVisual = styled.div`
  min-height: 10.5rem;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  padding: 0.45rem 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background:
    radial-gradient(circle at 50% 70%, ${({ theme }) => theme.colors.brandGreenSoft} 0, transparent 58%),
    linear-gradient(180deg, transparent 76%, ${({ theme }) => theme.colors.dashboardBorder} 77%, transparent 78%),
    ${({ theme }) => theme.colors.dashboardSurface};
`;

export const VehiclePhoto = styled.img<{ $trailer: boolean }>`
  width: ${({ $trailer }) => ($trailer ? '100%' : '88%')};
  max-width: ${({ $trailer }) => ($trailer ? '18rem' : '14.5rem')};
  max-height: 10.7rem;
  display: block;
  object-fit: contain;
  object-position: center;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 0.65rem 0.7rem rgba(0, 0, 0, 0.2));
  transition: transform 180ms ease;

  ${VehicleCard}:hover & {
    transform: scale(1.018);
  }
`;

export const TrailerDrawing = styled.div`
  width: min(13rem, 85%);
  height: 5rem;
  position: relative;
  border: 2px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.28rem 0.28rem 0.12rem 0.12rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: inset 0 -0.4rem 0 ${({ theme }) => theme.colors.dashboardBorder};

  &::before,
  &::after {
    content: '';
    position: absolute;
    bottom: -1.15rem;
    width: 1.45rem;
    height: 1.45rem;
    border: 0.3rem solid ${({ theme }) => theme.colors.dashboardTextMuted};
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }

  &::before { right: 1.25rem; }
  &::after { right: 3.15rem; }
`;

export const DetailList = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.42rem 0.6rem;
  margin: 0;
  font-size: 0.72rem;

  dt {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-weight: 750;
  }

  dd {
    min-width: 0;
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-weight: 780;
    overflow-wrap: anywhere;
  }
`;

export const LinkBridge = styled.div`
  display: grid;
  place-items: center;

  span {
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    animation: ${pulse} 2.2s ease-in-out infinite;
  }

  @media (max-width: ${breakpoints.desktop}) {
    display: none;
  }
`;

export const BuilderLower = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(17rem, 0.75fr);
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export const Workflow = styled.div`
  display: grid;
`;

export const WorkflowSection = styled.section`
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:last-child { border-bottom: 0; }
`;

export const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(12rem, 1fr));
  gap: 0.7rem;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: grid;
  gap: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.72rem;
  font-weight: 820;
`;

export const DateTimeInput = styled.input`
  ${control}
  color-scheme: ${({ theme }) => theme.mode};
`;

export const DriverGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(15rem, 1.25fr) minmax(12rem, 0.75fr);
  gap: 0.8rem;
  align-items: start;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const DriverCard = styled.div`
  min-width: 0;
  min-height: 8.1rem;
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 0.8rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const DriverAvatar = styled.div`
  width: 3.6rem;
  height: 3.6rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const InfoHint = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.7rem;
  line-height: 1.45;
`;

export const Summary = styled.aside`
  display: grid;
  align-content: start;
  gap: 0.8rem;
  padding: 1rem;
  border-left: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceGlass};

  @media (max-width: ${breakpoints.desktop}) {
    border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    border-left: 0;
  }
`;

export const SummaryTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
  text-transform: uppercase;
`;

export const SummaryCard = styled.div`
  display: grid;
  gap: 0.7rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: 1rem 4.6rem minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;

  svg { color: ${({ theme }) => theme.colors.brandGreen}; }
  strong { color: ${({ theme }) => theme.colors.dashboardText}; overflow-wrap: anywhere; }
`;

export const ActiveBanner = styled.div<{ $ready: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6rem;
  border-radius: 0.7rem;
  color: ${({ $ready, theme }) => ($ready ? theme.colors.white : theme.colors.dashboardTextMuted)};
  background: ${({ $ready, theme }) => ($ready ? theme.colors.brandGreen : theme.colors.dashboardSurface)};
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
`;

export const BuilderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0 1rem 1rem;

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    grid-template-columns: 1fr;

    > button { width: 100%; }
  }
`;

export const PrimaryButton = styled.button`
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font: inherit;
  font-size: 0.74rem;
  font-weight: 850;
  cursor: pointer;

  &:disabled { opacity: 0.48; cursor: not-allowed; }
`;

export const SecondaryButton = styled.button`
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-size: 0.74rem;
  font-weight: 820;
  cursor: pointer;

  &:disabled { opacity: 0.48; cursor: not-allowed; }
`;

export const DangerButton = styled(SecondaryButton)`
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.dangerBorder};
  background: ${({ theme }) => theme.colors.dangerSoft};
`;

export const BottomGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.55fr);
  gap: 1rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
  padding: 0.8rem 0.95rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.82rem;
    text-transform: uppercase;
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.68rem;
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 49rem;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 0.72rem 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.64rem;
  font-weight: 880;
  text-align: left;
  text-transform: uppercase;
`;

export const Td = styled.td`
  padding: 0.72rem 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.7rem;
`;

export const ActionBadge = styled.span<{ $type: 'green' | 'blue' | 'orange' | 'red' }>`
  display: inline-flex;
  padding: 0.28rem 0.5rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.62rem;
  font-weight: 850;
  color: ${({ $type, theme }) =>
    $type === 'red'
      ? theme.colors.danger
      : $type === 'orange'
        ? '#b56618'
        : $type === 'blue'
          ? theme.colors.primary
          : theme.colors.brandGreenDark};
  background: ${({ $type, theme }) =>
    $type === 'red'
      ? theme.colors.dangerSoft
      : $type === 'orange'
        ? 'rgba(234, 88, 12, 0.1)'
        : $type === 'blue'
          ? 'rgba(37, 99, 235, 0.1)'
          : theme.colors.brandGreenSoft};
`;

export const ActiveList = styled.div<{ $scrollable?: boolean }>`
  display: grid;
  gap: 0.65rem;
  padding: 0.8rem;
  max-height: ${({ $scrollable }) => ($scrollable ? '35rem' : 'none')};
  overflow-y: ${({ $scrollable }) => ($scrollable ? 'auto' : 'visible')};
  overscroll-behavior: contain;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 0.45rem;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }
`;

export const SearchInput = styled.input`
  ${control}
  min-height: 2.4rem;
  padding: 0.48rem 0.7rem;
  font-size: 0.72rem;
`;

export const ActiveCard = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 2.3rem minmax(0, 1fr) auto;
  gap: 0.7rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    transform: translateY(-1px);
  }
`;

export const ActiveIcon = styled.div`
  width: 2.3rem;
  height: 2.3rem;
  display: grid;
  place-items: center;
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const ActiveText = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.2rem;

  strong { font-size: 0.74rem; }
  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.66rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Empty = styled.div`
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.74rem;
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
`;

export const PageButton = styled.button`
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export const PageInfo = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 14000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(0.18rem);

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.45rem;
  }
`;

export const Modal = styled.div`
  width: min(38rem, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  h3 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1rem; }
  p { margin: 0.25rem 0 0; color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.72rem; }
`;

export const CloseButton = styled.button`
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;
`;

export const ModalBody = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem;
`;

export const ModalSection = styled.section`
  display: grid;
  gap: 0.7rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};

  h4 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 0.8rem; }
  p { margin: 0; color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.68rem; }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  flex-wrap: wrap;

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    grid-template-columns: 1fr;

    > button { width: 100%; }
  }
`;

export const HistoryFilters = styled.div`
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) minmax(9.5rem, 0.65fr) minmax(9.5rem, 0.65fr);
  gap: 0.65rem;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

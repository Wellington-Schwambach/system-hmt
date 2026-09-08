import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const Page = styled.main`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1.55rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;

    h1 { font-size: 1.3rem; }
    > button { width: 100%; }
  }
`;

export const PrimaryButton = styled.button`
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.7rem;
  color: #fff;
  background: ${({ theme }) => theme.colors.brandGreen};
  font-weight: 750;
  cursor: pointer;

  &:disabled { opacity: 0.62; cursor: not-allowed; }
`;

export const SecondaryButton = styled.button`
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-weight: 700;
  cursor: pointer;
`;

export const IconButton = styled.button`
  width: 2.5rem;
  min-width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
`;

export const Toolbar = styled.section`
  display: grid;
  grid-template-columns: minmax(20rem, auto) minmax(34rem, 1fr) minmax(15rem, 20rem);
  align-items: center;
  gap: 0.85rem;

  @media (max-width: 1320px) {
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 20rem);

    > :nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;

    > :nth-child(2) {
      grid-column: auto;
      grid-row: auto;
    }
  }
`;

export const WeekControls = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;

  @media (max-width: 820px) {
    flex-wrap: wrap;
  }

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    grid-template-columns: auto auto auto minmax(0, 1fr);

    > :last-child {
      grid-column: 1 / -1;
      width: 100%;
    }
  }
`;

export const MonthTitle = styled.strong`
  min-width: 9.5rem;
  margin: 0 0.3rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.95rem;
  text-transform: capitalize;

  @media (max-width: ${breakpoints.mobile}) {
    min-width: 0;
    margin: 0;
    text-align: right;
    font-size: 0.82rem;
  }
`;

export const CalendarToggle = styled.button<{ $active: boolean }>`
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardBorder)};
  border-radius: 0.65rem;
  color: ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardText)};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  font-weight: 750;
  cursor: pointer;
`;

export const OperationalTabs = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const OperationalTabButton = styled.button<{ $active: boolean }>`
  min-width: 0;
  min-height: 2.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardBorder)};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  cursor: pointer;

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.78rem;
    font-weight: ${({ $active }) => ($active ? 850 : 700)};
  }

  > strong {
    min-width: 1.65rem;
    height: 1.65rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.dashboardText)};
    background: ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardSurface)};
    font-size: 0.7rem;
  }
`;

export const FilterBox = styled.div`
  width: 100%;
  min-width: 0;

  > div > div:first-child {
    min-height: 2.65rem;
    border-radius: 0.7rem;
  }
`;

export const CalendarDropdown = styled.section`
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.9rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 0.75rem 2rem rgba(13, 35, 22, 0.08);
`;

export const WeekCalendarHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.84rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
    gap: 0.55rem;

    > button { width: 100%; }
  }
`;

export const WeekRangeText = styled.span`
  display: block;
  margin-top: 0.18rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.7rem;
`;

export const WeekDatesScroller = styled.div`
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
`;

export const WeekDatesGrid = styled.div`
  min-width: 78rem;
  display: grid;
  grid-template-columns: repeat(7, minmax(10.8rem, 1fr));

  @media (max-width: ${breakpoints.mobile}) {
    min-width: 70rem;
    scroll-snap-type: x proximity;
  }
`;

export const CalendarDayButton = styled.button<{ $selected: boolean; $today: boolean }>`
  min-width: 0;
  min-height: 10.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.65rem;
  padding: 0.72rem;
  border: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  cursor: pointer;
  scroll-snap-align: start;
  text-align: left;

  &:last-child { border-right: 0; }

  .day-heading {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .day-heading > span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .day-heading > strong {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    color: ${({ $today }) => ($today ? '#fff' : 'inherit')};
    background: ${({ $today, theme }) => ($today ? theme.colors.brandGreen : 'transparent')};
    font-size: 0.9rem;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: -2px;
  }
`;

export const CalendarDayFlow = styled.div`
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const CalendarDayFlowColumn = styled.div`
  min-width: 0;
  padding: 0.5rem;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  }

  > em {
    display: block;
    padding-top: 0.3rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
    font-style: normal;
    text-align: center;
  }
`;

export const CalendarDayFlowTitle = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  margin-bottom: 0.42rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.5rem;
  font-weight: 850;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  > strong {
    min-width: 1.2rem;
    height: 1.2rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    font-size: 0.6rem;
  }
`;

export const CalendarShipperCount = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 0.38rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.28rem;
  padding: 0.18rem 0;

  > i {
    width: 0.38rem;
    height: 0.38rem;
    display: block;
    border-radius: 999px;
  }

  > span {
    min-width: 0;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.66rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.66rem;
    font-weight: 900;
  }
`;

export const LoadsSection = styled.section`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const LoadsHeader = styled.header`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.72rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.55rem;
  }
`;

export const LoadsCount = styled.span`
  flex: 0 0 auto;
  padding: 0.35rem 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.72rem;
  font-weight: 800;
`;

export const LoadList = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.7rem;
  }
`;

export const LoadCard = styled.article<{ $accent: string }>`
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ $accent }) => `${$accent}55`};
  border-left: 0.3rem solid ${({ $accent }) => $accent};
  border-radius: 0.8rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 0.25rem 1rem rgba(15, 37, 25, 0.05);
`;

export const LoadCardHeader = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid ${({ $accent }) => `${$accent}2f`};
  background: ${({ $accent }) => `${$accent}12`};

  @media (max-width: ${breakpoints.mobile}) {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.55rem;
  }
`;

export const ShipperBadge = styled.span<{ $accent: string }>`
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.2;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: '';
    display: inline-block;
    width: 0.45rem;
    height: 0.45rem;
    margin-right: 0.45rem;
    border-radius: 999px;
    background: ${({ $accent }) => $accent};
    vertical-align: 0.08rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 0.92rem;
  }
`;

export const ArmadorTitle = styled.div`
  min-width: 0;
  text-align: right;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1.05rem;
    font-weight: 850;
    line-height: 1.2;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  @media (max-width: ${breakpoints.mobile}) {
    strong { font-size: 0.9rem; }
  }
`;

export const CardActions = styled.div`
  min-width: 0;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    justify-content: space-between;
    gap: 0.4rem;
  }
`;

export const CardBody = styled.div`
  display: grid;
  grid-template-columns: 0.9fr 1fr 1fr 1.25fr 1.25fr 1fr 1.2fr;
  padding: 0;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const CardMeta = styled.div`
  display: grid;
  grid-template-columns: minmax(10rem, 0.8fr) minmax(14rem, 1.2fr);
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  > div:first-child {
    border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;

    > div:first-child {
      border-right: 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    }
  }
`;

export const DataItem = styled.div`
  min-width: 0;
  padding: 0.7rem 0.65rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:last-child { border-right: 0; }

  span {
    display: block;
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.035em;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.74rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  @media (max-width: 1100px) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    &:nth-child(4n) { border-right: 0; }
  }

  @media (max-width: 700px) {
    &:nth-child(odd) { border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder}; }
    &:nth-child(even) { border-right: 0; }
  }

  @media (max-width: 420px) {
    border-right: 0 !important;
  }
`;

export const EmptyState = styled.div`
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

export const LoadingState = styled(EmptyState)`
  display: flex;
  gap: 0.55rem;
`;

export const DrawerBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(7, 19, 12, 0.52);
  backdrop-filter: blur(4px);
`;

export const Drawer = styled.aside`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2210;
  width: min(76rem, calc(100vw - 2.5rem));
  max-width: 96vw;
  height: min(50rem, calc(100dvh - 3rem));
  max-height: calc(100dvh - 3rem);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  transform: translate(-50%, -50%);
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 1.75rem 5rem rgba(5, 20, 12, 0.32);

  @media (max-width: 900px) {
    width: min(48rem, calc(100vw - 1.5rem));
    height: calc(100dvh - 1.5rem);
    max-height: calc(100dvh - 1.5rem);
  }

  @media (max-width: ${breakpoints.mobile}) {
    width: calc(100vw - 0.75rem);
    height: calc(100dvh - 0.75rem);
    max-width: none;
    max-height: none;
    border-radius: 0.95rem;
  }
`;

export const DrawerHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.35rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  h2 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1.25rem; }
  p { margin: 0.3rem 0 0; color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.78rem; }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.9rem;
    h2 { font-size: 1.08rem; }
    p { display: none; }
  }
`;

export const DrawerBody = styled.div`
  min-width: 0;
  min-height: 0;
  padding: 1.15rem 1.35rem 1.4rem;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.8rem;
  }
`;

export const DrawerFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.35rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 -0.5rem 1.25rem rgba(16, 45, 27, 0.04);

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 0.75rem;

    > button:last-child:nth-child(3) { grid-column: 1 / -1; }
  }
`;

export const AccentPreview = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid ${({ $accent }) => `${$accent}55`};
  border-left: 0.28rem solid ${({ $accent }) => $accent};
  border-radius: 0.75rem;
  background: ${({ $accent }) => `${$accent}12`};

  strong { display: block; color: ${({ theme }) => theme.colors.dashboardText}; }
  span { color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.72rem; }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;

  .full { grid-column: 1 / -1; }
  .half { grid-column: span 2; }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    .full { grid-column: 1 / -1; }
    .half { grid-column: span 1; }
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
    .full, .half { grid-column: auto; }
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.72rem;
  font-weight: 760;
`;

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 2.65rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Select = styled.select`
  width: 100%;
  min-width: 0;
  min-height: 2.65rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-width: 0;
  min-height: 8rem;
  resize: vertical;
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const FinalizeButton = styled(PrimaryButton)`
  background: #15803d;
`;

export const FinalizedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  flex: 0 0 auto;
  margin-top: 0.28rem;
  padding: 0.28rem 0.48rem;
  border: 1px solid rgba(22, 163, 74, 0.28);
  border-radius: 999px;
  color: #15803d;
  background: rgba(22, 163, 74, 0.09);
  font-size: 0.7rem;
  font-weight: 850;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.27rem 0.44rem;
    font-size: 0.64rem;
  }
`;

export const DangerButton = styled.button`
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled { opacity: 0.5; cursor: wait; }
`;

export const LoadListViewport = styled.div<{ $scrollable: boolean }>`
  min-width: 0;
  ${({ $scrollable }) => $scrollable ? `max-height: 64rem; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;` : ''}
`;

export const SketchTopBar = styled.div<{ $accent: string }>`
  min-width: 0;
  display: grid;
  grid-template-columns: 1.05fr 1fr 1fr 1.15fr 1.15fr auto;
  align-items: stretch;
  border-bottom: 1px solid ${({ $accent }) => `${$accent}45`};
  background: ${({ $accent }) => `${$accent}18`};

  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`;

export const SketchTopItem = styled.div`
  min-width: 0;
  padding: 0.75rem 0.8rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  span {
    display: block;
    margin-bottom: 0.24rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.67rem;
    font-weight: 850;
    letter-spacing: 0.045em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    min-width: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.98rem;
    font-weight: 850;
    line-height: 1.28;
    overflow-wrap: anywhere;
  }

  @media (max-width: 1180px) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    &:nth-child(3n) { border-right: 0; }
  }

  @media (max-width: 760px) {
    &:nth-child(3n) { border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder}; }
    &:nth-child(2n) { border-right: 0; }
  }

  @media (max-width: 430px) {
    border-right: 0 !important;
  }
`;

export const SketchBodyGrid = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 1.1fr 1.1fr 0.9fr 0.9fr 1.15fr 1.15fr;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const SketchBodyItem = styled.div`
  min-width: 0;
  min-height: 4.9rem;
  padding: 0.78rem 0.85rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  span {
    display: block;
    margin-bottom: 0.3rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.67rem;
    font-weight: 850;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    min-width: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.9rem;
    font-weight: 800;
    line-height: 1.32;
    overflow-wrap: anywhere;
  }

  strong + strong {
    margin-top: 0.35rem;
  }

  &:last-child { border-right: 0; }

  @media (max-width: 1100px) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    &:nth-child(3n) { border-right: 0; }
  }

  @media (max-width: 700px) {
    &:nth-child(3n) { border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder}; }
    &:nth-child(2n) { border-right: 0; }
  }

  @media (max-width: 420px) {
    border-right: 0 !important;
  }
`;

export const SketchLoadEntries = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;

  > div {
    min-width: 0;
    padding: 0.42rem 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    border-radius: 0.55rem;
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }

  small {
    display: block;
    margin-bottom: 0.22rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.62rem;
    font-weight: 850;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    margin-top: 0 !important;
    font-size: 0.85rem !important;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const SketchActions = styled.div`
  min-width: 8.8rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.62rem 0.7rem;

  @media (max-width: 1180px) {
    min-width: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  }

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

export const SketchActionButton = styled.button`
  min-height: 2.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  padding: 0.42rem 0.58rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-size: 0.66rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    color: ${({ theme }) => theme.colors.brandGreen};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  @media (max-width: 760px) {
    flex: 1 1 0;
  }
`;

export const SketchObservation = styled.div`
  min-width: 0;
  min-height: 4.75rem;
  display: grid;
  grid-template-columns: minmax(0, 2.3fr) minmax(11rem, 0.9fr) minmax(14rem, 1.1fr);
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  > div {
    min-width: 0;
    padding: 0.9rem 1rem;
    border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  }

  > div:last-child { border-right: 0; }

  span {
    display: block;
    margin-bottom: 0.28rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.64rem;
    font-weight: 850;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    min-width: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);

    > div:first-child {
      grid-column: 1 / -1;
      border-right: 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    }
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;

    > div, > div:first-child {
      grid-column: auto;
      border-right: 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    }

    > div:last-child { border-bottom: 0; }
  }
`;


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
  grid-template-columns: minmax(20rem, 1fr) minmax(15rem, 20rem);
  align-items: center;
  gap: 0.85rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
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
    font-size: 0.94rem;
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
  font-size: 0.78rem;
`;

export const WeekDatesScroller = styled.div`
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
`;

export const MonthWeekdayGrid = styled.div`
  width: max(100%, 72rem);
  display: grid;
  grid-template-columns: 3.8rem 2.8rem repeat(6, minmax(10.2rem, 1fr));
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  > span {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.55rem;
    border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.82rem;
    font-weight: 850;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }

  > span:last-child { border-right: 0; }

  /* Domingo funciona apenas como uma referência visual compacta. */
  > span:first-of-type {
    font-size: 0.72rem;
    letter-spacing: 0.02em;
  }

  @media (max-width: 1280px) {
    width: max(100%, 67rem);
    grid-template-columns: 3.5rem 2.65rem repeat(6, minmax(9.6rem, 1fr));
  }
`;

export const CalendarWeekNumberHeader = styled.div`
  display: grid;
  place-items: center;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const MonthWeekRow = styled.div`
  width: max(100%, 72rem);
  display: grid;
  grid-template-columns: 3.8rem 2.8rem repeat(6, minmax(10.2rem, 1fr));
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:last-child { border-bottom: 0; }

  @media (max-width: 1280px) {
    width: max(100%, 67rem);
    grid-template-columns: 3.5rem 2.65rem repeat(6, minmax(9.6rem, 1fr));
  }
`;

export const CalendarWeekNumber = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  padding: 0.62rem 0.2rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  > span {
    font-size: 0.52rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  > strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1.04rem;
    font-weight: 900;
  }
`;

export const CalendarEmptyDay = styled.div`
  min-height: 10.4rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  opacity: 0.45;

  &:last-child { border-right: 0; }
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

export const CalendarDayButton = styled.button<{ $selected: boolean; $today: boolean; $sunday?: boolean }>`
  min-width: 0;
  min-height: 10.4rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.72rem;
  padding: ${({ $sunday }) => ($sunday ? '0.62rem 0.18rem' : '0.82rem 0.78rem')};
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
    font-size: 0.86rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .day-heading > strong {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    color: ${({ $today }) => ($today ? '#fff' : 'inherit')};
    border: 1px solid ${({ $today, theme }) => ($today ? theme.colors.brandGreen : theme.colors.dashboardBorder)};
    background: ${({ $today, theme }) => ($today ? theme.colors.brandGreen : theme.colors.dashboardSurface)};
    font-size: 1.45rem;
    font-weight: 900;
  }

  ${({ $sunday }) => $sunday ? `
    justify-content: center;
    align-items: center;
    .day-heading {
      flex-direction: column;
      justify-content: center;
      gap: 0.38rem;
      text-align: center;
    }
    .day-heading > span {
      font-size: 0.72rem;
      letter-spacing: 0.02em;
    }
    .day-heading > strong {
      width: 2.25rem;
      height: 2.25rem;
      font-size: 1.35rem;
    }
  ` : ''}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: -2px;
  }

  &:hover {
    background: ${({ $selected, theme }) => ($selected ? theme.colors.brandGreenSoft : theme.colors.dashboardSurface)};
  }
`;

export const CalendarDayFlow = styled.div`
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: visible;
`;

export const CalendarDayFlowColumn = styled.div`
  min-width: 0;
  padding: 0.4rem 0.48rem 0.25rem;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  }

  > em {
    display: block;
    padding-top: 0.3rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.78rem;
    font-style: normal;
    text-align: center;
  }
`;

export const CalendarDayFlowTitle = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.2;
  overflow-wrap: anywhere;

  > strong {
    min-width: 1.35rem;
    height: 1.35rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    font-size: 0.76rem;
  }
`;

export const CalendarShipperCount = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 0.38rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.34rem;
  padding: 0.22rem 0;

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
    font-size: 0.84rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.84rem;
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
    font-size: 1.12rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.8rem;
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
  font-size: 0.8rem;
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
  text-transform: uppercase;

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
  font-size: 0.78rem;
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


export const SelectedDateBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 8;
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(14rem, 20rem);
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  > div:nth-child(2) {
    min-width: 0;
  }

  > div:nth-child(2) strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1.12rem;
  }

  > div:nth-child(2) span {
    display: block;
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.8rem;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

export const DayTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.72rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const DayTabButton = styled.button<{ $active: boolean }>`
  min-height: 2.45rem;
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  padding: 0.52rem 0.85rem;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong)};
  border-radius: 0.72rem;
  color: ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardTextMuted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  font-size: 0.86rem;
  font-weight: 850;
  cursor: pointer;

  > strong {
    min-width: 1.4rem;
    height: 1.4rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.dashboardText)};
    background: ${({ $active, theme }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardBorder)};
    font-size: 0.72rem;
  }
`;

export const DayHistoryList = styled.div`
  display: grid;
  gap: 0.7rem;
  padding: 0.9rem 1rem 1.1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const DayHistoryItem = styled.article<{ $accent: string }>`
  display: grid;
  grid-template-columns: minmax(9rem, 0.8fr) minmax(12rem, 1.25fr) minmax(10rem, 0.85fr) minmax(10rem, 0.85fr);
  align-items: center;
  gap: 0.8rem;
  padding: 0.78rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-left: 0.28rem solid ${({ $accent }) => $accent};
  border-radius: 0.78rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  > div {
    min-width: 0;
  }

  span {
    display: block;
    margin-bottom: 0.16rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  strong, p {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.88rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const ListViewport = styled.div`
  min-width: 0;
  width: 100%;
  height: auto;
  max-height: none;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-gutter: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  /*
   * Este elemento existe somente para a rolagem horizontal da tabela.
   * A altura acompanha todo o conteúdo e NUNCA cria uma rolagem vertical
   * própria; a rolagem vertical permanece exclusivamente na página.
   */
  @media (max-width: 1680px) {
    overflow: visible;
    padding: 0.78rem;
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }
`;

export const FixedHorizontalScrollbar = styled.div`
  position: fixed;
  bottom: 0.65rem;
  z-index: 999;
  min-height: 3rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: color-mix(in srgb, ${({ theme }) => theme.colors.surfaceElevated} 94%, transparent 6%);
  box-shadow: 0 0.5rem 1.4rem rgba(0, 0, 0, 0.14);
  backdrop-filter: blur(8px);

  > span {
    font-size: 0.72rem;
    font-weight: 850;
    white-space: nowrap;
    text-transform: uppercase;
  }

  @media (max-width: 1680px) {
    display: none;
  }
`;

export const FixedHorizontalScrollbarTrack = styled.input.attrs({ type: 'range' })`
  width: 100%;
  min-width: 0;
  height: 1.4rem;
  margin: 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  cursor: ew-resize;

  &::-webkit-slider-runnable-track {
    height: 0.48rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }

  &::-webkit-slider-thumb {
    width: 2.3rem;
    height: 1.15rem;
    margin-top: -0.34rem;
    border: 2px solid ${({ theme }) => theme.colors.surfaceElevated};
    border-radius: 999px;
    appearance: none;
    -webkit-appearance: none;
    background: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0.16rem 0.5rem rgba(0, 0, 0, 0.22);
  }

  &::-moz-range-track {
    height: 0.48rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }

  &::-moz-range-thumb {
    width: 2.3rem;
    height: 1.15rem;
    border: 2px solid ${({ theme }) => theme.colors.surfaceElevated};
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0.16rem 0.5rem rgba(0, 0, 0, 0.22);
  }
`;

const listColumns = `
  minmax(9rem, 1fr)
  minmax(7.6rem, 0.82fr)
  minmax(10rem, 1.08fr)
  minmax(7.6rem, 0.82fr)
  minmax(10rem, 1.08fr)
  minmax(7.4rem, 0.76fr)
  minmax(7.6rem, 0.84fr)
  minmax(9.5rem, 1.02fr)
  minmax(9.5rem, 1.02fr)
  minmax(8.4rem, 0.86fr)
  minmax(8.6rem, 0.9fr)
  minmax(14.5rem, 1.25fr)
`;

export const ListTable = styled.div`
  width: 100%;
  min-width: 109.7rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: 1680px) {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: transparent;
  }
`;

export const ListHeaderRow = styled.div`
  display: grid;
  grid-template-columns: ${listColumns};
  align-items: stretch;
  position: sticky;
  top: 0;
  z-index: 4;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  > span {
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0.86rem 0.72rem;
    border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.8rem;
    font-weight: 850;
    letter-spacing: 0.025em;
    line-height: 1.22;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  > span:last-child { border-right: 0; }

  @media (max-width: 1680px) {
    display: none;
  }
`;

export const ListRow = styled.div<{ $accent: string }>`
  position: relative;
  display: grid;
  grid-template-columns: ${listColumns};
  align-items: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
  transition: background 120ms ease, box-shadow 120ms ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 0.24rem;
    background: ${({ $accent }) => $accent};
    pointer-events: none;
  }

  > div:first-child {
    border-left: 0.24rem solid ${({ $accent }) => $accent};
    background: ${({ $accent, theme }) =>
      `color-mix(in srgb, ${$accent} 13%, ${theme.colors.surfaceElevated} 87%)`};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }

  &:focus-visible {
    z-index: 1;
    outline: 2px solid ${({ $accent }) => $accent};
    outline-offset: -2px;
  }

  &:last-child { border-bottom: 0; }

  @media (max-width: 1680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    border-left: 0.34rem solid ${({ $accent }) => $accent};
    border-radius: 0.9rem;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    box-shadow: 0 0.22rem 0.9rem rgba(8, 24, 14, 0.06);

    &::before { display: none; }

    > div:first-child {
      border-left: 0;
      background: ${({ $accent, theme }) =>
        `color-mix(in srgb, ${$accent} 13%, ${theme.colors.surfaceElevated} 87%)`};
    }
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const ListCell = styled.div<{ $strong?: boolean; $muted?: boolean }>`
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0.9rem 0.72rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ $muted, theme }) => ($muted ? theme.colors.dashboardTextMuted : theme.colors.dashboardText)};
  font-size: 0.92rem;
  font-weight: ${({ $strong }) => ($strong ? 820 : 650)};
  line-height: 1.38;
  overflow-wrap: anywhere;

  &:first-child { padding-left: 0.9rem; }

  @media (max-width: 1680px) {
    min-height: 4.6rem;
    display: grid;
    grid-template-columns: minmax(8.4rem, 0.42fr) minmax(0, 1fr);
    align-content: center;
    gap: 0.72rem;
    padding: 0.78rem 0.9rem;
    border-right: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    font-size: 0.94rem;

    &::before {
      color: ${({ theme }) => theme.colors.dashboardTextMuted};
      font-size: 0.72rem;
      font-weight: 850;
      letter-spacing: 0.025em;
      line-height: 1.25;
      text-transform: uppercase;
    }

    &:nth-child(1)::before { content: 'Embarcador'; }
    &:nth-child(2)::before { content: 'Origem'; }
    &:nth-child(3)::before { content: 'Observação origem'; }
    &:nth-child(4)::before { content: 'Destino'; }
    &:nth-child(5)::before { content: 'Observação destino'; }
    &:nth-child(6)::before { content: 'Hora carregamento'; }
    &:nth-child(7)::before { content: 'Armador'; }
    &:nth-child(8)::before { content: 'Coleta'; }
    &:nth-child(9)::before { content: 'Baixa'; }
    &:nth-child(10)::before { content: 'Tipo container'; }
    &:nth-child(11)::before { content: 'Status viagem'; }

    &:first-child {
      padding-left: 0.9rem;
      font-size: 1rem;
    }

    &:first-child::before {
      color: currentColor;
      opacity: 0.82;
    }
  }

  @media (max-width: 680px) {
    min-height: 0;
    grid-template-columns: minmax(7.2rem, 0.38fr) minmax(0, 1fr);
  }
`;

export const ListShipperBadge = styled.span<{ $accent: string }>`
  width: 100%;
  min-width: 0;
  display: block;
  color: ${({ $accent, theme }) => `color-mix(in srgb, ${$accent} 76%, ${theme.colors.dashboardText} 24%)`};
  font-weight: 900;
  line-height: 1.25;
  overflow-wrap: anywhere;
`;

export const OperationStageBadge = styled.span<{ $stage: 'PROGRAMMING' | 'COLLECTION' | 'LOADING' | 'DELIVERY' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.34rem 0.62rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 850;
  white-space: nowrap;
  color: ${({ $stage }) => ({
    PROGRAMMING: '#6b7280',
    COLLECTION: '#9a5b13',
    LOADING: '#1d4ed8',
    DELIVERY: '#15803d',
  }[$stage])};
  background: ${({ $stage }) => ({
    PROGRAMMING: 'rgba(107, 114, 128, 0.10)',
    COLLECTION: 'rgba(217, 119, 6, 0.12)',
    LOADING: 'rgba(37, 99, 235, 0.10)',
    DELIVERY: 'rgba(22, 163, 74, 0.11)',
  }[$stage])};
  border: 1px solid ${({ $stage }) => ({
    PROGRAMMING: 'rgba(107, 114, 128, 0.24)',
    COLLECTION: 'rgba(217, 119, 6, 0.28)',
    LOADING: 'rgba(37, 99, 235, 0.24)',
    DELIVERY: 'rgba(22, 163, 74, 0.28)',
  }[$stage])};
`;

export const ListActions = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 0.38rem;
  padding: 0.58rem 0.62rem;

  @media (max-width: 1680px) {
    grid-column: 1 / -1;
    justify-content: flex-end;
    padding: 0.78rem 0.9rem;
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }

  @media (max-width: 680px) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const ListActionButton = styled.button`
  width: 100%;
  min-width: 0;
  min-height: 2.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0.42rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.72rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 0.12rem 0.35rem rgba(8, 24, 14, 0.06);
  font-size: 0.78rem;
  font-weight: 820;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease, box-shadow 120ms ease;

  &:nth-child(1) {
    color: ${({ theme }) => theme.colors.brandGreen};
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:nth-child(2) {
    color: #245c91;
    border-color: rgba(36, 92, 145, 0.28);
    background: rgba(36, 92, 145, 0.08);
  }

  &:nth-child(3) {
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.dangerBorder};
    background: ${({ theme }) => theme.colors.dangerSoft};
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 0.28rem 0.65rem rgba(8, 24, 14, 0.10);
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  @media (max-width: 680px) {
    width: 100%;
    font-size: 0.76rem;
  }
`;

export const DetailBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2300;
  background: rgba(7, 19, 12, 0.34);
`;

export const DetailDrawer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 2310;
  width: min(30rem, 94vw);
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  border-left: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: -1rem 0 3.5rem rgba(6, 22, 13, 0.2);
`;

export const DetailHeader = styled.header<{ $accent: string }>`
  position: relative;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 1rem 1.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ $accent }) => `${$accent}12`};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 0.3rem;
    background: ${({ $accent }) => $accent};
  }

  > div:first-child { min-width: 0; }

  span {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.58rem;
    font-weight: 850;
    letter-spacing: 0.05em;
  }

  h2 {
    margin: 0.18rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1.15rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  p {
    margin: 0.2rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
  }
`;

export const DetailBody = styled.div`
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 1rem 1.2rem;
  overscroll-behavior: contain;
`;

export const DetailStatus = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 -1rem 0;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  span {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.78rem;
    font-weight: 800;
  }

  strong {
    padding: 0.28rem 0.5rem;
    border-radius: 999px;
    color: ${({ $accent }) => $accent};
    background: ${({ $accent }) => `${$accent}16`};
    font-size: 0.62rem;
    font-weight: 900;
  }
`;

export const DetailSection = styled.section`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:last-child { border-bottom: 0; }
`;

export const DetailSectionTitle = styled.h3`
  margin: 0 0 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const DetailRoute = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};

  strong {
    min-width: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.76rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  strong:last-child { text-align: right; }
  svg { color: ${({ theme }) => theme.colors.dashboardTextMuted}; }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem 0.85rem;

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailItem = styled.div<{ $full?: boolean }>`
  min-width: 0;
  grid-column: ${({ $full }) => ($full ? '1 / -1' : 'auto')};

  span {
    display: block;
    margin-bottom: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.74rem;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
`;

export const DetailText = styled.p`
  margin: 0;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;


export const ScheduleStatusButton = styled.button<{ $scheduled: boolean }>`
  min-width: 8.2rem;
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.72rem;
  border: 1px solid ${({ $scheduled }) => ($scheduled ? 'rgba(22, 163, 74, 0.38)' : 'rgba(220, 38, 38, 0.34)')};
  border-radius: 0.72rem;
  color: ${({ $scheduled }) => ($scheduled ? '#15803d' : '#b91c1c')};
  background: ${({ $scheduled }) => ($scheduled ? 'rgba(22, 163, 74, 0.11)' : 'rgba(220, 38, 38, 0.09)')};
  box-shadow: 0 0.12rem 0.35rem rgba(8, 24, 14, 0.05);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 860;
  cursor: pointer;
  line-height: 1.2;
  white-space: normal;
  text-align: center;
  transition: transform 120ms ease, box-shadow 120ms ease;

  svg { flex: 0 0 auto; }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0.28rem 0.7rem rgba(8, 24, 14, 0.10);
  }

  @media (max-width: 1180px) {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    font-size: 0.86rem;
    white-space: normal;
    text-align: left;
  }
`;

export const InlineLocationInput = styled.input`
  width: 100%;
  min-width: 9rem;
  min-height: 2.1rem;
  padding: 0.38rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.48rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-size: 0.78rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.15rem ${({ theme }) => theme.colors.brandGreenFocus};
  }

  @media (max-width: 1180px) {
    min-width: 0;
    min-height: 2.45rem;
    font-size: 0.88rem;
  }
`;

export const StatusTravelButton = styled.button`
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid rgba(37, 99, 235, 0.28);
  border-radius: 0.72rem;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.08);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 850;
  cursor: pointer;
  line-height: 1.2;
  white-space: normal;
  text-align: center;

  strong {
    min-width: 1.25rem;
    height: 1.25rem;
    display: inline-grid;
    place-items: center;
    padding: 0 0.3rem;
    border-radius: 999px;
    color: #fff;
    background: #2563eb;
    font-size: 0.62rem;
  }

  @media (max-width: 1180px) {
    width: 100%;
    justify-content: flex-start;
    font-size: 0.86rem;
    white-space: normal;
  }
`;

export const StatusVisibilityButton = styled.button<{ $visible: boolean }>`
  min-height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.42rem 0.65rem;
  border: 1px solid ${({ $visible }) => ($visible ? 'rgba(22, 163, 74, 0.3)' : 'rgba(217, 119, 6, 0.34)')};
  border-radius: 0.65rem;
  color: ${({ $visible }) => ($visible ? '#15803d' : '#9a5b13')};
  background: ${({ $visible }) => ($visible ? 'rgba(22, 163, 74, 0.10)' : 'rgba(217, 119, 6, 0.10)')};
  font: inherit;
  font-size: 0.74rem;
  font-weight: 850;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const StatusVisibilityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.55rem;

  > span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
  }
`;

export const StatusTextarea = styled.textarea`
  width: 100%;
  min-height: 7rem;
  margin-top: 0.45rem;
  resize: vertical;
  padding: 0.7rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;
  font-size: 0.76rem;
  line-height: 1.45;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.16rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const StatusHistory = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.35rem;

  h4 {
    margin: 0.2rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
`;

export const StatusHistoryItem = styled.article`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.4rem;
  }

  > div > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
  }

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.72rem;
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.64rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.74rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }
`;

export const AppointmentBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2420;
  background: rgba(7, 19, 12, 0.42);
`;

export const AppointmentModal = styled.section`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2430;
  width: min(42rem, calc(100vw - 2rem));
  max-height: min(44rem, calc(100dvh - 2rem));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  transform: translate(-50%, -50%);
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: 0 1.5rem 4rem rgba(5, 18, 11, 0.28);
`;

export const AppointmentHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  h3 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1rem; }
  p { margin: 0.2rem 0 0; color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.7rem; }
`;

export const AppointmentBody = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  overflow-y: auto;
`;

export const AppointmentRow = styled.div`
  display: grid;
  grid-template-columns: minmax(12rem, 1.15fr) minmax(11rem, 1fr) minmax(10rem, 0.9fr) auto;
  align-items: end;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  label {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.66rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  input, select {
    width: 100%;
    min-width: 0;
    min-height: 2.45rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
    border-radius: 0.55rem;
    outline: none;
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.dashboardSurface};
  }

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

export const AppointmentRemoveButton = styled.button`
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  cursor: pointer;
`;

export const AppointmentEmpty = styled.div`
  padding: 1rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.74rem;
  text-align: center;
`;

export const AppointmentAddButton = styled.button`
  min-height: 2.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  align-self: flex-start;
  padding: 0.5rem 0.75rem;
  border: 1px dashed ${({ theme }) => theme.colors.brandGreen};
  border-radius: 0.6rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
`;

export const AppointmentFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

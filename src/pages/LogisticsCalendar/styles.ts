import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  h1 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1.55rem; }

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

export const Toolbar = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(15rem, 19rem) auto;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 19rem);

    > :last-child { grid-column: 1 / -1; }
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 0.65rem;

    > :last-child { grid-column: auto; }
  }
`;

export const MonthControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  @media (max-width: ${breakpoints.mobile}) {
    display: grid;
    grid-template-columns: repeat(3, auto) minmax(0, 1fr);
    width: 100%;
    gap: 0.35rem;
  }
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

export const MonthTitle = styled.strong`
  min-width: 0;
  margin-left: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.05rem;
  text-transform: capitalize;

  @media (max-width: ${breakpoints.mobile}) {
    margin-left: 0.2rem;
    font-size: 0.9rem;
    text-align: right;
  }

  @media (max-width: 24rem) {
    grid-column: 1 / -1;
    grid-row: 2;
    margin-left: 0;
    text-align: left;
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

export const ViewTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(4.5rem, 1fr));
  min-width: 15rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  @media (max-width: 1100px) { width: 100%; }
  @media (max-width: ${breakpoints.mobile}) { min-width: 0; }
`;

export const ViewTab = styled.button<{ $active: boolean }>`
  min-height: 2.65rem;
  padding: 0 0.8rem;
  border: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ $active, theme }) => ($active ? theme.colors.dashboardText : theme.colors.dashboardTextMuted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.dashboardSurface : 'transparent')};
  font-weight: ${({ $active }) => ($active ? 800 : 650)};
  cursor: pointer;
  &:last-child { border-right: 0; }
`;

export const Workspace = styled.section<{ $detailsOpen: boolean }>`
  display: grid;
  grid-template-columns: ${({ $detailsOpen }) => ($detailsOpen ? 'minmax(30rem, 0.95fr) minmax(38rem, 1.05fr)' : 'minmax(0, 1fr)')};
  min-height: 46rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  @media (max-width: 1250px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: ${breakpoints.mobile}) {
    min-height: 0;
    border-radius: 0.85rem;
  }
`;

export const CalendarPane = styled.div<{ $detailsOpen: boolean }>`
  min-width: 0;
  border-right: ${({ $detailsOpen, theme }) => ($detailsOpen ? `1px solid ${theme.colors.dashboardBorder}` : '0')};

  @media (max-width: 1250px) {
    border-right: 0;
    border-bottom: ${({ $detailsOpen, theme }) => ($detailsOpen ? `1px solid ${theme.colors.dashboardBorder}` : '0')};
  }

  @media (max-width: ${breakpoints.mobile}) {
    display: ${({ $detailsOpen }) => ($detailsOpen ? 'none' : 'block')};
    border-bottom: 0;
  }
`;

export const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const WeekDay = styled.div`
  padding: 0.8rem 0.35rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.75rem;
  font-weight: 750;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.6rem 0.15rem;
    font-size: 0.65rem;
  }
`;

export const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: repeat(6, minmax(6.2rem, 1fr));
  min-height: 42rem;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-rows: repeat(6, minmax(4.4rem, 1fr));
    min-height: 31rem;
  }
`;

export const DayCell = styled.button<{ $outside?: boolean; $selected?: boolean; $today?: boolean }>`
  position: relative;
  min-width: 0;
  min-height: 6.2rem;
  padding: 0.75rem;
  border: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ $outside, theme }) => ($outside ? theme.colors.dashboardTextMuted : theme.colors.dashboardText)};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  text-align: left;
  cursor: pointer;
  opacity: ${({ $outside }) => ($outside ? 0.56 : 1)};

  &:nth-child(7n) { border-right: 0; }
  &:hover { background: ${({ theme }) => theme.colors.dashboardSurface}; }

  > span:first-child {
    display: inline-grid;
    place-items: center;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 999px;
    background: ${({ $today, theme }) => ($today ? theme.colors.brandGreen : 'transparent')};
    color: ${({ $today }) => ($today ? '#fff' : 'inherit')};
    font-size: 0.78rem;
    font-weight: 800;
  }

  @media (max-width: ${breakpoints.mobile}) {
    min-height: 4.4rem;
    padding: 0.35rem;

    > span:first-child {
      width: 1.55rem;
      height: 1.55rem;
      font-size: 0.68rem;
    }
  }
`;

export const DayCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
  font-weight: 800;

  @media (max-width: ${breakpoints.mobile}) {
    gap: 0.2rem;
    margin-top: 0.25rem;
    font-size: 0.65rem;
  }
`;

export const Dot = styled.span<{ $color: string }>`
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

export const CompactCalendarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 42rem;
  padding: 0.8rem;
  overflow-y: auto;
`;

export const CompactDateButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ $active, theme }) => ($active ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  text-align: left;
  cursor: pointer;

  small { color: ${({ theme }) => theme.colors.dashboardTextMuted}; }
  strong { font-size: 0.86rem; }
`;

export const DetailsPane = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: ${breakpoints.mobile}) {
    min-height: 31rem;
  }
`;

export const DetailsHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  h2 { margin: 0; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 1.05rem; }
  p { margin: 0.25rem 0 0; color: ${({ theme }) => theme.colors.dashboardTextMuted}; font-size: 0.78rem; }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.85rem;
    h2 { font-size: 0.95rem; }
  }
`;

export const LoadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-height: 0;
  max-height: 42rem;
  padding: 1rem;
  overflow-y: auto;

  @media (max-width: ${breakpoints.mobile}) {
    max-height: none;
    padding: 0.75rem;
  }
`;

export const LoadCard = styled.article<{ $accent: string }>`
  position: relative;
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
    strong {
      font-size: 0.9rem;
    }
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
  min-height: 13rem;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

export const LoadingState = styled(EmptyState)``;

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
  min-height: 2.65rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  &:focus { border-color: ${({ theme }) => theme.colors.brandGreen}; box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus}; }
`;

export const Select = styled.select`
  width: 100%;
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
  min-height: 6rem;
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

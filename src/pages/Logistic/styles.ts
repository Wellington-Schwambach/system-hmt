import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: clamp(1.35rem, 2vw, 1.8rem);
  }

  p {
    margin: 0.35rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.82rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
  }
`;

export const HeaderActions = styled.div`
  min-width: 0;
  display: flex;
  gap: 0.65rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
  }
`;

export const RangeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.55rem;
  padding: 0 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
`;

export const PrimaryButton = styled.button`
  min-height: 2.55rem;
  border: 0;
  border-radius: 0.72rem;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-weight: 750;
  box-shadow: ${({ theme }) => theme.shadow.green};
  transition: ${({ theme }) => theme.transition};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.colors.brandGreenDark};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  min-height: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  padding: 0 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-weight: 650;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const FilterPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(8.5rem, 1fr)) auto;
  gap: 0.75rem;
  align-items: end;
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: 1500px) {
    grid-template-columns: repeat(4, minmax(10rem, 1fr));
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 650;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.55rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.68rem;
  padding: 0 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Select = styled.select`
  width: 100%;
  min-height: 2.55rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.68rem;
  padding: 0 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const MainGrid = styled.div<{ $panelOpen: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
  min-width: 0;
  align-items: start;
`;

export const BoardScroll = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
  padding-bottom: 0.45rem;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 0.48rem;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }

  @media (max-width: ${breakpoints.mobile}) {
    overflow-x: hidden;
    overflow-y: visible;
    padding-bottom: 0;
  }
`;

export const Board = styled.div`
  min-width: 980px;
  display: grid;
  grid-template-columns: repeat(4, minmax(14rem, 1fr));
  gap: 0.75rem;
  align-items: start;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 0.85rem;
    padding-right: 0;
  }
`;

export const Column = styled.section<{ $dragOver: boolean }>`
  min-width: 0;
  height: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ $dragOver, theme }) => ($dragOver ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder)};
  border-radius: 0.9rem;
  background: ${({ $dragOver, theme }) => ($dragOver ? theme.colors.brandGreenSoft : theme.colors.dashboardSurface)};
  overflow: hidden;
  transition: ${({ theme }) => theme.transition};

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
`;

export const ColumnHeader = styled.div<{ $accent: string }>`
  min-height: 3.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.75rem 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  svg {
    color: ${({ $accent }) => $accent};
  }

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.9rem;
  }
`;

export const CountBadge = styled.span<{ $accent: string }>`
  min-width: 1.55rem;
  height: 1.55rem;
  padding: 0 0.45rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $accent }) => $accent};
  background: ${({ $accent }) => `${$accent}20`};
  font-size: 0.7rem;
  font-weight: 800;
`;

export const ColumnBody = styled.div<{ $scrollable: boolean; $mobileScrollable: boolean }>`
  flex: 1 1 auto;
  min-height: 0;
  max-height: ${({ $scrollable }) => ($scrollable ? '50rem' : 'none')};
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.65rem;
  overflow-y: ${({ $scrollable }) => ($scrollable ? 'auto' : 'visible')};
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: ${({ $scrollable }) => ($scrollable ? 'stable' : 'auto')};
  scrollbar-width: ${({ $scrollable }) => ($scrollable ? 'thin' : 'none')};

  &::-webkit-scrollbar {
    width: 0.42rem;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.dashboardTextSoft};
  }

  @media (max-width: ${breakpoints.mobile}) {
    /* No celular cada etapa mostra até dois tickets. Do terceiro em diante,
       somente a lista daquela etapa passa a rolar verticalmente. */
    max-height: ${({ $mobileScrollable }) => ($mobileScrollable ? '28rem' : 'none')};
    overflow-y: ${({ $mobileScrollable }) => ($mobileScrollable ? 'auto' : 'visible')};
    scrollbar-gutter: ${({ $mobileScrollable }) => ($mobileScrollable ? 'stable' : 'auto')};
    scrollbar-width: ${({ $mobileScrollable }) => ($mobileScrollable ? 'thin' : 'none')};
  }
`;

export const LoadCard = styled.article<{ $accent: string; $dragging: boolean; $selected: boolean; $finalized: boolean }>`
  position: relative;
  flex: 0 0 auto;
  min-height: max-content;
  overflow: hidden;
  border: 1px solid ${({ $selected, $accent, theme }) => ($selected ? $accent : theme.colors.dashboardBorderStrong)};
  border-top: 4px solid ${({ $accent }) => $accent};
  border-radius: 0.72rem;
  padding: 0.78rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  cursor: ${({ $finalized }) => ($finalized ? 'default' : 'grab')};
  opacity: ${({ $dragging }) => ($dragging ? 0.45 : 1)};
  transform: ${({ $dragging }) => ($dragging ? 'scale(0.985)' : 'none')};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    transform: ${({ $dragging }) => ($dragging ? 'scale(0.985)' : 'translateY(-2px)')};
    box-shadow: ${({ theme }) => theme.shadow.dashboardHover};
  }

  &:active {
    cursor: ${({ $finalized }) => ($finalized ? 'default' : 'grabbing')};
  }
`;

export const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
`;

export const CardReference = styled.div<{ $accent: string }>`
  min-width: 0;

  strong {
    display: block;
    color: ${({ $accent }) => $accent};
    font-size: 0.92rem;
    letter-spacing: 0.015em;
  }

  span {
    display: block;
    margin-top: 0.18rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.68rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const DateChip = styled.span<{ $tone: 'today' | 'tomorrow' | 'future' | 'past' | 'missing' }>`
  flex: 0 0 auto;
  padding: 0.25rem 0.42rem;
  border-radius: 0.42rem;
  font-size: 0.62rem;
  font-weight: 800;
  color: ${({ $tone }) => ({
    today: '#2563EB',
    tomorrow: '#B7791F',
    future: '#7C3AED',
    past: '#6B7280',
    missing: '#64748B',
  })[$tone]};
  background: ${({ $tone }) => ({
    today: 'rgba(37, 99, 235, 0.12)',
    tomorrow: 'rgba(245, 158, 11, 0.14)',
    future: 'rgba(124, 58, 237, 0.12)',
    past: 'rgba(107, 114, 128, 0.12)',
    missing: 'rgba(100, 116, 139, 0.12)',
  })[$tone]};
`;



export const CompletedBadge = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.42rem;
  border-radius: 0.42rem;
  color: #15803d;
  background: rgba(22, 163, 74, 0.12);
  font-size: 0.62rem;
  font-weight: 800;
`;

export const FinalizeButton = styled.button`
  width: 100%;
  min-height: 2.4rem;
  margin-top: 0.7rem;
  border: 1px solid rgba(22, 163, 74, 0.42);
  border-radius: 0.65rem;
  padding: 0 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  color: #f0fdf4;
  background: #16a34a;
  cursor: pointer;
  font-weight: 750;
  transition: ${({ theme }) => theme.transition};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #15803d;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const FinalizedSection = styled.section<{ $withTopMargin: boolean }>`
  min-width: 0;
  margin-top: ${({ $withTopMargin }) => ($withTopMargin ? '1rem' : '0')};
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.9rem;
  padding: 0.8rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const FinalizedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #16a34a;
  }

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.9rem;
  }
`;

export const FinalizedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  grid-auto-rows: max-content;
  align-items: start;
  gap: 0.7rem;
  max-height: 20rem;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding-right: 0.3rem;
  scrollbar-gutter: stable;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 0.42rem;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.dashboardTextSoft};
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: minmax(0, 1fr);
    max-height: 28rem;
    padding-right: 0.2rem;
  }
`;

export const CardRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.48rem;
`;

export const CardRow = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.72rem;

  svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const RouteRow = styled(CardRow)`
  span {
    white-space: normal;
    line-height: 1.35;
  }
`;

export const CardFooter = styled.button`
  width: 100%;
  margin-top: 0.7rem;
  padding: 0.62rem 0 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;
  font-size: 0.7rem;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const EmptyColumn = styled.div`
  min-height: 8rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.dashboardTextSoft};
  font-size: 0.72rem;
`;

export const DetailPanel = styled.aside`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1600;
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

export const PanelHeader = styled.div`
  flex: 0 0 auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.95rem;
  }
`;

export const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }
`;

export const PanelBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 0.45rem;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }
`;

export const AccentPreview = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.72rem 0.8rem;
  border: 1px solid ${({ $accent }) => `${$accent}55`};
  border-left: 4px solid ${({ $accent }) => $accent};
  border-radius: 0.68rem;
  background: ${({ $accent }) => `${$accent}12`};

  strong {
    color: ${({ $accent }) => $accent};
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.68rem;
  }
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

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 5.5rem;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.68rem;
  padding: 0.72rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  outline: none;
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
  }
`;

export const PanelActions = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 0.55rem;
  padding: 0.8rem 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  > * { flex: 1; }
`;

export const HistoryBox = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  padding-top: 0.85rem;

  h3 {
    margin: 0 0 0.65rem;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.82rem;
  }
`;

export const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

export const HistoryItem = styled.div<{ $accent: string }>`
  position: relative;
  padding: 0 0 0.1rem 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.2rem;
    width: 0.52rem;
    height: 0.52rem;
    border-radius: 999px;
    background: ${({ $accent }) => $accent};
    box-shadow: 0 0 0 3px ${({ $accent }) => `${$accent}20`};
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    margin-bottom: 0.15rem;
  }
`;

export const LoadingState = styled.div`
  min-height: 24rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
`;

export const MobileBackdrop = styled.div`
  display: block;
  position: fixed;
  inset: 0;
  z-index: 1590;
  background: ${({ theme }) => theme.colors.overlay};
`;


export const DangerButton = styled.button`
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.68rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: wait; }
`;

import styled, { css } from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const BIPage = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PeriodPanel = styled.section`
  padding: 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.35rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const PeriodHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
  }
`;

export const PeriodTitle = styled.div`
  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 1rem;
  }

  p {
    margin: 0.32rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.82rem;
  }
`;

export const PeriodActions = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.55rem;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const ActivePeriodBadge = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.2rem;
  padding: 0 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.78rem;
  font-weight: 800;
`;

export const RefreshButton = styled.button`
  flex: 0 0 auto;
  min-height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreen};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenDark};
    transform: translateY(-0.08rem);
  }

  &:focus-visible {
    outline: 0.16rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.1rem;
  }
`;

export const FilterBlock = styled.div`
  & + & {
    margin-top: 0.85rem;
  }
`;

export const FilterLabel = styled.span`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const FilterTabs = styled.div`
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0.08rem 0 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.dashboardBorderStrong} transparent;

  &::-webkit-scrollbar {
    height: 0.3rem;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }
`;

export const FilterTab = styled.button<{ $isActive: boolean }>`
  flex: 0 0 auto;
  min-height: 2.55rem;
  padding: 0 0.9rem;
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.brandGreen : theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.white : theme.colors.dashboardTextMuted};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreen : theme.colors.dashboardSurface};
  box-shadow: ${({ $isActive, theme }) => ($isActive ? theme.shadow.green : 'none')};
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    transform: translateY(-0.08rem);
  }

  &:focus-visible {
    outline: 0.16rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.1rem;
  }
`;

export const KPIGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const KPICard = styled.article`
  min-width: 0;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-0.15rem);
    box-shadow: ${({ theme }) => theme.shadow.dashboardHover};
  }
`;

export const KPIHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const KPIIcon = styled.span`
  flex: 0 0 auto;
  width: 2.65rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const KPIComparison = styled.span<{ $tone: 'positive' | 'negative' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  min-height: 1.8rem;
  padding: 0 0.55rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 850;

  ${({ $tone, theme }) => {
    if ($tone === 'positive') {
      return css`
        color: ${theme.colors.brandGreenDark};
        background: ${theme.colors.brandGreenSoft};
      `;
    }

    if ($tone === 'negative') {
      return css`
        color: ${theme.colors.danger};
        background: ${({ theme }) => theme.colors.dangerSoft};
      `;
    }

    return css`
      color: ${theme.colors.dashboardTextMuted};
      background: ${theme.colors.dashboardSurface};
    `;
  }}
`;

export const KPILabel = styled.span`
  display: block;
  margin-top: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
  font-weight: 700;
`;

export const KPIValue = styled.strong`
  min-width: 0;
  display: block;
  margin-top: 0.3rem;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.15rem, 2.3vw, 1.65rem);
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const KPIDetail = styled.span`
  display: block;
  margin-top: 0.38rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
`;

export const AnalyticsGrid = styled.section`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(18rem, 0.85fr);
  gap: 0.85rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export const DetailGrid = styled.section`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
  gap: 0.85rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.article`
  min-width: 0;
  padding: 1.1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const PanelHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const PanelTitle = styled.div`
  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.98rem;
  }

  p {
    margin: 0.3rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.76rem;
  }
`;

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.68rem;
  font-weight: 700;
`;

export const LegendItem = styled.span<{ $variant: 'freight' | 'fuel' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  &::before {
    content: '';
    width: 0.65rem;
    aspect-ratio: 1;
    border-radius: 0.2rem;
    background: ${({ $variant, theme }) =>
      $variant === 'freight' ? theme.colors.brandGreen : theme.colors.navy};
  }
`;

export const MonthlyChartScroll = styled.div`
  min-width: 0;
  overflow-x: auto;
  padding: 0.25rem 0 0.35rem;
`;

export const MonthlyChart = styled.div`
  min-width: 43rem;
  height: 15.5rem;
  display: grid;
  grid-template-columns: repeat(12, minmax(2.6rem, 1fr));
  align-items: end;
  gap: 0.45rem;
  padding: 1rem 0.3rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: repeating-linear-gradient(
    to top,
    transparent 0,
    transparent calc(25% - 1px),
    ${({ theme }) => theme.colors.dashboardBorder} 25%
  );
`;

export const MonthColumn = styled.button<{ $isActive: boolean }>`
  min-width: 0;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.55rem;
  padding: 0.4rem 0.25rem 0.45rem;
  border: 0;
  border-radius: 0.75rem 0.75rem 0 0;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreenDark : theme.colors.dashboardTextMuted};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreenSoft : 'transparent'};
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }
`;

export const Bars = styled.span`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.2rem;
`;

export const Bar = styled.span<{ $height: number; $variant: 'freight' | 'fuel' }>`
  width: min(0.72rem, 42%);
  min-height: ${({ $height }) => ($height > 0 ? '0.28rem' : '0')};
  height: ${({ $height }) => `${Math.max($height, 0)}%`};
  border-radius: 0.35rem 0.35rem 0 0;
  background: ${({ $variant, theme }) =>
    $variant === 'freight'
      ? `linear-gradient(180deg, ${theme.colors.brandGreen}, ${theme.colors.brandGreenDark})`
      : `linear-gradient(180deg, ${theme.colors.navy}, ${theme.colors.navyDeep})`};
  box-shadow: ${({ $variant, theme }) => ($variant === 'freight' ? theme.shadow.green : 'none')};
  transition: height 260ms ease;
`;

export const ShipperList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

export const ShipperItem = styled.div`
  display: grid;
  gap: 0.42rem;
`;

export const ShipperHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.8rem;
  }

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
    font-weight: 700;
  }
`;

export const ProgressTrack = styled.div`
  height: 0.52rem;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const ProgressValue = styled.div<{ $width: number }>`
  width: ${({ $width }) => `${Math.min(Math.max($width, 0), 100)}%`};
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.brandGreenDark},
    ${({ theme }) => theme.colors.brandGreen}
  );
`;

export const EmptyState = styled.div`
  min-height: 10rem;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.8rem;
  text-align: center;
`;

export const VehicleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

export const VehicleRow = styled.div`
  display: grid;
  grid-template-columns: minmax(6rem, 0.75fr) minmax(0, 1.25fr) auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.95rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr auto;

    > div:nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }
`;

export const VehicleIdentity = styled.div`
  min-width: 0;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.84rem;
  }

  span {
    display: block;
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.68rem;
  }
`;

export const VehicleBarBlock = styled.div`
  min-width: 0;
`;

export const VehicleBarLabels = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  margin-bottom: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.65rem;
  font-weight: 700;
`;

export const VehicleResult = styled.strong<{ $isPositive: boolean }>`
  color: ${({ $isPositive, theme }) =>
    $isPositive ? theme.colors.brandGreenDark : theme.colors.danger};
  font-size: 0.8rem;
  white-space: nowrap;
`;

export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ActivityItem = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.72rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
`;

export const ActivityIcon = styled.span<{ $type: 'TRAVEL' | 'FUEL' }>`
  width: 2.35rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 0.78rem;
  color: ${({ $type, theme }) =>
    $type === 'TRAVEL' ? theme.colors.brandGreenDark : theme.colors.navy};
  background: ${({ $type, theme }) =>
    $type === 'TRAVEL' ? theme.colors.brandGreenSoft : '#edf3fa'};
`;

export const ActivityCopy = styled.div`
  min-width: 0;

  strong {
    display: block;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.76rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 0.2rem;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.66rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ActivityValue = styled.div`
  text-align: right;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.73rem;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 0.18rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.62rem;
  }
`;

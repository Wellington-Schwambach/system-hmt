import styled from 'styled-components';

interface DayProps {
  $isCurrentMonth: boolean;
  $isToday: boolean;
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

export const Day = styled.span<DayProps>`
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: ${({ $isCurrentMonth, $isToday, theme }) => {
    if ($isToday) return theme.colors.white;
    return $isCurrentMonth ? theme.colors.dashboardText : theme.colors.dashboardTextSoft;
  }};
  background: ${({ $isToday, theme }) => ($isToday ? theme.colors.brandGreen : 'transparent')};
  font-size: clamp(0.7rem, 1.2vw, 0.82rem);
  font-weight: ${({ $isToday }) => ($isToday ? 800 : 600)};
`;

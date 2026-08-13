import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CalendarCard } from './components/CalendarCard';
import { MetricCard } from './components/MetricCard';
import { NotesCard } from './components/NotesCard';
import { SectionHeading } from './components/SectionHeading';
import { SupportButton } from './components/SupportButton';
import { DASHBOARD_METRICS } from './constants';
import { MetricsGrid, WidgetsGrid } from './styles';
import type { CalendarDay } from './types';

const TOTAL_CALENDAR_CELLS = 42;
const MILLISECONDS_PER_DAY = 86_400_000;

function getCalendarDays(referenceDate: Date): CalendarDay[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const gridStartDate = new Date(year, month, 1 - startOffset);
  const today = new Date();

  return Array.from({ length: TOTAL_CALENDAR_CELLS }, (_, index) => {
    const currentDate = new Date(gridStartDate.getTime() + index * MILLISECONDS_PER_DAY);

    return {
      key: currentDate.toISOString(),
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday:
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate(),
    };
  });
}

export function Dashboard() {
  const navigate = useNavigate();
  const currentDate = useMemo(() => new Date(), []);
  const calendarDays = useMemo(() => getCalendarDays(currentDate), [currentDate]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(currentDate),
    [currentDate],
  );

  return (
    <>
      <MetricsGrid aria-label="Indicadores principais">
        {DASHBOARD_METRICS.map((metric) => (
          <MetricCard key={metric.id} metric={metric} onNavigate={navigate} />
        ))}
      </MetricsGrid>

      <SectionHeading
        title="Visão geral da operação"
        subtitle="Informações atualizadas do painel"
      />

      <WidgetsGrid>
        <CalendarCard monthLabel={monthLabel} days={calendarDays} />
        <NotesCard />
      </WidgetsGrid>

      <SupportButton />
    </>
  );
}

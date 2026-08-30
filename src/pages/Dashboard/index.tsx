import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fuel, PackageCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { CalendarCard } from './components/CalendarCard';
import { MetricCard } from './components/MetricCard';
import { NotesCard } from './components/NotesCard';
import { SectionHeading } from './components/SectionHeading';
import { SupportButton } from './components/SupportButton';
import { getDashboardData } from './services';
import { MetricsGrid, WidgetsGrid } from './styles';
import type { CalendarDay, DashboardData, DashboardMetric } from './types';

const TOTAL_CALENDAR_CELLS = 42;

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getCalendarDays(referenceDate: Date, counts: Record<string, number>): CalendarDay[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const today = new Date();

  return Array.from({ length: TOTAL_CALENDAR_CELLS }, (_, index) => {
    const currentDate = new Date(year, month, 1 - startOffset + index, 12);
    const date = localDateString(currentDate);

    return {
      key: date,
      date,
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday:
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate(),
      loadCount: counts[date] ?? 0,
    };
  });
}

export function Dashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentMonthKey = monthKey(currentDate);

  const refreshDashboard = useCallback(async () => {
    try {
      setError('');
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch {
      setError('Não foi possível atualizar os dados do Dashboard agora.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentMonthKey, refreshDashboard]);

  useEffect(() => {
    const syncClock = () => setCurrentDate(new Date());

    const onFocus = () => {
      syncClock();
      void refreshDashboard();
    };

    const timer = window.setInterval(syncClock, 60_000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refreshDashboard]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentDate, data?.loadCounts ?? {}),
    [currentDate, data?.loadCounts],
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(currentDate),
    [currentDate],
  );

  const metrics = useMemo<DashboardMetric[]>(() => [
    {
      id: 'loads',
      title: 'Cargas',
      value: loading && !data ? '—' : String(data?.metrics.loads ?? 0),
      caption: `${monthLabel} • abrir calendário de cargas`,
      icon: PackageCheck,
      path: '/logistic/calendar',
    },
    {
      id: 'travels',
      title: 'Viagens',
      value: loading && !data ? '—' : String(data?.metrics.travels ?? 0),
      caption: `${monthLabel} • abrir viagens`,
      icon: Truck,
      path: '/travel',
    },
    {
      id: 'fuel',
      title: 'Abastecidas',
      value: loading && !data ? '—' : String(data?.metrics.fuelings ?? 0),
      caption: `${monthLabel} • abrir combustíveis`,
      icon: Fuel,
      path: '/fuel',
    },
  ], [data, loading, monthLabel]);

  return (
    <>
      <MetricsGrid aria-label="Indicadores principais do mês atual">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} onNavigate={navigate} />
        ))}
      </MetricsGrid>

      <SectionHeading
        title="Visão geral da operação"
        subtitle={error || `Dados operacionais de ${monthLabel}`}
      />

      <WidgetsGrid>
        <CalendarCard monthLabel={monthLabel} days={calendarDays} loads={data?.loads ?? []} />
        <NotesCard />
      </WidgetsGrid>

      <SupportButton />
    </>
  );
}

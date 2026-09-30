import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fuel, PackageCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/Auth/useAuth';

import { CalendarCard } from './components/CalendarCard';
import { MetricCard } from './components/MetricCard';
import { NotesCard } from './components/NotesCard';
import { NoteScheduleModal } from './components/NoteScheduleModal';
import { SectionHeading } from './components/SectionHeading';
import { SupportButton } from './components/SupportButton';
import { getDashboardData } from './services';
import { MetricsGrid, WidgetsGrid } from './styles';
import type { CalendarDay, DashboardData, DashboardMetric, DashboardNote } from './types';

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

function getCalendarDays(
  referenceDate: Date,
  noteCounts: Record<string, number>,
): CalendarDay[] {
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
      noteCount: noteCounts[date] ?? 0,
    };
  });
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleNote, setScheduleNote] = useState<DashboardNote | null>(null);
  const calendarMonthKey = monthKey(calendarDate);

  const refreshDashboard = useCallback(async () => {
    try {
      setError('');
      const dashboardData = await getDashboardData(calendarMonthKey);
      setData(dashboardData);
    } catch {
      setError('Não foi possível atualizar os dados do Dashboard agora.');
    } finally {
      setLoading(false);
    }
  }, [calendarMonthKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshDashboard]);

  useEffect(() => {
    const refreshVisibleDashboard = () => {
      if (!document.hidden) {
        void refreshDashboard();
      }
    };

    const onFocus = () => refreshVisibleDashboard();
    const onVisibilityChange = () => {
      if (!document.hidden) refreshVisibleDashboard();
    };

    // Mantém notas e alertas criados por outros usuários sincronizados mesmo quando
    // o Dashboard permanece aberto durante o expediente.
    const timer = window.setInterval(refreshVisibleDashboard, 60_000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshDashboard]);

  const calendarDays = useMemo(
    () => getCalendarDays(calendarDate, data?.noteCounts ?? {}),
    [calendarDate, data?.noteCounts],
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(calendarDate),
    [calendarDate],
  );

  const metricsMonthLabel = useMemo(() => {
    if (!data?.period?.year || !data?.period?.month) {
      return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());
    }

    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
      .format(new Date(data.period.year, data.period.month - 1, 1, 12));
  }, [data]);

  const isCurrentCalendarMonth = useMemo(() => {
    const today = new Date();
    return calendarDate.getFullYear() === today.getFullYear()
      && calendarDate.getMonth() === today.getMonth();
  }, [calendarDate]);

  const changeCalendarMonth = useCallback((delta: number) => {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
  }, []);

  const metrics = useMemo<DashboardMetric[]>(() => [
    {
      id: 'loads',
      title: 'Cargas',
      value: loading && !data ? '—' : String(data?.metrics.loads ?? 0),
      caption: `${metricsMonthLabel} • abrir calendário de cargas`,
      icon: PackageCheck,
      path: '/logistic/calendar',
    },
    {
      id: 'travels',
      title: 'Viagens',
      value: loading && !data ? '—' : String(data?.metrics.travels ?? 0),
      caption: `${metricsMonthLabel} • abrir viagens`,
      icon: Truck,
      path: '/travel',
    },
    {
      id: 'fuel',
      title: 'Abastecidas',
      value: loading && !data ? '—' : String(data?.metrics.fuelings ?? 0),
      caption: `${metricsMonthLabel} • abrir combustíveis`,
      icon: Fuel,
      path: '/fuel',
    },
  ], [data, loading, metricsMonthLabel]);

  return (
    <>
      <MetricsGrid aria-label="Indicadores principais do mês atual">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} onNavigate={navigate} />
        ))}
      </MetricsGrid>

      <SectionHeading
        title="Visão geral da operação"
        subtitle={error || `Dados operacionais de ${metricsMonthLabel}`}
      />

      <WidgetsGrid>
        <CalendarCard
          monthLabel={monthLabel}
          days={calendarDays}
          notes={data?.calendarNotes ?? []}
          isCurrentMonth={isCurrentCalendarMonth}
          onPreviousMonth={() => changeCalendarMonth(-1)}
          onNextMonth={() => changeCalendarMonth(1)}
          onToday={() => setCalendarDate(new Date())}
          onEditNote={setScheduleNote}
        />
        <NotesCard
          notes={data?.dailyNotes ?? []}
          users={data?.noteUsers ?? []}
          currentUserId={user?.id ?? null}
          onRefresh={refreshDashboard}
          onEditNote={setScheduleNote}
        />
      </WidgetsGrid>

      {scheduleNote ? (
        <NoteScheduleModal
          key={`${scheduleNote.id}:${scheduleNote.dueAt ?? scheduleNote.dueDate ?? 'no-date'}`}
          note={scheduleNote}
          onClose={() => setScheduleNote(null)}
          onSaved={refreshDashboard}
        />
      ) : null}

      <SupportButton />
    </>
  );
}

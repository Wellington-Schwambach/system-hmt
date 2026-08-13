import { CalendarDays } from 'lucide-react';

import { WEEK_DAYS } from '../../constants';
import type { CalendarCardProps } from './types';
import { Card, CardHeader, CalendarGrid, Day, HeaderIcon, HeaderTitle, WeekDay } from './styles';

export function CalendarCard({ monthLabel, days }: CalendarCardProps) {
  return (
    <Card>
      <CardHeader>
        <HeaderIcon>
          <CalendarDays size={20} aria-hidden="true" />
        </HeaderIcon>
        <HeaderTitle>{monthLabel}</HeaderTitle>
      </CardHeader>

      <CalendarGrid aria-label={`Calendário de ${monthLabel}`}>
        {WEEK_DAYS.map((weekDay) => (
          <WeekDay key={weekDay}>{weekDay}</WeekDay>
        ))}

        {days.map((day) => (
          <Day
            key={day.key}
            $isCurrentMonth={day.isCurrentMonth}
            $isToday={day.isToday}
            aria-current={day.isToday ? 'date' : undefined}
          >
            {day.dayNumber}
          </Day>
        ))}
      </CalendarGrid>
    </Card>
  );
}

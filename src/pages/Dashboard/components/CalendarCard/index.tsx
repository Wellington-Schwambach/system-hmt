import { BellRing, CalendarDays, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { WEEK_DAYS } from '../../constants';
import type { CalendarCardProps } from './types';
import {
  Card,
  CardHeader,
  CalendarGrid,
  Day,
  DayNumber,
  HeaderIcon,
  HeaderTitle,
  LoadMeta,
  Modal,
  ModalBody,
  ModalClose,
  ModalHeader,
  ModalOverlay,
  ModalSubtitle,
  ModalTitle,
  NoteCard,
  NoteCardMeta,
  NoteCardText,
  NoteCardTitle,
  NoteCount,
  SectionLabel,
  WeekDay,
} from './styles';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day, 12));
}

export function CalendarCard({ monthLabel, days, notes }: CalendarCardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedNotes = useMemo(
    () => (selectedDate ? notes.filter((note) => note.dueDate === selectedDate) : []),
    [notes, selectedDate],
  );

  useEffect(() => {
    if (!selectedDate) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDate(null);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedDate]);

  return (
    <>
      <Card>
        <CardHeader>
          <HeaderIcon>
            <CalendarDays size={20} aria-hidden="true" />
          </HeaderIcon>
          <HeaderTitle>{monthLabel}</HeaderTitle>
        </CardHeader>

        <CalendarGrid aria-label={`Calendário de alertas de ${monthLabel}`}>
          {WEEK_DAYS.map((weekDay) => (
            <WeekDay key={weekDay}>{weekDay}</WeekDay>
          ))}

          {days.map((day) => (
            <Day
              key={day.key}
              type="button"
              $isCurrentMonth={day.isCurrentMonth}
              $isToday={day.isToday}
              $hasLoads={false}
              $hasNotes={day.noteCount > 0}
              aria-current={day.isToday ? 'date' : undefined}
              disabled={!day.isCurrentMonth}
              onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
              title={
                day.isCurrentMonth
                  ? `${day.noteCount} alerta(s) em ${formatDate(day.date)}`
                  : undefined
              }
            >
              <DayNumber>{day.dayNumber}</DayNumber>
              {day.isCurrentMonth && day.noteCount > 0 ? (
                <NoteCount title={`${day.noteCount} alerta(s)`}>
                  <BellRing size={9} aria-hidden="true" />
                  {day.noteCount}
                </NoteCount>
              ) : null}
            </Day>
          ))}
        </CalendarGrid>
      </Card>

      {selectedDate ? (
        <ModalOverlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedDate(null)}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="dashboard-day-title">
            <ModalHeader>
              <div>
                <ModalTitle id="dashboard-day-title">Alertas de {formatDate(selectedDate)}</ModalTitle>
                <ModalSubtitle>{selectedNotes.length} alerta(s) nesta data</ModalSubtitle>
              </div>
              <ModalClose type="button" onClick={() => setSelectedDate(null)} aria-label="Fechar alertas do dia">
                <X size={19} />
              </ModalClose>
            </ModalHeader>

            <ModalBody>
              {selectedNotes.length ? <SectionLabel>Notas e vencimentos</SectionLabel> : null}
              {selectedNotes.map((note) => (
                <NoteCard key={note.id} $completed={note.isCompleted}>
                  <NoteCardTitle>{note.title}</NoteCardTitle>
                  <NoteCardMeta>
                    {note.isCompleted
                      ? `Concluída${note.completedByName ? ` por ${note.completedByName}` : ''}`
                      : note.isManual
                        ? `Lembrete / alerta · ${note.source}`
                        : note.source}
                  </NoteCardMeta>
                  <NoteCardText>{note.observation}</NoteCardText>
                </NoteCard>
              ))}

              {selectedNotes.length === 0 ? (
                <LoadMeta>Nenhum alerta ou nota registrada para esta data.</LoadMeta>
              ) : null}
            </ModalBody>
          </Modal>
        </ModalOverlay>
      ) : null}
    </>
  );
}

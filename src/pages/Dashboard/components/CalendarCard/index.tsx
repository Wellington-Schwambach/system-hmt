import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, X } from 'lucide-react';

import { WEEK_DAYS } from '../../constants';
import type { DashboardLoad } from '../../types';
import type { CalendarCardProps } from './types';
import {
  Card,
  CardHeader,
  CalendarGrid,
  Day,
  DayCount,
  DayNumber,
  HeaderIcon,
  HeaderTitle,
  LoadCard,
  LoadCardBody,
  LoadCardHeader,
  LoadMeta,
  LoadMetaItem,
  Modal,
  ModalBody,
  ModalClose,
  ModalHeader,
  ModalOverlay,
  ModalSubtitle,
  ModalTitle,
  ShipperName,
  ShipownerName,
  StatusBadge,
  WeekDay,
} from './styles';

function dateKeyFromIso(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day, 12));
}

function compactDriverName(name: string | null): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(' ');
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function drivers(load: DashboardLoad): string {
  return [compactDriverName(load.driverName), compactDriverName(load.driverTwoName)].filter(Boolean).join(' / ') || '—';
}

function plates(load: DashboardLoad): string {
  return [load.tractorPlate, load.trailerPlate].filter(Boolean).join(' / ') || '—';
}

export function CalendarCard({ monthLabel, days, loads }: CalendarCardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedLoads = useMemo(
    () => (selectedDate ? loads.filter((load) => dateKeyFromIso(load.loadingAt) === selectedDate) : []),
    [loads, selectedDate],
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

        <CalendarGrid aria-label={`Calendário de ${monthLabel}`}>
          {WEEK_DAYS.map((weekDay) => (
            <WeekDay key={weekDay}>{weekDay}</WeekDay>
          ))}

          {days.map((day) => (
            <Day
              key={day.key}
              type="button"
              $isCurrentMonth={day.isCurrentMonth}
              $isToday={day.isToday}
              $hasLoads={day.loadCount > 0}
              aria-current={day.isToday ? 'date' : undefined}
              disabled={!day.isCurrentMonth}
              onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
              title={day.isCurrentMonth ? `${day.loadCount} carga(s) em ${formatDate(day.date)}` : undefined}
            >
              <DayNumber>{day.dayNumber}</DayNumber>
              {day.isCurrentMonth && day.loadCount > 0 ? <DayCount>{day.loadCount}</DayCount> : null}
            </Day>
          ))}
        </CalendarGrid>
      </Card>

      {selectedDate ? (
        <ModalOverlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedDate(null)}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="dashboard-loads-title">
            <ModalHeader>
              <div>
                <ModalTitle id="dashboard-loads-title">Cargas do dia {formatDate(selectedDate)}</ModalTitle>
                <ModalSubtitle>{selectedLoads.length} carga(s) registrada(s) no Calendário de Cargas</ModalSubtitle>
              </div>
              <ModalClose type="button" onClick={() => setSelectedDate(null)} aria-label="Fechar cargas do dia">
                <X size={19} />
              </ModalClose>
            </ModalHeader>

            <ModalBody>
              {selectedLoads.length === 0 ? (
                <LoadMeta>Nenhuma carga registrada para esta data.</LoadMeta>
              ) : selectedLoads.map((load) => (
                <LoadCard key={load.id} $accent={load.shipperColor}>
                  <LoadCardHeader $accent={load.shipperColor}>
                    <ShipperName>{load.shipperName}</ShipperName>
                    <ShipownerName>
                      {load.shipowner || 'Armador não informado'}
                      {load.completedAt ? <StatusBadge><CheckCircle2 size={12} /> Finalizado</StatusBadge> : null}
                    </ShipownerName>
                  </LoadCardHeader>

                  <LoadCardBody>
                    <LoadMetaItem><span>Data</span><strong>{formatDate(selectedDate)}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Remessa</span><strong>{load.shipmentNumber || '—'}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Load</span><strong>{load.loadNumber || '—'}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Origem</span><strong>{load.origin || '—'}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Destino</span><strong>{load.destination || '—'}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Armador</span><strong>{load.shipowner || '—'}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Booking de baixa</span><strong>{load.bookingNumber || '—'}</strong></LoadMetaItem>
                  </LoadCardBody>

                  <LoadMeta>
                    <LoadMetaItem><span>Cavalo / Carreta</span><strong>{plates(load)}</strong></LoadMetaItem>
                    <LoadMetaItem><span>Motorista(s)</span><strong>{drivers(load)}</strong></LoadMetaItem>
                  </LoadMeta>
                </LoadCard>
              ))}
            </ModalBody>
          </Modal>
        </ModalOverlay>
      ) : null}
    </>
  );
}

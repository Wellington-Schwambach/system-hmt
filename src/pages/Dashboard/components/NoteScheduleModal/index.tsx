import { CalendarClock, Save, X } from 'lucide-react';
import { useState } from 'react';

import { useNotifications } from '../../../../contexts/Notifications';
import { getApiErrorFeedback } from '../../../../utils/apiError';
import { updateDashboardNoteSchedule } from '../../services';
import type { DashboardNote } from '../../types';
import {
  Actions,
  CloseButton,
  Field,
  Form,
  Header,
  Icon,
  Input,
  Modal,
  Overlay,
  PrimaryButton,
  SecondaryButton,
  Subtitle,
  Title,
  TitleWrap,
} from './styles';

interface NoteScheduleModalProps {
  note: DashboardNote;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function initialSchedule(note: DashboardNote): { date: string; time: string } {
  const timeMatch = note.dueAt?.match(/T(\d{2}:\d{2})/);
  return {
    date: note.dueDate ?? '',
    time: timeMatch?.[1] ?? '08:00',
  };
}

export function NoteScheduleModal({ note, onClose, onSaved }: NoteScheduleModalProps) {
  const notifications = useNotifications();
  const [schedule, setSchedule] = useState(() => initialSchedule(note));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !note.manualNoteId) return;

    const scheduledAt = schedule.date
      ? `${schedule.date}T${schedule.time || '08:00'}:00`
      : null;

    setSaving(true);
    try {
      await updateDashboardNoteSchedule(note.manualNoteId, scheduledAt);
      notifications.success(
        'Data da nota atualizada',
        schedule.date
          ? 'O lembrete será exibido a partir da nova data programada.'
          : 'A nota ficou sem data fixa e passa a aparecer como pendência contínua.',
      );
      onClose();
      await onSaved();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível alterar a data da nota.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Overlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="edit-note-schedule-title">
        <Header>
          <TitleWrap>
            <Icon><CalendarClock size={18} aria-hidden="true" /></Icon>
            <div>
              <Title id="edit-note-schedule-title">Editar data da nota</Title>
              <Subtitle>{note.title}</Subtitle>
            </div>
          </TitleWrap>
          <CloseButton type="button" onClick={onClose} disabled={saving} aria-label="Fechar edição">
            <X size={18} />
          </CloseButton>
        </Header>

        <Form onSubmit={(event) => void handleSubmit(event)}>
          <Field>
            Data de exibição
            <Input
              type="date"
              value={schedule.date}
              onChange={(event) => setSchedule((current) => ({ ...current, date: event.target.value }))}
            />
          </Field>

          <Field>
            Horário
            <Input
              type="time"
              value={schedule.time}
              disabled={!schedule.date}
              onChange={(event) => setSchedule((current) => ({ ...current, time: event.target.value }))}
            />
          </Field>

          <Actions>
            <SecondaryButton type="button" onClick={onClose} disabled={saving}>Cancelar</SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              <Save size={15} aria-hidden="true" /> {saving ? 'Salvando...' : 'Salvar nova data'}
            </PrimaryButton>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}

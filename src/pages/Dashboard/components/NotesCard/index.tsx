import {
  CalendarDays,
  Check,
  CakeSlice,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useNotifications } from '../../../../contexts/Notifications';
import { getApiErrorFeedback } from '../../../../utils/apiError';
import {
  createDashboardNote,
  deleteDashboardNote,
  setDashboardNoteCompletion,
  type CreateDashboardNotePayload,
} from '../../services';
import type { DashboardNote, DashboardNoteIcon, DashboardNoteUser } from '../../types';
import {
  ActionButton,
  AddButton,
  Card,
  CardHeader,
  CloseButton,
  CompletionButton,
  DetailCard,
  DetailRow,
  EmptyState,
  Field,
  FormGrid,
  FullField,
  HeaderIcon,
  HeaderTitle,
  HeaderTitleWrap,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalSubtitle,
  ModalTitle,
  ModalTitleWrap,
  NoteButton,
  NoteCopy,
  NoteIcon,
  NoteItem,
  NoteMeta,
  NoteText,
  NoteTime,
  NotesList,
  Recipient,
  Recipients,
  Textarea,
} from './styles';

interface NotesCardProps {
  notes: DashboardNote[];
  users: DashboardNoteUser[];
  currentUserId: number | null;
  onRefresh: () => Promise<void>;
}

interface NoteFormState {
  title: string;
  observation: string;
  date: string;
  time: string;
  recipientIds: number[];
}

const ICONS: Record<DashboardNoteIcon, typeof Clock3> = {
  truck: Truck,
  clipboard: ClipboardList,
  cake: CakeSlice,
  clock: Clock3,
  calendar: CalendarDays,
  note: FileText,
};

const ALERT_LABELS: Record<string, string> = {
  vehicle_expiry: 'Vencimento de veículo',
  employee_expiry: 'Vencimento de colaborador',
  birthday: 'Aniversário',
  probation: 'Experiência',
  vacation: 'Férias',
  manual: 'Lembrete manual',
  custom: 'Alerta personalizado',
};

function emptyForm(currentUserId: number | null): NoteFormState {
  return {
    title: '',
    observation: '',
    date: '',
    time: '',
    recipientIds: currentUserId ? [currentUserId] : [],
  };
}

function formatDate(value: string | null): string {
  if (!value) return 'Sem data fixa';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day, 12));
}

function formatNoteTime(note: DashboardNote): string {
  if (!note.dueDate) return 'Lembrete contínuo';

  const date = formatDate(note.dueDate);
  if (!note.dueAt || note.dueAt.length <= 10 || note.dueAt.endsWith('T00:00:00')) {
    return date;
  }

  const parsed = new Date(note.dueAt);
  if (Number.isNaN(parsed.getTime())) return date;

  return `${date} - ${new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)}`;
}

function noteRelativeMeta(note: DashboardNote): string {
  if (!note.dueDate) {
    return note.isManual
      ? (note.source ? `Cadastrado por ${note.source}` : 'Lembrete manual')
      : (ALERT_LABELS[note.alertType] ?? 'Alerta automático');
  }

  const [year, month, day] = note.dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day, 12);
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const days = Math.round((due.getTime() - current.getTime()) / 86_400_000);
  const label = ALERT_LABELS[note.alertType] ?? (note.isManual ? 'Lembrete' : 'Alerta');

  if (days === 0) return `${label} · vence hoje`;
  if (days === 1) return `${label} · vence amanhã`;
  if (days > 1) return `${label} · em ${days} dias`;
  if (days === -1) return `${label} · vencido há 1 dia`;
  return `${label} · vencido há ${Math.abs(days)} dias`;
}

function completedMeta(note: DashboardNote): string | null {
  if (!note.isCompleted) return null;

  const author = note.completedByName ? ` por ${note.completedByName}` : '';
  if (!note.completedAt) return `Concluída${author}`;

  const completedAt = new Date(note.completedAt);
  if (Number.isNaN(completedAt.getTime())) return `Concluída${author}`;

  return `Concluída${author} em ${new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(completedAt)}`;
}

export function NotesCard({ notes, users, currentUserId, onRefresh }: NotesCardProps) {
  const notifications = useNotifications();
  const [selectedNote, setSelectedNote] = useState<DashboardNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<NoteFormState>(() => emptyForm(currentUserId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completingNoteId, setCompletingNoteId] = useState<string | null>(null);

  const hasModal = Boolean(selectedNote || isCreating);

  useEffect(() => {
    if (!hasModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isSaving || isDeleting) return;
      setSelectedNote(null);
      setIsCreating(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [hasModal, isDeleting, isSaving]);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.dueAt ?? a.dueDate ?? '').localeCompare(b.dueAt ?? b.dueDate ?? '')),
    [notes],
  );

  function toggleRecipient(userId: number) {
    setForm((current) => ({
      ...current,
      recipientIds: current.recipientIds.includes(userId)
        ? current.recipientIds.filter((id) => id !== userId)
        : [...current.recipientIds, userId],
    }));
  }

  async function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    if (!form.title.trim() || !form.observation.trim()) {
      notifications.warning('Revise a nota', 'Informe um título e a observação.');
      return;
    }

    if (form.recipientIds.length === 0) {
      notifications.warning('Revise os destinatários', 'Selecione pelo menos um usuário para receber a nota.');
      return;
    }

    const scheduledAt = form.date
      ? `${form.date}T${form.time || '08:00'}:00`
      : null;

    const payload: CreateDashboardNotePayload = {
      title: form.title.trim(),
      observation: form.observation.trim(),
      scheduled_at: scheduledAt,
      recipient_ids: form.recipientIds,
    };

    setIsSaving(true);
    try {
      await createDashboardNote(payload);
      notifications.success('Nota cadastrada', 'O lembrete já está disponível para os usuários selecionados.');
      setIsCreating(false);
      await onRefresh();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível cadastrar a nota.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleCompletion(note: DashboardNote) {
    if (!note.canComplete || completingNoteId !== null) return;

    const nextCompleted = !note.isCompleted;
    setCompletingNoteId(note.id);
    try {
      await setDashboardNoteCompletion(note.id, nextCompleted);
      notifications.success(
        nextCompleted ? 'Nota concluída' : 'Conclusão removida',
        nextCompleted
          ? 'A nota foi marcada como concluída e ficará destacada em verde.'
          : 'A nota voltou para o estado pendente.',
      );
      setSelectedNote((current) =>
        current?.id === note.id
          ? {
              ...current,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : null,
              completedByName: nextCompleted ? 'Você' : null,
            }
          : current,
      );
      await onRefresh();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível atualizar a conclusão da nota.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setCompletingNoteId(null);
    }
  }

  async function removeSelectedNote() {
    if (!selectedNote?.manualNoteId || !selectedNote.canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteDashboardNote(selectedNote.manualNoteId);
      notifications.success('Nota removida', 'O lembrete manual foi excluído.');
      setSelectedNote(null);
      await onRefresh();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível remover a nota.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <HeaderTitleWrap>
            <HeaderIcon>
              <Clock3 size={21} aria-hidden="true" />
            </HeaderIcon>
            <HeaderTitle>Notas do dia</HeaderTitle>
          </HeaderTitleWrap>

          <AddButton
            type="button"
            onClick={() => {
              setForm(emptyForm(currentUserId));
              setIsCreating(true);
            }}
            aria-label="Adicionar nota do dia"
            title="Adicionar lembrete"
          >
            <Plus size={20} aria-hidden="true" />
          </AddButton>
        </CardHeader>

        {sortedNotes.length ? (
          <NotesList>
            {sortedNotes.map((note) => {
              const Icon = ICONS[note.icon] ?? FileText;
              return (
                <NoteItem key={note.id} $completed={note.isCompleted}>
                  <NoteButton type="button" onClick={() => setSelectedNote(note)}>
                    <NoteIcon>
                      <Icon size={19} aria-hidden="true" />
                    </NoteIcon>
                    <NoteCopy>
                      <NoteText>{note.title}</NoteText>
                      <NoteMeta>
                        {note.isCompleted ? completedMeta(note) : noteRelativeMeta(note)}
                      </NoteMeta>
                    </NoteCopy>
                    <NoteTime>{formatNoteTime(note)}</NoteTime>
                  </NoteButton>
                  <CompletionButton
                    type="button"
                    $completed={note.isCompleted}
                    onClick={() => void toggleCompletion(note)}
                    disabled={!note.canComplete || completingNoteId !== null}
                    aria-pressed={note.isCompleted}
                    aria-label={note.isCompleted ? 'Marcar nota como pendente' : 'Marcar nota como concluída'}
                    title={note.isCompleted ? 'Reabrir nota' : 'Marcar como concluída'}
                  >
                    <Check size={20} strokeWidth={3} aria-hidden="true" />
                  </CompletionButton>
                </NoteItem>
              );
            })}
          </NotesList>
        ) : (
          <EmptyState>Nenhum alerta ou lembrete para hoje.</EmptyState>
        )}
      </Card>

      {selectedNote ? (
        <ModalOverlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedNote(null)}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="daily-note-detail-title">
            <ModalHeader>
              <ModalTitleWrap>
                <ModalTitle id="daily-note-detail-title">{selectedNote.title}</ModalTitle>
                <ModalSubtitle>{ALERT_LABELS[selectedNote.alertType] ?? 'Nota do dia'}</ModalSubtitle>
              </ModalTitleWrap>
              <CloseButton type="button" onClick={() => setSelectedNote(null)} aria-label="Fechar nota">
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailCard>
                <DetailRow>
                  <span>Data</span>
                  <strong>{formatNoteTime(selectedNote)}</strong>
                </DetailRow>
                <DetailRow>
                  <span>Referência</span>
                  <strong>{selectedNote.source || '—'}</strong>
                </DetailRow>
                <DetailRow>
                  <span>Status</span>
                  <strong>{selectedNote.isCompleted ? completedMeta(selectedNote) : 'Pendente'}</strong>
                </DetailRow>
                <DetailRow>
                  <span>Observação</span>
                  <p>{selectedNote.observation}</p>
                </DetailRow>
              </DetailCard>
            </ModalBody>

            <ModalFooter>
              {selectedNote.isManual && selectedNote.canDelete ? (
                <ActionButton type="button" $danger onClick={() => void removeSelectedNote()} disabled={isDeleting}>
                  <Trash2 size={16} /> {isDeleting ? 'Excluindo...' : 'Excluir nota'}
                </ActionButton>
              ) : null}
              <ActionButton type="button" onClick={() => setSelectedNote(null)}>Fechar</ActionButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      ) : null}

      {isCreating ? (
        <ModalOverlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !isSaving && setIsCreating(false)}>
          <Modal as="form" onSubmit={(event) => void saveNote(event)}>
            <ModalHeader>
              <ModalTitleWrap>
                <ModalTitle>Novo lembrete</ModalTitle>
              </ModalTitleWrap>
              <CloseButton type="button" onClick={() => setIsCreating(false)} disabled={isSaving} aria-label="Fechar formulário">
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGrid>
                <FullField>
                  Título
                  <Input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ex.: Conferir documentação da frota"
                    maxLength={160}
                    autoFocus
                  />
                </FullField>

                <FullField>
                  Observação
                  <Textarea
                    value={form.observation}
                    onChange={(event) => setForm((current) => ({ ...current, observation: event.target.value }))}
                    placeholder="Descreva o que precisa ser lembrado..."
                    maxLength={4000}
                  />
                </FullField>

                <Field>
                  Data, se necessário
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  />
                </Field>

                <Field>
                  Horário
                  <Input
                    type="time"
                    value={form.time}
                    disabled={!form.date}
                    onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                  />
                </Field>

                <FullField>
                  Quem recebe
                  <Recipients>
                    {users.map((user) => (
                      <Recipient key={user.id}>
                        <input
                          type="checkbox"
                          checked={form.recipientIds.includes(user.id)}
                          onChange={() => toggleRecipient(user.id)}
                        />
                        <span>{user.name}</span>
                      </Recipient>
                    ))}
                  </Recipients>
                </FullField>
              </FormGrid>
            </ModalBody>

            <ModalFooter>
              <ActionButton type="button" onClick={() => setIsCreating(false)} disabled={isSaving}>Cancelar</ActionButton>
              <ActionButton type="submit" $primary disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar lembrete'}
              </ActionButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      ) : null}
    </>
  );
}

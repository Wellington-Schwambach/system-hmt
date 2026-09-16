import { api } from '../../services/api';
import type {
  DashboardData,
  DashboardNote,
  DashboardNoteIcon,
  DashboardNoteUser,
} from './types';

interface ApiDashboardNote {
  id: string;
  manual_note_id?: number | null;
  alert_type: string;
  icon: DashboardNoteIcon;
  title: string;
  observation: string;
  due_date: string | null;
  due_at: string | null;
  source: string;
  is_manual: boolean;
  can_delete?: boolean;
  is_completed?: boolean;
  completed_at?: string | null;
  completed_by_name?: string | null;
  can_complete?: boolean;
}

interface ApiDashboardNoteUser {
  id: number;
  name: string;
}

interface ApiDashboardResponse {
  period: DashboardData['period'];
  metrics: {
    loads: number;
    travels: number;
    fuelings: number;
  };
  daily_notes: ApiDashboardNote[];
  calendar_notes: ApiDashboardNote[];
  note_counts: Record<string, number>;
  note_users: ApiDashboardNoteUser[];
}

export interface CreateDashboardNotePayload {
  title: string;
  observation: string;
  scheduled_at: string | null;
  recipient_ids: number[];
}

function mapNote(note: ApiDashboardNote): DashboardNote {
  return {
    id: String(note.id),
    manualNoteId: note.manual_note_id ? Number(note.manual_note_id) : null,
    alertType: note.alert_type,
    icon: note.icon,
    title: note.title,
    observation: note.observation,
    dueDate: note.due_date,
    dueAt: note.due_at,
    source: note.source,
    isManual: Boolean(note.is_manual),
    canDelete: Boolean(note.can_delete),
    isCompleted: Boolean(note.is_completed),
    completedAt: note.completed_at ?? null,
    completedByName: note.completed_by_name ?? null,
    canComplete: note.can_complete !== false,
  };
}

function mapNoteUser(user: ApiDashboardNoteUser): DashboardNoteUser {
  return {
    id: Number(user.id),
    name: user.name,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<ApiDashboardResponse>('/api/dashboard', {
    params: { _refresh: Date.now() },
  });
  return {
    period: {
      year: Number(response.data.period.year),
      month: Number(response.data.period.month),
      key: response.data.period.key,
      start: response.data.period.start,
      end: response.data.period.end,
    },
    metrics: {
      loads: Number(response.data.metrics.loads ?? 0),
      travels: Number(response.data.metrics.travels ?? 0),
      fuelings: Number(response.data.metrics.fuelings ?? 0),
    },
    dailyNotes: (response.data.daily_notes ?? []).map(mapNote),
    calendarNotes: (response.data.calendar_notes ?? []).map(mapNote),
    noteCounts: response.data.note_counts ?? {},
    noteUsers: (response.data.note_users ?? []).map(mapNoteUser),
  };
}

export async function createDashboardNote(payload: CreateDashboardNotePayload): Promise<void> {
  await api.post('/api/dashboard/notes', payload);
}

export async function deleteDashboardNote(noteId: number): Promise<void> {
  await api.delete(`/api/dashboard/notes/${noteId}`);
}
export async function setDashboardNoteCompletion(noteKey: string, completed: boolean): Promise<void> {
  await api.put('/api/dashboard/note-completion', {
    note_key: noteKey,
    completed,
  });
}

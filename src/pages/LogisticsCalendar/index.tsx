import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  History,
  MessageSquareText,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { SearchableSelect } from '../../components/SearchableSelect';
import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { LogisticsLoadForm } from '../Logistic/components/LogisticsLoadForm';
import { LOGISTICS_SYNC_STORAGE_KEY, logisticsService } from '../Logistic/services';
import type {
  LogisticsAppointment,
  LogisticsFormData,
  LogisticsLoad,
  LogisticsOptions,
  LogisticsStage,
} from '../Logistic/types';
import { validateLogisticsForm } from '../Logistic/validation';
import {
  AccentPreview,
  AppointmentAddButton,
  AppointmentBackdrop,
  AppointmentBody,
  AppointmentEmpty,
  AppointmentFooter,
  AppointmentHeader,
  AppointmentModal,
  AppointmentRemoveButton,
  AppointmentRow,
  CalendarDayButton,
  CalendarDayFlow,
  CalendarDayFlowColumn,
  CalendarDayFlowTitle,
  CalendarDropdown,
  CalendarShipperCount,
  DangerButton,
  DetailBackdrop,
  DetailBody,
  DetailDrawer,
  DetailGrid,
  DetailHeader,
  DetailItem,
  DetailRoute,
  DetailSection,
  DetailSectionTitle,
  DetailStatus,
  DayHistoryItem,
  DayHistoryList,
  DayTabButton,
  DayTabs,
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  EmptyState,
  FilterBox,
  FinalizeButton,
  FixedHorizontalScrollbar,
  FixedHorizontalScrollbarTrack,
  Header,
  IconButton,
  ListActionButton,
  ListActions,
  ListCell,
  ListGroupEmpty,
  ListGroupHeader,
  ListHeaderRow,
  ListRow,
  ListTable,
  ListViewport,
  LoadingState,
  LoadsSection,
  MonthTitle,
  Page,
  PrimaryButton,
  SecondaryButton,
  ScheduleStatusButton,
  ListShipperBadge,
  StatusHistory,
  StatusHistoryItem,
  StatusTextarea,
  StatusTravelButton,
  StatusVisibilityButton,
  StatusVisibilityRow,
  SelectedDateBar,
  Toolbar,
  WeekCalendarHeader,
  WeekControls,
  CalendarEmptyDay,
  CalendarWeekNumber,
  CalendarWeekNumberHeader,
  MonthWeekdayGrid,
  MonthWeekRow,
  WeekDatesScroller,
  WeekRangeText,
} from './styles';

const EMPTY_OPTIONS: LogisticsOptions = {
  shippers: [],
  drivers: [],
  tractors: [],
  trailers: [],
  activeSets: [],
  cargoTypes: [],
  containerTypes: [],
  shipowners: [],
  locationTypes: [],
  cities: [],
};

const STAGE_LABELS: Record<LogisticsStage, string> = {
  PROGRAMMING: 'Programação',
  COLLECTION: 'Coleta',
  LOADING: 'Carregamento',
  DELIVERY: 'Baixa / Entrega',
};


const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
type DrawerMode = 'create' | 'edit' | 'duplicate' | null;
type AppointmentKind = 'COLLECTION' | 'DELIVERY';
type DayTab = 'LOADS' | 'HISTORY';

interface AppointmentEditorState {
  kind: AppointmentKind;
  load: LogisticsLoad;
}

interface StatusEditorState {
  load: LogisticsLoad;
}

function localDateString(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function dateKeyFromIso(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return localDateString(date);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const raw = value.slice(0, 10);
  const [year, month, day] = raw.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function eventActionLabel(action: LogisticsLoad['events'][number]['action']): string {
  return {
    CREATED: 'Carga criada',
    UPDATED: 'Carga alterada',
    STAGE_CHANGED: 'Etapa alterada',
    FINALIZED: 'Carga finalizada',
    DELETED: 'Carga excluída',
  }[action] ?? action;
}

function eventMessage(event: LogisticsLoad['events'][number]): string {
  const message = event.details?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  const changedFields = event.details?.changed_fields;
  if (Array.isArray(changedFields) && changedFields.length > 0) {
    return `Campos alterados: ${changedFields.join(', ')}`;
  }
  return eventActionLabel(event.action);
}

interface MonthWeek {
  week: number;
  year: number;
  days: Array<Date | null>;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function monthBounds(anchor: Date): { start: string; end: string } {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12, 0, 0, 0);
  return { start: localDateString(first), end: localDateString(last) };
}

function isoWeekInfo(date: Date): { week: number; year: number } {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const year = target.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil((((target.getTime() - firstDay.getTime()) / 86_400_000) + 1) / 7);
  return { week, year };
}

function buildMonthWeeks(anchor: Date): MonthWeek[] {
  const month = anchor.getMonth();
  const first = new Date(anchor.getFullYear(), month, 1, 12, 0, 0, 0);
  const last = new Date(anchor.getFullYear(), month + 1, 0, 12, 0, 0, 0);
  const cursor = startOfWeek(first);
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const weeks: MonthWeek[] = [];
  while (cursor <= end) {
    const rowStart = new Date(cursor);
    const monday = new Date(rowStart);
    monday.setDate(rowStart.getDate() + 1);
    const info = isoWeekInfo(monday);
    const days: Array<Date | null> = [];

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(cursor);
      days.push(date.getMonth() === month ? date : null);
      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push({ week: info.week, year: info.year, days });
  }

  return weeks;
}

function shortDriverName(value: string | null): string {
  if (!value) return '—';
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || '—';
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function driverSummary(load: LogisticsLoad): string {
  return [load.driverName, load.driverTwoName]
    .filter((name): name is string => Boolean(name))
    .map(shortDriverName)
    .join(' / ') || '—';
}

function plateSummary(load: LogisticsLoad): string {
  return [load.tractorPlate, load.trailerPlate].filter(Boolean).join(' / ') || '—';
}

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toDateInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return localDateString(date);
}

function emptyForm(): LogisticsFormData {
  return {
    referenceCode: '',
    shipmentNumber: '',
    loadNumber: '',
    shipowner: '',
    bookingNumber: '',
    collectionBookingNumber: '',
    gradeNumber: '',
    gradeAt: '',
    cargoTypeId: '',
    containerTypeId: '',
    shipownerId: '',
    shipperId: '',
    driverId: '',
    driverTwoId: '',
    plateMode: 'FLEET',
    tractorId: '',
    trailerId: '',
    thirdPartyTractorPlate: '',
    thirdPartyTrailerPlate: '',
    collectionCityId: '',
    collectionTerminal: '',
    collectionLocationTypeId: '',
    collectionScheduledAt: '',
    collectionAt: '',
    collectionAppointments: [],
    loadingCityId: '',
    loadingLocation: '',
    loadingAt: '',
    deliveryCityId: '',
    deliveryLocation: '',
    deliveryLocationTypeId: '',
    deliveryAt: '',
    deliveryAppointments: [],
    plan: '',
    loadMode: '',
    loadStatus: '',
    cargoNumber: '',
    loadEntries: [],
    containerNumber: '',
    containerTareKg: '',
    containerPayloadKg: '',
    shipownerSeal: '',
    vessel: '',
    deadline: '',
    country: '',
    temperature: '',
    sifSeal: '',
    stage: 'PROGRAMMING',
    notes: '',
    destinationNotes: '',
  };
}

function formFromLoad(load: LogisticsLoad): LogisticsFormData {
  return {
    referenceCode: load.referenceCode,
    shipmentNumber: load.shipmentNumber ?? '',
    loadNumber: load.loadNumber ?? '',
    shipowner: load.shipowner ?? '',
    bookingNumber: load.bookingNumber ?? '',
    collectionBookingNumber: load.collectionBookingNumber ?? '',
    gradeNumber: load.gradeNumber ?? '',
    gradeAt: toLocalInput(load.gradeAt),
    cargoTypeId: load.cargoTypeId ? String(load.cargoTypeId) : '',
    containerTypeId: load.containerTypeId ? String(load.containerTypeId) : '',
    shipownerId: load.shipownerId ? String(load.shipownerId) : '',
    shipperId: String(load.shipperId),
    driverId: load.driverId ? String(load.driverId) : '',
    driverTwoId: load.driverTwoId ? String(load.driverTwoId) : '',
    plateMode: load.plateMode,
    tractorId: load.tractorId ? String(load.tractorId) : '',
    trailerId: load.trailerId ? String(load.trailerId) : '',
    thirdPartyTractorPlate: load.thirdPartyTractorPlate ?? '',
    thirdPartyTrailerPlate: load.thirdPartyTrailerPlate ?? '',
    collectionCityId: load.collectionCityId ? String(load.collectionCityId) : '',
    collectionTerminal: load.collectionTerminal ?? '',
    collectionLocationTypeId: load.collectionLocationTypeId ? String(load.collectionLocationTypeId) : '',
    collectionScheduledAt: toDateInput(load.collectionScheduledAt),
    collectionAt: toLocalInput(load.collectionAt),
    collectionAppointments: load.collectionAppointments.map((entry) => ({ ...entry, scheduledAt: toLocalInput(entry.scheduledAt) })),
    loadingCityId: load.loadingCityId ? String(load.loadingCityId) : '',
    loadingLocation: load.loadingLocation ?? '',
    loadingAt: toLocalInput(load.loadingAt),
    deliveryCityId: load.deliveryCityId ? String(load.deliveryCityId) : '',
    deliveryLocation: load.deliveryLocation ?? '',
    deliveryLocationTypeId: load.deliveryLocationTypeId ? String(load.deliveryLocationTypeId) : '',
    deliveryAt: toLocalInput(load.deliveryAt),
    deliveryAppointments: load.deliveryAppointments.map((entry) => ({ ...entry, scheduledAt: toLocalInput(entry.scheduledAt) })),
    plan: load.plan ?? '',
    loadMode: load.loadMode ?? '',
    loadStatus: load.loadStatus ?? '',
    cargoNumber: load.cargoNumber ?? '',
    loadEntries: load.loadEntries.map((entry) => ({ ...entry })),
    containerNumber: load.containerNumber ?? '',
    containerTareKg: load.containerTareKg !== null ? String(load.containerTareKg) : '',
    containerPayloadKg: load.containerPayloadKg !== null ? String(load.containerPayloadKg) : '',
    shipownerSeal: load.shipownerSeal ?? '',
    vessel: load.vessel ?? '',
    deadline: load.deadline ?? '',
    country: load.country ?? '',
    temperature: load.temperature ?? '',
    sifSeal: load.sifSeal ?? '',
    stage: load.stage,
    notes: load.notes ?? '',
    destinationNotes: load.destinationNotes ?? '',
  };
}

interface CalendarShipperSummary {
  name: string;
  color: string;
  count: number;
}

interface CalendarDaySummary {
  scheduled: CalendarShipperSummary[];
  loading: CalendarShipperSummary[];
}

function pushShipperSummary(
  target: Record<string, { name: string; color: string; count: number }>,
  load: LogisticsLoad,
): void {
  const key = String(load.shipperId || load.shipperName || 'SEM_EMBARCADOR');
  if (!target[key]) {
    target[key] = {
      name: load.shipperName || 'Sem embarcador',
      color: load.shipperColor || '#7d8b82',
      count: 0,
    };
  }
  target[key].count += 1;
}

function collectionScheduleDates(load: LogisticsLoad): string[] {
  const scheduledDate = dateKeyFromIso(load.collectionScheduledAt);
  return scheduledDate ? [scheduledDate] : [];
}

function deliveryScheduleDates(load: LogisticsLoad): string[] {
  return [...new Set(
    load.deliveryAppointments
      .map((entry) => dateKeyFromIso(entry.scheduledAt))
      .filter((value): value is string => Boolean(value)),
  )];
}

function loadMatchesCalendarDate(load: LogisticsLoad, date: string): boolean {
  return collectionScheduleDates(load).includes(date)
    || dateKeyFromIso(load.collectionAt) === date
    || dateKeyFromIso(load.loadingAt) === date
    || dateKeyFromIso(load.deliveryAt) === date
    || deliveryScheduleDates(load).includes(date);
}


function loadSortTime(load: LogisticsLoad): number {
  const candidates = [load.loadingAt, load.collectionAt, load.collectionScheduledAt, load.deliveryAt, ...load.deliveryAppointments.map((entry) => entry.scheduledAt)]
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));
  return candidates.length > 0 ? Math.min(...candidates) : Number.POSITIVE_INFINITY;
}

function loadIdentifier(load: LogisticsLoad): string {
  if (load.loadMode === 'CARGO') return load.cargoNumber || '—';
  if (load.loadMode === 'LOAD') {
    return load.loadEntries
      .map((entry) => `${entry.status === 'EMPTY' ? 'Vazio' : 'Cheio'}: ${entry.number || '—'}`)
      .join(' / ') || '—';
  }
  return load.cargoNumber || load.loadNumber || '—';
}

function formatWeight(value: number | null): string {
  if (value === null) return '—';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)} kg`;
}

export function LogisticsCalendar() {
  const notifications = useNotifications();
  const { user } = useAuth();
  const isAdministrator = user?.role?.trim().toLowerCase() === 'administrador';
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayTab, setDayTab] = useState<DayTab>('LOADS');
  const collectionAlertDateRef = useRef<string | null>(null);
  const [shipperFilter, setShipperFilter] = useState('');
  const [options, setOptions] = useState<LogisticsOptions>(EMPTY_OPTIONS);
  const [loads, setLoads] = useState<LogisticsLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedLoad, setSelectedLoad] = useState<LogisticsLoad | null>(null);
  const [detailLoad, setDetailLoad] = useState<LogisticsLoad | null>(null);
  const [form, setForm] = useState<LogisticsFormData>(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [finishingId, setFinishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [appointmentEditor, setAppointmentEditor] = useState<AppointmentEditorState | null>(null);
  const [appointmentEntries, setAppointmentEntries] = useState<LogisticsAppointment[]>([]);
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [statusEditor, setStatusEditor] = useState<StatusEditorState | null>(null);
  const [statusObservation, setStatusObservation] = useState('');
  const [statusVisible, setStatusVisible] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusVisibilitySavingId, setStatusVisibilitySavingId] = useState<number | null>(null);
  const listViewportRef = useRef<HTMLDivElement | null>(null);
  const listTableRef = useRef<HTMLDivElement | null>(null);
  const [fixedScrollbar, setFixedScrollbar] = useState({
    visible: false,
    left: 0,
    width: 0,
    maxScroll: 0,
    scrollLeft: 0,
  });

  const monthWeeks = useMemo(() => buildMonthWeeks(monthAnchor), [monthAnchor]);
  const monthRange = useMemo(() => monthBounds(monthAnchor), [monthAnchor]);
  const currentWeekInfo = useMemo(() => isoWeekInfo(today), [today]);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logisticsService.calendarRange(monthRange.start, monthRange.end, shipperFilter);
      setLoads(data);
      setSelectedLoad((current) => current ? data.find((item) => item.id === current.id) ?? current : null);
      setDetailLoad((current) => current ? data.find((item) => item.id === current.id) ?? current : null);
      setStatusEditor((current) => current ? { load: data.find((item) => item.id === current.load.id) ?? current.load } : null);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível carregar as cargas do mês.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setLoading(false);
    }
  }, [monthRange.end, monthRange.start, notifications, shipperFilter]);

  useEffect(() => {
    void logisticsService.options()
      .then(setOptions)
      .catch((error) => {
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os cadastros da logística.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      });
  }, [notifications]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCalendar(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCalendar]);

  useEffect(() => {
    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void loadCalendar(), 80);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGISTICS_SYNC_STORAGE_KEY) scheduleRefresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') scheduleRefresh();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', scheduleRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', scheduleRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadCalendar]);

  useEffect(() => {
    if (!drawerMode && !detailLoad && !appointmentEditor && !statusEditor) return;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [appointmentEditor, detailLoad, drawerMode, statusEditor]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;

      if (statusEditor) {
        if (!statusSaving && statusVisibilitySavingId === null) {
          setStatusEditor(null);
          setStatusObservation('');
          setStatusVisible(true);
        }
        return;
      }

      if (appointmentEditor) {
        if (!appointmentSaving) {
          setAppointmentEditor(null);
          setAppointmentEntries([]);
        }
        return;
      }

      if (detailLoad) {
        setDetailLoad(null);
        return;
      }

      if (drawerMode) {
        if (!saving) {
          setDrawerMode(null);
          setSelectedLoad(null);
        }
        return;
      }

      if (selectedDate) {
        setSelectedDate(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [appointmentEditor, appointmentSaving, detailLoad, drawerMode, saving, selectedDate, statusEditor, statusSaving, statusVisibilitySavingId]);

  const daySummaries = useMemo<Record<string, CalendarDaySummary>>(() => {
    const raw: Record<string, {
      scheduled: Record<string, CalendarShipperSummary>;
      loading: Record<string, CalendarShipperSummary>;
    }> = {};

    loads.forEach((load) => {
      const scheduledDates = collectionScheduleDates(load);
      const loadingDate = dateKeyFromIso(load.loadingAt);

      scheduledDates.forEach((scheduledDate) => {
        if (scheduledDate >= monthRange.start && scheduledDate <= monthRange.end) {
          if (!raw[scheduledDate]) raw[scheduledDate] = { scheduled: {}, loading: {} };
          pushShipperSummary(raw[scheduledDate].scheduled, load);
        }
      });
      if (loadingDate && loadingDate >= monthRange.start && loadingDate <= monthRange.end) {
        if (!raw[loadingDate]) raw[loadingDate] = { scheduled: {}, loading: {} };
        pushShipperSummary(raw[loadingDate].loading, load);
      }
    });

    return Object.fromEntries(
      Object.entries(raw).map(([date, groups]) => [
        date,
        {
          scheduled: Object.values(groups.scheduled).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
          loading: Object.values(groups.loading).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        },
      ]),
    );
  }, [loads, monthRange.end, monthRange.start]);

  const visibleLoads = useMemo(() => {
    if (!selectedDate) return [];
    return loads
      .filter((load) => loadMatchesCalendarDate(load, selectedDate))
      .sort((a, b) => {
        const byShipper = a.shipperName.localeCompare(b.shipperName, 'pt-BR', { sensitivity: 'base' });
        if (byShipper !== 0) return byShipper;
        return loadSortTime(a) - loadSortTime(b);
      });
  }, [loads, selectedDate]);

  const loadingLoads = useMemo(() => {
    if (!selectedDate) return [];
    return visibleLoads.filter((load) => dateKeyFromIso(load.loadingAt) === selectedDate);
  }, [selectedDate, visibleLoads]);

  const scheduledCollectionLoads = useMemo(() => {
    if (!selectedDate) return [];
    return visibleLoads.filter((load) => collectionScheduleDates(load).includes(selectedDate));
  }, [selectedDate, visibleLoads]);

  const otherMovementLoads = useMemo(() => {
    if (!selectedDate) return [];
    const primaryIds = new Set([...loadingLoads, ...scheduledCollectionLoads].map((load) => load.id));
    return visibleLoads.filter((load) => !primaryIds.has(load.id));
  }, [loadingLoads, scheduledCollectionLoads, selectedDate, visibleLoads]);

  const dayHistory = useMemo(() => visibleLoads
    .flatMap((load) => load.events.map((event) => ({ load, event })))
    .sort((a, b) => new Date(b.event.occurredAt).getTime() - new Date(a.event.occurredAt).getTime()), [visibleLoads]);

  useEffect(() => {
    if (!selectedDate || loading || collectionAlertDateRef.current === selectedDate) return;

    const scheduledLoads = loads.filter((load) => collectionScheduleDates(load).includes(selectedDate));
    if (scheduledLoads.length === 0) return;

    collectionAlertDateRef.current = selectedDate;
    const shipperCounts = scheduledLoads.reduce<Record<string, number>>((accumulator, load) => {
      const shipper = load.shipperName?.trim() || 'SEM EMBARCADOR';
      accumulator[shipper] = (accumulator[shipper] ?? 0) + 1;
      return accumulator;
    }, {});
    const details = Object.entries(shipperCounts)
      .sort(([first], [second]) => first.localeCompare(second, 'pt-BR'))
      .slice(0, 6)
      .map(([shipper, count]) => `${shipper} · ${count} carga${count === 1 ? '' : 's'}`);

    void notifications.confirm({
      title: 'Atenção: coletas agendadas',
      message: `${scheduledLoads.length} carga${scheduledLoads.length === 1 ? '' : 's'} com coleta agendada em ${formatDate(selectedDate)}. Confira os horários antes de seguir com a operação.`,
      details,
      type: 'warning',
      confirmLabel: 'Entendi',
      hideCancel: true,
    });
  }, [loading, loads, notifications, selectedDate]);

  useEffect(() => {
    const viewport = listViewportRef.current;
    const table = listTableRef.current;

    if (!viewport || !table || !selectedDate || dayTab !== 'LOADS') {
      setFixedScrollbar((current) => (current.visible ? { ...current, visible: false } : current));
      return;
    }

    const updateFixedScrollbar = () => {
      const currentViewport = listViewportRef.current;
      const currentTable = listTableRef.current;
      if (!currentViewport || !currentTable) return;

      const rect = currentViewport.getBoundingClientRect();
      const contentWidth = currentTable.scrollWidth;
      const maxScroll = Math.max(0, contentWidth - currentViewport.clientWidth);
      const hasHorizontalOverflow = maxScroll > 2;
      const listIsOnScreen = rect.top < window.innerHeight && rect.bottom > 18;
      const desktopTableMode = window.innerWidth > 1680;
      const left = Math.max(0, rect.left);

      setFixedScrollbar({
        visible: hasHorizontalOverflow && listIsOnScreen && desktopTableMode,
        left,
        width: Math.max(0, Math.min(rect.width, window.innerWidth - left)),
        maxScroll,
        scrollLeft: Math.min(currentViewport.scrollLeft, maxScroll),
      });
    };

    const syncFromTable = () => {
      const currentViewport = listViewportRef.current;
      if (!currentViewport) return;
      setFixedScrollbar((current) => ({
        ...current,
        scrollLeft: Math.min(currentViewport.scrollLeft, current.maxScroll),
      }));
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateFixedScrollbar) : null;
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(table);
    viewport.addEventListener('scroll', syncFromTable, { passive: true });
    window.addEventListener('scroll', updateFixedScrollbar, { passive: true });
    window.addEventListener('resize', updateFixedScrollbar);
    updateFixedScrollbar();

    return () => {
      resizeObserver?.disconnect();
      viewport.removeEventListener('scroll', syncFromTable);
      window.removeEventListener('scroll', updateFixedScrollbar);
      window.removeEventListener('resize', updateFixedScrollbar);
    };
  }, [dayTab, selectedDate, visibleLoads.length]);

  const handleFixedHorizontalScroll = useCallback((nextScrollLeft: number) => {
    const viewport = listViewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = nextScrollLeft;
    setFixedScrollbar((current) => ({ ...current, scrollLeft: nextScrollLeft }));
  }, []);

  const shipperSelectOptions = useMemo(
    () => options.shippers.map((item) => ({ value: String(item.id), label: item.name })),
    [options.shippers],
  );
  const selectedShipper = useMemo(
    () => options.shippers.find((item) => String(item.id) === form.shipperId),
    [form.shipperId, options.shippers],
  );
  const formAccent = selectedShipper?.displayColor ?? selectedLoad?.shipperColor ?? '#3FA66C';

  function changeMonth(delta: number) {
    setSelectedDate(null);
    setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12, 0, 0, 0));
  }

  function goCurrentMonth() {
    setSelectedDate(null);
    setMonthAnchor(new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0));
  }

  function selectCalendarDate(date: Date) {
    collectionAlertDateRef.current = null;
    setDayTab('LOADS');
    setSelectedDate(localDateString(date));
  }

  function returnToCalendar() {
    collectionAlertDateRef.current = null;
    setDayTab('LOADS');
    setDetailLoad(null);
    setSelectedDate(null);
  }

  function openCreate() {
    const next = emptyForm();
    if (selectedDate) {
      next.loadingAt = selectedDate;
    }
    setDetailLoad(null);
    setSelectedLoad(null);
    setForm(next);
    setDrawerMode('create');
  }

  function openEdit(load: LogisticsLoad) {
    setDetailLoad(null);
    setSelectedLoad(load);
    setForm(formFromLoad(load));
    setDrawerMode('edit');
  }

  function openDuplicate(load: LogisticsLoad) {
    const duplicated = formFromLoad(load);
    setDetailLoad(null);
    setSelectedLoad(load);
    setForm({
      ...duplicated,
      // A referência é um identificador interno único e será gerada novamente no backend.
      referenceCode: '',
    });
    setDrawerMode('duplicate');
  }

  function closeDrawer() {
    if (saving) return;
    setDrawerMode(null);
    setSelectedLoad(null);
  }

  function openAppointmentEditor(load: LogisticsLoad, kind: AppointmentKind) {
    setDetailLoad(null);
    setStatusEditor(null);
    setAppointmentEditor({ load, kind });
    const source = kind === 'COLLECTION' ? load.collectionAppointments : load.deliveryAppointments;
    setAppointmentEntries(source.map((entry) => ({ ...entry, scheduledAt: toLocalInput(entry.scheduledAt) })));
  }

  function closeAppointmentEditor() {
    if (appointmentSaving) return;
    setAppointmentEditor(null);
    setAppointmentEntries([]);
  }

  function addAppointmentEntry() {
    const fallbackLocation = appointmentEditor?.kind === 'COLLECTION'
      ? appointmentEditor.load.collectionTerminal ?? ''
      : appointmentEditor?.load.deliveryLocation ?? '';
    setAppointmentEntries((current) => [
      ...current,
      { scheduledAt: selectedDate ? `${selectedDate}T08:00` : '', locationTypeId: null, location: fallbackLocation },
    ]);
  }

  function updateAppointmentEntry(index: number, patch: Partial<LogisticsAppointment>) {
    setAppointmentEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...patch } : entry));
  }

  function removeAppointmentEntry(index: number) {
    setAppointmentEntries((current) => current.filter((_, entryIndex) => entryIndex !== index));
  }

  async function saveAppointments() {
    if (!appointmentEditor) return;
    const invalid = appointmentEntries.some((entry) => !entry.scheduledAt);
    if (invalid) {
      notifications.warning(appointmentEditor.kind === 'COLLECTION' ? 'Horário incompleto' : 'Agendamento incompleto', appointmentEditor.kind === 'COLLECTION' ? 'Informe a data e hora de todos os horários de coleta adicionados.' : 'Informe a data e hora de todos os agendamentos adicionados.');
      return;
    }

    const normalized = appointmentEntries.map((entry) => ({ ...entry, location: entry.location.trim() }));
    setAppointmentSaving(true);
    try {
      const updated = await logisticsService.updateAppointments(appointmentEditor.load.id, appointmentEditor.kind, normalized);
      setLoads((current) => current.map((item) => item.id === updated.id ? updated : item));
      notifications.success(appointmentEditor.kind === 'COLLECTION' ? 'Horários atualizados' : 'Agendamentos atualizados', appointmentEditor.kind === 'COLLECTION'
        ? 'Os horários de coleta foram atualizados sem alterar o cadastro da carga.'
        : 'Os horários de baixa foram atualizados sem alterar o cadastro da carga.');
      setAppointmentEditor(null);
      setAppointmentEntries([]);
      await loadCalendar();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, appointmentEditor.kind === 'COLLECTION' ? 'Não foi possível salvar os horários de coleta.' : 'Não foi possível salvar os agendamentos.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setAppointmentSaving(false);
    }
  }

  function openStatusEditor(load: LogisticsLoad) {
    setDetailLoad(null);
    setAppointmentEditor(null);
    setAppointmentEntries([]);
    setStatusObservation('');
    setStatusVisible(true);
    setStatusEditor({ load });
  }

  function closeStatusEditor() {
    if (statusSaving || statusVisibilitySavingId !== null) return;
    setStatusEditor(null);
    setStatusObservation('');
    setStatusVisible(true);
  }

  async function saveStatusObservation() {
    if (!statusEditor) return;
    const observation = statusObservation.trim();
    if (!observation) {
      notifications.warning('Observação obrigatória', 'Digite uma observação antes de adicionar ao status da viagem.');
      return;
    }

    setStatusSaving(true);
    try {
      const updated = await logisticsService.addStatusNote(statusEditor.load.id, observation, isAdministrator ? statusVisible : true);
      setLoads((current) => current.map((item) => item.id === updated.id ? updated : item));
      setStatusEditor({ load: updated });
      setStatusObservation('');
      setStatusVisible(true);
      notifications.success('Status registrado', isAdministrator && !statusVisible
        ? 'A observação foi salva e ficará visível somente para administradores.'
        : 'A observação foi adicionada ao histórico desta viagem.');
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível registrar o status da viagem.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setStatusSaving(false);
    }
  }

  async function toggleStatusNoteVisibility(noteId: number, nextVisible: boolean) {
    if (!statusEditor || !isAdministrator || statusVisibilitySavingId !== null) return;
    setStatusVisibilitySavingId(noteId);
    try {
      const updated = await logisticsService.updateStatusNoteVisibility(statusEditor.load.id, noteId, nextVisible);
      setLoads((current) => current.map((item) => item.id === updated.id ? updated : item));
      setStatusEditor({ load: updated });
      notifications.success(
        nextVisible ? 'Observação liberada' : 'Observação ocultada',
        nextVisible ? 'Os demais usuários poderão visualizar essa mensagem.' : 'Somente administradores poderão visualizar essa mensagem.',
      );
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível alterar a visibilidade da observação.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setStatusVisibilitySavingId(null);
    }
  }


  async function saveLoad() {
    const validation = validateLogisticsForm(form);
    if (validation) {
      notifications.warning(validation.title, validation.message);
      return;
    }

    setSaving(true);
    try {
      let saved: LogisticsLoad;
      if (drawerMode === 'create') {
        saved = await logisticsService.create(form);
        notifications.success('Carga criada', 'A carga foi adicionada à logística.');
      } else if (drawerMode === 'duplicate' && selectedLoad) {
        saved = await logisticsService.duplicate(selectedLoad.id, form);
        notifications.success(
          'Carga duplicada',
          'Todos os dados operacionais e agendamentos da carga original foram copiados para a nova carga.',
        );
      } else if (selectedLoad) {
        const originalStage = selectedLoad.stage;
        saved = await logisticsService.update(selectedLoad.id, form);
        if (!selectedLoad.completedAt && originalStage !== form.stage) {
          saved = await logisticsService.move(selectedLoad.id, form.stage, 9999);
        }
        notifications.success('Carga atualizada', 'As alterações foram salvas com sucesso.');
      } else {
        return;
      }

      const targetDate = dateKeyFromIso(saved.loadingAt ?? saved.collectionAt ?? saved.deliveryAt);
      if (targetDate) {
        const target = new Date(`${targetDate}T12:00:00`);
        setMonthAnchor(new Date(target.getFullYear(), target.getMonth(), 1, 12, 0, 0, 0));
      }
      setDrawerMode(null);
      setSelectedLoad(null);
      await loadCalendar();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar a carga.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  async function finishLoad(load: LogisticsLoad) {
    if (load.stage !== 'DELIVERY' || load.completedAt) return;
    const confirmed = await notifications.confirm({
      title: 'Finalizar carga?',
      message: 'A carga será marcada como finalizada.',
      details: ['Ela continuará disponível no histórico da logística.'],
      type: 'warning',
      confirmLabel: 'Finalizar carga',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;

    setFinishingId(load.id);
    try {
      await logisticsService.finish(load.id);
      notifications.success('Carga finalizada', 'A carga foi finalizada com sucesso.');
      closeDrawer();
      await loadCalendar();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível finalizar a carga.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setFinishingId(null);
    }
  }

  async function deleteLoad(load: LogisticsLoad) {
    const confirmed = await notifications.confirm({
      title: 'Excluir carga?',
      message: 'A carga sairá do Painel e do Calendário.',
      details: ['A exclusão ficará registrada no banco de dados para auditoria.'],
      type: 'error',
      confirmLabel: 'Excluir carga',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;

    setDeletingId(load.id);
    try {
      await logisticsService.remove(load.id);
      notifications.success('Carga excluída', 'A carga foi removida das telas operacionais.');
      closeDrawer();
      await loadCalendar();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível excluir a carga.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setDeletingId(null);
    }
  }

  function renderLoadRow(load: LogisticsLoad, rowKey: string) {
    const collectionCount = load.collectionAppointments.length;
    const deliveryCount = load.deliveryAppointments.length;
    const collectionScheduled = collectionCount > 0;
    const deliveryScheduled = deliveryCount > 0;

    return (
      <ListRow
        key={rowKey}
        $accent={load.shipperColor || '#7d8b82'}
        tabIndex={0}
        role="button"
        aria-label={`Abrir detalhes da carga ${loadIdentifier(load)}`}
        onClick={() => setDetailLoad(load)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setDetailLoad(load);
          }
        }}
      >
        <ListCell $strong>
          <ListShipperBadge $accent={load.shipperColor || '#7d8b82'}>
            {load.shipperName || '—'}
          </ListShipperBadge>
        </ListCell>
        <ListCell>{load.loadingCityLabel || load.loadingLocation || '—'}</ListCell>
        <ListCell $muted={!load.notes}>{load.notes || '—'}</ListCell>
        <ListCell>{load.deliveryCityLabel || '—'}</ListCell>
        <ListCell $muted={!load.destinationNotes}>{load.destinationNotes || '—'}</ListCell>
        <ListCell>{formatTime(load.loadingAt)}</ListCell>
        <ListCell>{load.shipownerName || load.shipowner || '—'}</ListCell>
        <ListCell onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <ScheduleStatusButton
            type="button"
            $scheduled={collectionScheduled}
            onClick={() => openAppointmentEditor(load, 'COLLECTION')}
            title="Abrir horários da coleta"
          >
            <CalendarDays size={16} />
            <span>{collectionScheduled ? `Horários coleta · ${collectionCount}` : 'Horários coleta'}</span>
          </ScheduleStatusButton>
        </ListCell>
        <ListCell onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <ScheduleStatusButton
            type="button"
            $scheduled={deliveryScheduled}
            onClick={() => openAppointmentEditor(load, 'DELIVERY')}
            title="Abrir agendamentos da baixa"
          >
            <CalendarDays size={16} />
            <span>{deliveryScheduled ? `Baixa agendada · ${deliveryCount}` : 'Agendar baixa'}</span>
          </ScheduleStatusButton>
        </ListCell>
        <ListCell>{load.containerTypeName || '—'}</ListCell>
        <ListCell onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <StatusTravelButton type="button" onClick={() => openStatusEditor(load)} title="Abrir status da viagem">
            <MessageSquareText size={16} />
            <span>Status viagem</span>
            {load.statusNotes.length > 0 ? <strong>{load.statusNotes.length}</strong> : null}
          </StatusTravelButton>
        </ListCell>
        <ListActions onClick={(event) => event.stopPropagation()}>
          <ListActionButton type="button" onClick={() => openEdit(load)} title="Editar carga"><Edit3 size={15} /> Editar</ListActionButton>
          <ListActionButton type="button" onClick={() => openDuplicate(load)} title="Duplicar carga"><Copy size={15} /> Duplicar</ListActionButton>
          <ListActionButton
            type="button"
            onClick={() => void deleteLoad(load)}
            title="Excluir carga"
            disabled={deletingId === load.id}
          >
            <Trash2 size={15} /> {deletingId === load.id ? 'Excluindo' : 'Excluir'}
          </ListActionButton>
        </ListActions>
      </ListRow>
    );
  }

  return (
    <Page>
      <Header>
        <h1>Calendário de cargas</h1>
        <PrimaryButton type="button" onClick={openCreate}><Plus size={17} /> Nova carga</PrimaryButton>
      </Header>

      {!selectedDate ? (
        <>
          <Toolbar>
            <WeekControls>
              <SecondaryButton type="button" onClick={goCurrentMonth} title="Voltar para o mês atual">
                Semana {currentWeekInfo.week}/{currentWeekInfo.year}
              </SecondaryButton>
              <IconButton type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={18} /></IconButton>
              <IconButton type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês"><ChevronRight size={18} /></IconButton>
              <MonthTitle>{formatMonth(monthAnchor)}</MonthTitle>
            </WeekControls>

            <FilterBox>
              <SearchableSelect
                id="calendar-shipper-filter"
                value={shipperFilter}
                options={shipperSelectOptions}
                onChange={setShipperFilter}
                placeholder="Todos os embarcadores"
                searchPlaceholder="Buscar embarcador..."
                emptyMessage="Nenhum embarcador encontrado."
                ariaLabel="Filtrar calendário por embarcador"
              />
            </FilterBox>
          </Toolbar>

          <CalendarDropdown>
            <WeekCalendarHeader>
              <div>
                <strong><CalendarDays size={16} /> Datas do mês</strong>
                <WeekRangeText>
                  {formatDate(monthRange.start)} até {formatDate(monthRange.end)} · Agendar coleta e carregamentos separados por dia
                </WeekRangeText>
              </div>
            </WeekCalendarHeader>
            {loading ? <LoadingState><RefreshCw size={22} /> Carregando calendário...</LoadingState> : (
              <WeekDatesScroller>
                <MonthWeekdayGrid>
                  <CalendarWeekNumberHeader>Sem.</CalendarWeekNumberHeader>
                  {WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}
                </MonthWeekdayGrid>
                {monthWeeks.map((week) => (
                  <MonthWeekRow key={`${week.year}-${week.week}`}>
                    <CalendarWeekNumber title={`Semana ${week.week}/${week.year}`}>
                      <span>Semana</span>
                      <strong>{week.week}</strong>
                    </CalendarWeekNumber>
                    {week.days.map((date, index) => {
                      if (!date) return <CalendarEmptyDay key={`empty-${week.year}-${week.week}-${index}`} aria-hidden="true" />;

                      const key = localDateString(date);
                      const summary = daySummaries[key] ?? { scheduled: [], loading: [] };
                      const scheduledTotal = summary.scheduled.reduce((total, item) => total + item.count, 0);
                      const loadingTotal = summary.loading.reduce((total, item) => total + item.count, 0);
                      const isToday = key === localDateString(today);
                      return (
                        <CalendarDayButton
                          key={key}
                          type="button"
                          $selected={false}
                          $today={isToday}
                          $sunday={index === 0}
                          onClick={() => selectCalendarDate(date)}
                          aria-label={`${WEEK_DAYS[index]}, ${formatDate(key)}, ${scheduledTotal} agendamento(s), ${loadingTotal} carregamento(s)`}
                        >
                          <div className="day-heading">
                            <span>{WEEK_DAYS[index]}</span>
                            <strong>{date.getDate()}</strong>
                          </div>
                          {index !== 0 ? (
                          <CalendarDayFlow style={{ gridTemplateColumns: scheduledTotal > 0 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)' }}>
                            {scheduledTotal > 0 ? (
                              <CalendarDayFlowColumn>
                                <CalendarDayFlowTitle>Agendar coleta <strong>{scheduledTotal}</strong></CalendarDayFlowTitle>
                                {summary.scheduled.map((item) => (
                                  <CalendarShipperCount key={`scheduled-${item.name}`}>
                                    <i style={{ background: item.color }} />
                                    <span title={item.name}>{item.name}</span>
                                    <strong>{item.count}</strong>
                                  </CalendarShipperCount>
                                ))}
                              </CalendarDayFlowColumn>
                            ) : null}
                            <CalendarDayFlowColumn>
                              <CalendarDayFlowTitle>Carregamentos <strong>{loadingTotal}</strong></CalendarDayFlowTitle>
                              {summary.loading.length === 0 ? <em>—</em> : summary.loading.map((item) => (
                                <CalendarShipperCount key={`loading-${item.name}`}>
                                  <i style={{ background: item.color }} />
                                  <span title={item.name}>{item.name}</span>
                                  <strong>{item.count}</strong>
                                </CalendarShipperCount>
                              ))}
                            </CalendarDayFlowColumn>
                          </CalendarDayFlow>
                          ) : null}
                        </CalendarDayButton>
                      );
                    })}
                  </MonthWeekRow>
                ))}
              </WeekDatesScroller>
            )}
          </CalendarDropdown>
        </>
      ) : (
        <LoadsSection>
          <SelectedDateBar>
            <SecondaryButton type="button" onClick={returnToCalendar}><ArrowLeft size={16} /> Voltar ao calendário</SecondaryButton>
            <div>
              <strong>Cargas de {formatDate(selectedDate)}</strong>
              <span>{loadingLoads.length} carregamento(s) · {scheduledCollectionLoads.length} agendamento(s) de coleta.</span>
            </div>
            <FilterBox>
              <SearchableSelect
                id="list-shipper-filter"
                value={shipperFilter}
                options={shipperSelectOptions}
                onChange={setShipperFilter}
                placeholder="Todos os embarcadores"
                searchPlaceholder="Buscar embarcador..."
                emptyMessage="Nenhum embarcador encontrado."
                ariaLabel="Filtrar listagem por embarcador"
              />
            </FilterBox>
          </SelectedDateBar>

          <DayTabs role="tablist" aria-label="Conteúdo do dia selecionado">
            <DayTabButton
              type="button"
              role="tab"
              aria-selected={dayTab === 'LOADS'}
              $active={dayTab === 'LOADS'}
              onClick={() => setDayTab('LOADS')}
            >
              Dia <strong>{visibleLoads.length}</strong>
            </DayTabButton>
            <DayTabButton
              type="button"
              role="tab"
              aria-selected={dayTab === 'HISTORY'}
              $active={dayTab === 'HISTORY'}
              onClick={() => setDayTab('HISTORY')}
            >
              <History size={16} /> Histórico <strong>{dayHistory.length}</strong>
            </DayTabButton>
          </DayTabs>

          {dayTab === 'HISTORY' ? (
            dayHistory.length === 0 ? (
              <EmptyState>Nenhuma alteração registrada nas cargas deste dia.</EmptyState>
            ) : (
              <DayHistoryList>
                {dayHistory.map(({ load, event }) => (
                  <DayHistoryItem key={`${load.id}-${event.id}`} $accent={load.shipperColor || '#7d8b82'}>
                    <div>
                      <span>Carga</span>
                      <strong>{load.shipperName} · {loadIdentifier(load)}</strong>
                    </div>
                    <div>
                      <span>Alteração</span>
                      <p>{eventMessage(event)}</p>
                    </div>
                    <div>
                      <span>Usuário</span>
                      <strong>{event.userName || 'Sistema'}</strong>
                    </div>
                    <div>
                      <span>Data / hora</span>
                      <strong>{formatDateTime(event.occurredAt)}</strong>
                    </div>
                  </DayHistoryItem>
                ))}
              </DayHistoryList>
            )
          ) : loading ? <LoadingState><RefreshCw size={22} /> Carregando cargas...</LoadingState> : (
            <ListViewport ref={listViewportRef}>
              {visibleLoads.length === 0 ? (
                <EmptyState>Nenhum carregamento, agendamento de coleta ou outra movimentação encontrada para esta data.</EmptyState>
              ) : (
                <ListTable ref={listTableRef}>
                  <ListHeaderRow>
                    <span>Embarcador</span>
                    <span>Origem</span>
                    <span>Observação</span>
                    <span>Destino</span>
                    <span>Observação</span>
                    <span>Hora carregamento</span>
                    <span>Armador</span>
                    <span>Coleta</span>
                    <span>Baixa</span>
                    <span>Tipo container</span>
                    <span>Status viagem</span>
                    <span>Ações</span>
                  </ListHeaderRow>

                  <ListGroupHeader $tone="loading">
                    <div>
                      <strong>Carregamentos do dia</strong>
                      <span>Somente cargas com Data / Hora de carregamento em {formatDate(selectedDate)}.</span>
                    </div>
                    <strong>{loadingLoads.length}</strong>
                  </ListGroupHeader>
                  {loadingLoads.length === 0 ? (
                    <ListGroupEmpty>Nenhum carregamento para esta data.</ListGroupEmpty>
                  ) : loadingLoads.map((load) => renderLoadRow(load, `loading-${load.id}`))}

                  <ListGroupHeader $tone="schedule">
                    <div>
                      <strong>Agendamentos de coleta</strong>
                      <span>Somente cargas com o campo Agendar Coleta preenchido para {formatDate(selectedDate)}.</span>
                    </div>
                    <strong>{scheduledCollectionLoads.length}</strong>
                  </ListGroupHeader>
                  {scheduledCollectionLoads.length === 0 ? (
                    <ListGroupEmpty>Nenhum agendamento de coleta para esta data.</ListGroupEmpty>
                  ) : scheduledCollectionLoads.map((load) => renderLoadRow(load, `scheduled-${load.id}`))}

                  {otherMovementLoads.length > 0 ? (
                    <Fragment>
                      <ListGroupHeader $tone="movement">
                        <div>
                          <strong>Outras movimentações do dia</strong>
                          <span>Coletas realizadas e baixas continuam visíveis, mas não contam como agendamento de coleta.</span>
                        </div>
                        <strong>{otherMovementLoads.length}</strong>
                      </ListGroupHeader>
                      {otherMovementLoads.map((load) => renderLoadRow(load, `movement-${load.id}`))}
                    </Fragment>
                  ) : null}
                </ListTable>
              )}
            </ListViewport>
          )}

          {dayTab === 'LOADS' && fixedScrollbar.visible && typeof document !== 'undefined'
            ? createPortal(
                <FixedHorizontalScrollbar
                  style={{ left: fixedScrollbar.left, width: fixedScrollbar.width }}
                  aria-label="Rolagem horizontal da listagem"
                >
                  <span>ARRASTE</span>
                  <FixedHorizontalScrollbarTrack
                    min={0}
                    max={Math.max(1, fixedScrollbar.maxScroll)}
                    step={1}
                    value={Math.min(fixedScrollbar.scrollLeft, fixedScrollbar.maxScroll)}
                    onChange={(event) => handleFixedHorizontalScroll(Number(event.target.value))}
                    aria-label="Mover colunas da listagem para os lados"
                  />
                  <span>↔</span>
                </FixedHorizontalScrollbar>,
                document.body,
              )
            : null}
        </LoadsSection>
      )}

      {appointmentEditor ? (
        <>
          <AppointmentBackdrop onClick={closeAppointmentEditor} />
          <AppointmentModal role="dialog" aria-modal="true" aria-labelledby="appointment-modal-title">
            <AppointmentHeader>
              <div>
                <h3 id="appointment-modal-title">{appointmentEditor.kind === 'COLLECTION' ? 'Horários da coleta' : 'Agendamentos da baixa'}</h3>
                <p>{appointmentEditor.load.shipperName} · {appointmentEditor.kind === 'COLLECTION' ? (appointmentEditor.load.collectionTerminal || 'Local de coleta não informado') : (appointmentEditor.load.deliveryLocation || 'Local de baixa não informado')}</p>
              </div>
              <IconButton type="button" onClick={closeAppointmentEditor} disabled={appointmentSaving} aria-label="Fechar agendamentos"><X size={17} /></IconButton>
            </AppointmentHeader>

            <AppointmentBody>
              {appointmentEntries.length === 0 ? (
                <AppointmentEmpty>{appointmentEditor.kind === 'COLLECTION' ? 'Nenhum horário de coleta cadastrado. Clique em “Adicionar horário” para incluir.' : 'Nenhum agendamento cadastrado. Clique em “Adicionar horário” para incluir.'}</AppointmentEmpty>
              ) : appointmentEntries.map((entry, index) => {
                const locationTypes = options.locationTypes.filter((item) => item.scope === (appointmentEditor.kind === 'COLLECTION' ? 'C' : 'B'));
                return (
                  <AppointmentRow key={`${appointmentEditor.kind}-${index}`}>
                    <label>
                      {appointmentEditor.kind === 'COLLECTION' ? 'Data / hora da coleta' : 'Data / hora da baixa'}
                      <input
                        type="datetime-local"
                        value={entry.scheduledAt}
                        onChange={(event) => updateAppointmentEntry(index, { scheduledAt: event.target.value })}
                      />
                    </label>
                    <label>
                      {appointmentEditor.kind === 'COLLECTION' ? 'Local da coleta' : 'Local da baixa'}
                      <input
                        type="text"
                        maxLength={180}
                        value={entry.location}
                        onChange={(event) => updateAppointmentEntry(index, { location: event.target.value })}
                        placeholder={appointmentEditor.kind === 'COLLECTION' ? 'Digite o local da coleta' : 'Digite o local da baixa'}
                      />
                    </label>
                    <label>
                      Tipo do local
                      <select
                        value={entry.locationTypeId ?? ''}
                        onChange={(event) => updateAppointmentEntry(index, { locationTypeId: event.target.value ? Number(event.target.value) : null })}
                      >
                        <option value="">Selecione</option>
                        {locationTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                    </label>
                    <AppointmentRemoveButton type="button" onClick={() => removeAppointmentEntry(index)} title="Remover horário" aria-label="Remover horário">
                      <Trash2 size={16} />
                    </AppointmentRemoveButton>
                  </AppointmentRow>
                );
              })}

              <AppointmentAddButton type="button" onClick={addAppointmentEntry} disabled={appointmentEntries.length >= 20}>
                <Plus size={15} /> {appointmentEntries.length >= 20 ? 'Limite atingido' : 'Adicionar horário'}
              </AppointmentAddButton>
            </AppointmentBody>

            <AppointmentFooter>
              <SecondaryButton type="button" onClick={closeAppointmentEditor} disabled={appointmentSaving}>Cancelar</SecondaryButton>
              <PrimaryButton type="button" onClick={() => void saveAppointments()} disabled={appointmentSaving}>
                {appointmentSaving ? <RefreshCw size={15} /> : <Save size={15} />} {appointmentSaving ? 'Salvando...' : appointmentEditor.kind === 'COLLECTION' ? 'Salvar horários' : 'Salvar agendamentos'}
              </PrimaryButton>
            </AppointmentFooter>
          </AppointmentModal>
        </>
      ) : null}

      {statusEditor ? (
        <>
          <AppointmentBackdrop onClick={closeStatusEditor} />
          <AppointmentModal role="dialog" aria-modal="true" aria-labelledby="status-trip-modal-title">
            <AppointmentHeader>
              <div>
                <h3 id="status-trip-modal-title">Status da viagem</h3>
                <p>{statusEditor.load.shipperName} · {loadIdentifier(statusEditor.load)}</p>
              </div>
              <IconButton type="button" onClick={closeStatusEditor} disabled={statusSaving || statusVisibilitySavingId !== null} aria-label="Fechar status da viagem"><X size={17} /></IconButton>
            </AppointmentHeader>

            <AppointmentBody>
              <label>
                <strong>Nova observação</strong>
                <StatusTextarea
                  maxLength={2000}
                  value={statusObservation}
                  onChange={(event) => setStatusObservation(event.target.value)}
                  placeholder="Descreva a situação atual desta viagem..."
                />
              </label>

              {isAdministrator ? (
                <StatusVisibilityRow>
                  <span>Visibilidade para os demais usuários</span>
                  <StatusVisibilityButton
                    type="button"
                    $visible={statusVisible}
                    onClick={() => setStatusVisible((current) => !current)}
                    disabled={statusSaving}
                    title={statusVisible ? 'Clique para não exibir aos demais usuários' : 'Clique para exibir aos demais usuários'}
                  >
                    {statusVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    {statusVisible ? 'Exibir' : 'Não exibir'}
                  </StatusVisibilityButton>
                </StatusVisibilityRow>
              ) : null}

              <StatusHistory>
                <h4>Histórico de observações</h4>
                {statusEditor.load.statusNotes.length === 0 ? (
                  <AppointmentEmpty>Nenhuma observação de status cadastrada para esta viagem.</AppointmentEmpty>
                ) : statusEditor.load.statusNotes.map((note) => (
                  <StatusHistoryItem key={note.id}>
                    <div>
                      <div>
                        <strong>{note.userName}</strong>
                        <span>{formatDateTime(note.createdAt)}</span>
                      </div>
                      {isAdministrator ? (
                        <StatusVisibilityButton
                          type="button"
                          $visible={note.isVisible}
                          onClick={() => void toggleStatusNoteVisibility(note.id, !note.isVisible)}
                          disabled={statusVisibilitySavingId !== null}
                          title={note.isVisible ? 'Ocultar esta observação dos demais usuários' : 'Exibir esta observação aos demais usuários'}
                        >
                          {note.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                          {note.isVisible ? 'Exibir' : 'Não exibir'}
                        </StatusVisibilityButton>
                      ) : null}
                    </div>
                    <p>{note.observation}</p>
                  </StatusHistoryItem>
                ))}
              </StatusHistory>
            </AppointmentBody>

            <AppointmentFooter>
              <SecondaryButton type="button" onClick={closeStatusEditor} disabled={statusSaving || statusVisibilitySavingId !== null}>Fechar</SecondaryButton>
              <PrimaryButton type="button" onClick={() => void saveStatusObservation()} disabled={statusSaving || statusVisibilitySavingId !== null || !statusObservation.trim()}>
                {statusSaving ? <RefreshCw size={15} /> : <Plus size={15} />} {statusSaving ? 'Salvando...' : 'Adicionar observação'}
              </PrimaryButton>
            </AppointmentFooter>
          </AppointmentModal>
        </>
      ) : null}

      {detailLoad ? (
        <>
          <DetailBackdrop onClick={() => setDetailLoad(null)} />
          <DetailDrawer role="dialog" aria-modal="true" aria-labelledby="load-detail-title">
            <DetailHeader $accent={detailLoad.shipperColor}>
              <div>
                <span>EMBARCADOR</span>
                <h2 id="load-detail-title">{detailLoad.shipperName}</h2>
              </div>
              <IconButton type="button" onClick={() => setDetailLoad(null)} aria-label="Fechar detalhes"><X size={17} /></IconButton>
            </DetailHeader>

            <DetailBody>
              <DetailStatus $accent={detailLoad.shipperColor}>
                <span>{STAGE_LABELS[detailLoad.stage]}</span>
                <strong>{detailLoad.completedAt ? 'FINALIZADO' : 'EM PROCESSO'}</strong>
              </DetailStatus>

              <DetailSection>
                <DetailSectionTitle>Trajeto</DetailSectionTitle>
                <DetailRoute>
                  <strong>{detailLoad.loadingCityLabel || detailLoad.loadingLocation || 'Origem não informada'}</strong>
                  <ArrowRight size={19} />
                  <strong>{detailLoad.deliveryCityLabel || detailLoad.deliveryLocation || 'Destino não informado'}</strong>
                </DetailRoute>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Identificação e planejamento</DetailSectionTitle>
                <DetailGrid>
                  <DetailItem><span>Local de carregamento</span><strong>{detailLoad.loadingLocation || '—'}</strong></DetailItem>
                  <DetailItem><span>Data de carregamento</span><strong>{formatDateTime(detailLoad.loadingAt)}</strong></DetailItem>
                  <DetailItem><span>Plano</span><strong>{detailLoad.plan || '—'}</strong></DetailItem>
                  <DetailItem><span>Nº Carga / Load</span><strong>{loadIdentifier(detailLoad)}</strong></DetailItem>
                  <DetailItem><span>Tipo de carga</span><strong>{detailLoad.cargoTypeName || '—'}</strong></DetailItem>
                  <DetailItem><span>Remessa</span><strong>{detailLoad.shipmentNumber || '—'}</strong></DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Datas operacionais</DetailSectionTitle>
                <DetailGrid>
                  <DetailItem $full><span>Agendamento da coleta</span><strong>{formatDate(detailLoad.collectionScheduledAt)}</strong></DetailItem>
                  <DetailItem><span>Local coleta</span><strong>{detailLoad.collectionTerminal || '—'}</strong></DetailItem>
                  <DetailItem><span>Data / hora coleta</span><strong>{formatDateTime(detailLoad.collectionAt)}</strong></DetailItem>
                  <DetailItem><span>Local da baixa</span><strong>{detailLoad.deliveryLocation || '—'}</strong></DetailItem>
                  <DetailItem><span>Data da baixa</span><strong>{formatDateTime(detailLoad.deliveryAt)}</strong></DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Armador e bookings</DetailSectionTitle>
                <DetailGrid>
                  <DetailItem><span>Armador</span><strong>{detailLoad.shipownerName || detailLoad.shipowner || '—'}</strong></DetailItem>
                  <DetailItem><span>Navio</span><strong>{detailLoad.vessel || '—'}</strong></DetailItem>
                  <DetailItem><span>Deadline</span><strong>{formatDate(detailLoad.deadline)}</strong></DetailItem>
                  <DetailItem><span>Booking coleta</span><strong>{detailLoad.collectionBookingNumber || '—'}</strong></DetailItem>
                  <DetailItem><span>Booking baixa</span><strong>{detailLoad.bookingNumber || '—'}</strong></DetailItem>
                  <DetailItem><span>País</span><strong>{detailLoad.country || '—'}</strong></DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Container</DetailSectionTitle>
                <DetailGrid>
                  <DetailItem><span>Tipo</span><strong>{detailLoad.containerTypeName || '—'}</strong></DetailItem>
                  <DetailItem><span>Nº Container</span><strong>{detailLoad.containerNumber || '—'}</strong></DetailItem>
                  <DetailItem><span>Tara</span><strong>{formatWeight(detailLoad.containerTareKg)}</strong></DetailItem>
                  <DetailItem><span>Payload</span><strong>{formatWeight(detailLoad.containerPayloadKg)}</strong></DetailItem>
                  <DetailItem><span>Lacre armador</span><strong>{detailLoad.shipownerSeal || '—'}</strong></DetailItem>
                  <DetailItem><span>Lacre SIF</span><strong>{detailLoad.sifSeal || '—'}</strong></DetailItem>
                  <DetailItem><span>Temperatura</span><strong>{detailLoad.temperature || '—'}</strong></DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Equipe e veículos</DetailSectionTitle>
                <DetailGrid>
                  <DetailItem><span>Placas</span><strong>{plateSummary(detailLoad)}</strong></DetailItem>
                  <DetailItem><span>Motoristas</span><strong>{driverSummary(detailLoad)}</strong></DetailItem>
                  <DetailItem><span>Tipo das placas</span><strong>{detailLoad.plateMode === 'THIRD_PARTY' ? 'Terceiro' : 'Frota própria'}</strong></DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Observações</DetailSectionTitle>
                <DetailGrid>
                  <DetailItem $full><span>Observação origem</span><strong>{detailLoad.notes || '—'}</strong></DetailItem>
                  <DetailItem $full><span>Observação destino</span><strong>{detailLoad.destinationNotes || '—'}</strong></DetailItem>
                </DetailGrid>
              </DetailSection>

            </DetailBody>
          </DetailDrawer>
        </>
      ) : null}

      {drawerMode ? (
        <>
          <DrawerBackdrop onClick={closeDrawer} />
          <Drawer role="dialog" aria-modal="true" aria-labelledby="calendar-load-drawer-title">
            <DrawerHeader>
              <div>
                <h2 id="calendar-load-drawer-title">{drawerMode === 'edit' ? 'EDITAR CARGA' : drawerMode === 'duplicate' ? 'DUPLICAR CARGA' : 'NOVA CARGA'}</h2>
                <p>CADASTRO OPERACIONAL DA CARGA.</p>
              </div>
              <IconButton type="button" onClick={closeDrawer} aria-label="Fechar"><X size={17} /></IconButton>
            </DrawerHeader>

            <DrawerBody>
              <AccentPreview $accent={formAccent}>
                <div><strong>{selectedShipper?.name || 'Embarcador'}</strong><span>{form.shipowner || 'Selecione o armador'}</span></div>
                <span>{STAGE_LABELS[form.stage]}</span>
              </AccentPreview>

              <LogisticsLoadForm
                prefix="calendar-load"
                form={form}
                options={options}
                completed={Boolean(selectedLoad?.completedAt)}
                fixedLoadingDate={drawerMode === 'create' ? selectedDate ?? undefined : undefined}
                onChange={setForm}
                onOptionsChange={setOptions}
              />
            </DrawerBody>

            <DrawerFooter>
              <SecondaryButton type="button" onClick={closeDrawer}>Cancelar</SecondaryButton>
              {drawerMode === 'edit' && selectedLoad ? <DangerButton type="button" disabled={deletingId === selectedLoad.id} onClick={() => void deleteLoad(selectedLoad)}><Trash2 size={15} /> {deletingId === selectedLoad.id ? 'Excluindo...' : 'Excluir'}</DangerButton> : null}
              {drawerMode === 'edit' && selectedLoad && !selectedLoad.completedAt && selectedLoad.stage === 'DELIVERY' ? (
                <FinalizeButton type="button" disabled={finishingId === selectedLoad.id} onClick={() => void finishLoad(selectedLoad)}>
                  <CheckCircle2 size={16} /> {finishingId === selectedLoad.id ? 'Finalizando...' : 'Finalizar'}
                </FinalizeButton>
              ) : null}
              <PrimaryButton type="button" disabled={saving} onClick={() => void saveLoad()}>
                {saving ? <RefreshCw size={16} /> : <Save size={16} />} {saving ? 'Salvando...' : 'Salvar'}
              </PrimaryButton>
            </DrawerFooter>
          </Drawer>
        </>
      ) : null}
    </Page>
  );
}

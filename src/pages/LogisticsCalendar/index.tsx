import {
  CalendarDays,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SearchableSelect } from '../../components/SearchableSelect';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { LOGISTICS_SYNC_STORAGE_KEY, logisticsService } from '../Logistic/services';
import { LogisticsLoadForm } from '../Logistic/components/LogisticsLoadForm';
import { validateLogisticsForm } from '../Logistic/validation';
import type {
  LogisticsFormData,
  LogisticsLoad,
  LogisticsOptions,
  LogisticsStage,
} from '../Logistic/types';
import {
  AccentPreview,
  CalendarDayButton,
  CalendarDayFlow,
  CalendarDayFlowColumn,
  CalendarDayFlowTitle,
  CalendarShipperCount,
  CalendarDropdown,
  CalendarToggle,
  DangerButton,
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  EmptyState,
  FilterBox,
  FinalizeButton,
  FinalizedBadge,
  Header,
  IconButton,
  LoadCard,
  LoadList,
  LoadListViewport,
  SketchActionButton,
  SketchActions,
  SketchBodyGrid,
  SketchBodyItem,
  SketchLoadEntries,
  SketchObservation,
  SketchTopBar,
  SketchTopItem,
  LoadsCount,
  LoadsHeader,
  LoadsSection,
  LoadingState,
  MonthTitle,
  OperationalTabButton,
  OperationalTabs,
  Page,
  PrimaryButton,
  SecondaryButton,
  Toolbar,
  WeekCalendarHeader,
  WeekControls,
  WeekDatesGrid,
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

type OperationalTab = 'SCHEDULING' | 'COLLECTION' | 'LOADING' | 'DELIVERY';
type DrawerMode = 'create' | 'edit' | null;

const TAB_LABELS: Record<OperationalTab, string> = {
  SCHEDULING: 'Agendamento',
  COLLECTION: 'Coleta',
  LOADING: 'Carregamento',
  DELIVERY: 'Baixas / Entregas',
};

const TAB_DATE_HINTS: Record<OperationalTab, string> = {
  SCHEDULING: 'usa o campo Agendar coleta',
  COLLECTION: 'usa somente a data de coleta informada',
  LOADING: 'usa somente a data de carregamento informada',
  DELIVERY: 'usa somente a data de baixa/entrega informada',
};

const TABS: OperationalTab[] = ['SCHEDULING', 'COLLECTION', 'LOADING', 'DELIVERY'];

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

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatCompactDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function buildWeekCells(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
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

function emptyForm(selectedDate: string, tab: OperationalTab = 'SCHEDULING'): LogisticsFormData {
  const base: LogisticsFormData = {
    referenceCode: '',
    shipmentNumber: '',
    loadNumber: '',
    shipowner: '',
    bookingNumber: '',
    collectionBookingNumber: '',
    cargoTypeId: '',
    containerTypeId: '',
    shipownerId: '',
    shipperId: '',
    driverId: '',
    driverTwoId: '',
    tractorId: '',
    trailerId: '',
    collectionCityId: '',
    collectionTerminal: '',
    collectionLocationTypeId: '',
    collectionScheduledAt: '',
    collectionAt: '',
    loadingCityId: '',
    loadingLocation: '',
    loadingAt: '',
    deliveryCityId: '',
    deliveryLocation: '',
    deliveryLocationTypeId: '',
    deliveryAt: '',
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
  };

  if (tab === 'SCHEDULING') {
    base.collectionScheduledAt = selectedDate;
  } else if (tab === 'COLLECTION') {
    base.collectionAt = `${selectedDate}T08:00`;
    base.stage = 'COLLECTION';
  } else if (tab === 'LOADING') {
    base.loadingAt = `${selectedDate}T08:00`;
    base.stage = 'LOADING';
  } else if (tab === 'DELIVERY') {
    base.deliveryAt = `${selectedDate}T08:00`;
    base.stage = 'DELIVERY';
  }

  return base;
}

function formFromLoad(load: LogisticsLoad): LogisticsFormData {
  return {
    referenceCode: load.referenceCode,
    shipmentNumber: load.shipmentNumber ?? '',
    loadNumber: load.loadNumber ?? '',
    shipowner: load.shipowner ?? '',
    bookingNumber: load.bookingNumber ?? '',
    collectionBookingNumber: load.collectionBookingNumber ?? '',
    cargoTypeId: load.cargoTypeId ? String(load.cargoTypeId) : '',
    containerTypeId: load.containerTypeId ? String(load.containerTypeId) : '',
    shipownerId: load.shipownerId ? String(load.shipownerId) : '',
    shipperId: String(load.shipperId),
    driverId: load.driverId ? String(load.driverId) : '',
    driverTwoId: load.driverTwoId ? String(load.driverTwoId) : '',
    tractorId: load.tractorId ? String(load.tractorId) : '',
    trailerId: load.trailerId ? String(load.trailerId) : '',
    collectionCityId: load.collectionCityId ? String(load.collectionCityId) : '',
    collectionTerminal: load.collectionTerminal ?? '',
    collectionLocationTypeId: load.collectionLocationTypeId ? String(load.collectionLocationTypeId) : '',
    collectionScheduledAt: toDateInput(load.collectionScheduledAt),
    collectionAt: toLocalInput(load.collectionAt),
    loadingCityId: load.loadingCityId ? String(load.loadingCityId) : '',
    loadingLocation: load.loadingLocation ?? '',
    loadingAt: toLocalInput(load.loadingAt),
    deliveryCityId: load.deliveryCityId ? String(load.deliveryCityId) : '',
    deliveryLocation: load.deliveryLocation ?? '',
    deliveryLocationTypeId: load.deliveryLocationTypeId ? String(load.deliveryLocationTypeId) : '',
    deliveryAt: toLocalInput(load.deliveryAt),
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
  };
}

function referenceDateForTab(load: LogisticsLoad, tab: OperationalTab): string | null {
  if (tab === 'SCHEDULING') return load.collectionScheduledAt;
  if (tab === 'COLLECTION') return load.collectionAt;
  if (tab === 'LOADING') return load.loadingAt;
  return load.deliveryAt;
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

function isDateInRange(value: string | null, from: string, to: string): boolean {
  const key = dateKeyFromIso(value);
  return Boolean(key && key >= from && key <= to);
}

export function LogisticsCalendar() {
  const notifications = useNotifications();
  const today = useMemo(() => new Date(), []);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OperationalTab>('SCHEDULING');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [shipperFilter, setShipperFilter] = useState('');
  const [options, setOptions] = useState<LogisticsOptions>(EMPTY_OPTIONS);
  const [loads, setLoads] = useState<LogisticsLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedLoad, setSelectedLoad] = useState<LogisticsLoad | null>(null);
  const [form, setForm] = useState<LogisticsFormData>(() => emptyForm(localDateString(today)));
  const [saving, setSaving] = useState(false);
  const [finishingId, setFinishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const weekCells = useMemo(() => buildWeekCells(weekAnchor), [weekAnchor]);
  const weekStart = useMemo(() => localDateString(weekCells[0]), [weekCells]);
  const weekEnd = useMemo(() => localDateString(weekCells[6]), [weekCells]);
  const weekInfo = useMemo(() => isoWeekInfo(weekCells[3]), [weekCells]);
  const weekNumber = weekInfo.week;
  const weekYear = weekInfo.year;

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logisticsService.calendarWeek(weekStart, weekEnd, shipperFilter);
      setLoads(data);
      setSelectedLoad((current) => current ? data.find((item) => item.id === current.id) ?? current : null);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível carregar as cargas da semana.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setLoading(false);
    }
  }, [notifications, shipperFilter, weekEnd, weekStart]);

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
    if (!drawerMode) return;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [drawerMode]);

  const tabLoads = useMemo(() => {
    return loads.filter((load) => {
      const reference = referenceDateForTab(load, activeTab);
      return isDateInRange(reference, weekStart, weekEnd);
    });
  }, [activeTab, loads, weekEnd, weekStart]);

  const tabTotals = useMemo(() => {
    return TABS.reduce<Record<OperationalTab, number>>((accumulator, tab) => {
      accumulator[tab] = loads.filter((load) => isDateInRange(referenceDateForTab(load, tab), weekStart, weekEnd)).length;
      return accumulator;
    }, { SCHEDULING: 0, COLLECTION: 0, LOADING: 0, DELIVERY: 0 });
  }, [loads, weekEnd, weekStart]);

  const daySummaries = useMemo<Record<string, CalendarDaySummary>>(() => {
    const raw: Record<string, {
      scheduled: Record<string, CalendarShipperSummary>;
      loading: Record<string, CalendarShipperSummary>;
    }> = {};

    loads.forEach((load) => {
      const scheduledDate = dateKeyFromIso(load.collectionScheduledAt);
      const loadingDate = dateKeyFromIso(load.loadingAt);

      if (scheduledDate && scheduledDate >= weekStart && scheduledDate <= weekEnd) {
        if (!raw[scheduledDate]) raw[scheduledDate] = { scheduled: {}, loading: {} };
        pushShipperSummary(raw[scheduledDate].scheduled, load);
      }
      if (loadingDate && loadingDate >= weekStart && loadingDate <= weekEnd) {
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
  }, [loads, weekEnd, weekStart]);

  const visibleLoads = useMemo(() => {
    return tabLoads
      .filter((load) => !selectedDate || dateKeyFromIso(referenceDateForTab(load, activeTab)) === selectedDate)
      .sort((a, b) => {
        const aDate = referenceDateForTab(a, activeTab);
        const bDate = referenceDateForTab(b, activeTab);
        return new Date(aDate ?? 0).getTime() - new Date(bDate ?? 0).getTime();
      });
  }, [activeTab, selectedDate, tabLoads]);

  const shipperSelectOptions = useMemo(
    () => options.shippers.map((item) => ({ value: String(item.id), label: item.name })),
    [options.shippers],
  );
  const selectedShipper = useMemo(
    () => options.shippers.find((item) => String(item.id) === form.shipperId),
    [form.shipperId, options.shippers],
  );
  const formAccent = selectedShipper?.displayColor ?? selectedLoad?.shipperColor ?? '#3FA66C';

  function changeWeek(delta: number) {
    setSelectedDate(null);
    setWeekAnchor((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + delta * 7);
      return next;
    });
  }

  function goCurrentWeek() {
    setSelectedDate(null);
    setWeekAnchor(new Date());
  }

  function selectTab(tab: OperationalTab) {
    setActiveTab(tab);
    setSelectedDate(null);
  }

  function selectCalendarDate(date: Date) {
    const key = localDateString(date);
    setSelectedDate((current) => current === key ? null : key);
  }

  function openCreate() {
    const date = selectedDate ?? localDateString(weekAnchor);
    setSelectedLoad(null);
    setForm(emptyForm(date, activeTab));
    setDrawerMode('create');
  }

  function openEdit(load: LogisticsLoad) {
    setSelectedLoad(load);
    setForm(formFromLoad(load));
    setDrawerMode('edit');
  }

  function openDuplicate(load: LogisticsLoad) {
    const scheduledDate = toDateInput(load.collectionScheduledAt);
    const duplicated = emptyForm(scheduledDate || localDateString(weekAnchor), 'SCHEDULING');
    setSelectedLoad(null);
    setForm({
      ...duplicated,
      shipperId: String(load.shipperId),
      collectionScheduledAt: scheduledDate,
    });
    setDrawerMode('create');
  }

  function closeDrawer() {
    if (saving) return;
    setDrawerMode(null);
    setSelectedLoad(null);
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
        notifications.success('Carga criada', `${saved.referenceCode} foi adicionada à logística.`);
      } else if (selectedLoad) {
        const originalStage = selectedLoad.stage;
        saved = await logisticsService.update(selectedLoad.id, form);
        if (!selectedLoad.completedAt && originalStage !== form.stage) {
          saved = await logisticsService.move(selectedLoad.id, form.stage, 9999);
        }
        notifications.success('Carga atualizada', `${saved.referenceCode} foi salva com sucesso.`);
      } else {
        return;
      }

      const targetDate = dateKeyFromIso(referenceDateForTab(saved, activeTab) ?? saved.collectionScheduledAt ?? saved.loadingAt ?? saved.deliveryAt);
      if (targetDate) setWeekAnchor(new Date(`${targetDate}T12:00:00`));
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
      message: `A carga ${load.referenceCode} será marcada como finalizada.`,
      details: ['Ela continuará disponível no histórico da logística.'],
      type: 'warning',
      confirmLabel: 'Finalizar carga',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;

    setFinishingId(load.id);
    try {
      await logisticsService.finish(load.id);
      notifications.success('Carga finalizada', `${load.referenceCode} foi finalizada com sucesso.`);
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
      message: `A carga ${load.referenceCode} sairá do Painel e do Calendário.`,
      details: ['A exclusão ficará registrada no banco de dados para auditoria.'],
      type: 'error',
      confirmLabel: 'Excluir carga',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;

    setDeletingId(load.id);
    try {
      await logisticsService.remove(load.id);
      notifications.success('Carga excluída', `${load.referenceCode} foi removida das telas operacionais.`);
      closeDrawer();
      await loadCalendar();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível excluir a carga.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Page>
      <Header>
        <h1>Calendário de cargas</h1>
        <PrimaryButton type="button" onClick={openCreate}><Plus size={17} /> Nova carga</PrimaryButton>
      </Header>

      <Toolbar>
        <WeekControls>
          <SecondaryButton type="button" onClick={goCurrentWeek} title="Voltar para a semana atual">
            Semana {weekNumber}/{weekYear}
          </SecondaryButton>
          <IconButton type="button" onClick={() => changeWeek(-1)} aria-label="Semana anterior"><ChevronLeft size={18} /></IconButton>
          <IconButton type="button" onClick={() => changeWeek(1)} aria-label="Próxima semana"><ChevronRight size={18} /></IconButton>
          <MonthTitle>{formatMonth(weekAnchor)}</MonthTitle>
          <CalendarToggle
            type="button"
            $active={isCalendarOpen}
            onClick={() => setIsCalendarOpen((open) => !open)}
            aria-expanded={isCalendarOpen}
          >
            <CalendarDays size={17} />
            <span>Calendário</span>
            {isCalendarOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </CalendarToggle>
        </WeekControls>

        <OperationalTabs aria-label="Etapa operacional das cargas">
          {TABS.map((tab) => (
            <OperationalTabButton key={tab} type="button" $active={activeTab === tab} onClick={() => selectTab(tab)}>
              <span>{TAB_LABELS[tab]}</span>
              <strong>{tabTotals[tab]}</strong>
            </OperationalTabButton>
          ))}
        </OperationalTabs>

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

      {isCalendarOpen ? (
        <CalendarDropdown>
          <WeekCalendarHeader>
            <div>
              <strong>Datas da semana</strong>
              <WeekRangeText>{formatShortDate(weekCells[0])} até {formatShortDate(weekCells[6])} · Agendamento = campo Agendar coleta · Carregamentos = data de carregamento</WeekRangeText>
            </div>
            {selectedDate ? <SecondaryButton type="button" onClick={() => setSelectedDate(null)}>Ver semana toda</SecondaryButton> : null}
          </WeekCalendarHeader>
          <WeekDatesScroller>
            <WeekDatesGrid>
              {weekCells.map((date, index) => {
                const key = localDateString(date);
                const summary = daySummaries[key] ?? { scheduled: [], loading: [] };
                const scheduledTotal = summary.scheduled.reduce((total, item) => total + item.count, 0);
                const loadingTotal = summary.loading.reduce((total, item) => total + item.count, 0);
                const isToday = key === localDateString(today);
                return (
                  <CalendarDayButton
                    key={key}
                    type="button"
                    $selected={selectedDate === key}
                    $today={isToday}
                    onClick={() => selectCalendarDate(date)}
                    aria-label={`${WEEK_DAYS[index]}, ${formatDate(key)}, ${scheduledTotal} agendamento(s), ${loadingTotal} carregamento(s)`}
                  >
                    <div className="day-heading">
                      <span>{WEEK_DAYS[index]}</span>
                      <strong>{date.getDate()}</strong>
                    </div>
                    <CalendarDayFlow>
                      <CalendarDayFlowColumn>
                        <CalendarDayFlowTitle>Agendamento <strong>{scheduledTotal}</strong></CalendarDayFlowTitle>
                        {summary.scheduled.length === 0 ? <em>—</em> : summary.scheduled.map((item) => (
                          <CalendarShipperCount key={`scheduled-${item.name}`}>
                            <i style={{ background: item.color }} />
                            <span title={item.name}>{item.name}</span>
                            <strong>{item.count}</strong>
                          </CalendarShipperCount>
                        ))}
                      </CalendarDayFlowColumn>
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
                  </CalendarDayButton>
                );
              })}
            </WeekDatesGrid>
          </WeekDatesScroller>
        </CalendarDropdown>
      ) : null}

      <LoadsSection>
        <LoadsHeader>
          <div>
            <h2>{TAB_LABELS[activeTab]}</h2>
            <p>
              {selectedDate
                ? `${formatDate(selectedDate)} · ${TAB_DATE_HINTS[activeTab]} · clique novamente na data para voltar à semana inteira`
                : `Semana ${weekNumber}/${weekYear} · ${formatShortDate(weekCells[0])} até ${formatShortDate(weekCells[6])} · ${TAB_DATE_HINTS[activeTab]}`}
            </p>
          </div>
          <LoadsCount>{visibleLoads.length} carga(s)</LoadsCount>
        </LoadsHeader>

        {loading ? <LoadingState><RefreshCw size={22} /> Carregando cargas...</LoadingState> : (
          <LoadListViewport $scrollable={visibleLoads.length >= 10}>
            <LoadList>
              {visibleLoads.length === 0 ? (
                <EmptyState>Nenhuma carga encontrada para esta etapa e semana.</EmptyState>
              ) : visibleLoads.map((load) => {
                const collectionDate = load.collectionAt;
                return (
                  <LoadCard key={load.id} $accent={load.shipperColor}>
                    <SketchTopBar $accent={load.shipperColor}>
                      <SketchTopItem>
                        <span>Embarcador</span>
                        <strong>{load.shipperName}</strong>
                      </SketchTopItem>
                      <SketchTopItem>
                        <span>Tipo de carga</span>
                        <strong>{load.cargoTypeName || '—'}</strong>
                      </SketchTopItem>
                      <SketchTopItem>
                        <span>Armador</span>
                        <strong>{load.shipownerName || load.shipowner || '—'}</strong>
                      </SketchTopItem>
                      <SketchTopItem>
                        <span>Coleta</span>
                        <strong>{load.collectionTerminal || '—'}</strong>
                      </SketchTopItem>
                      <SketchTopItem>
                        <span>Data / hora coleta</span>
                        <strong>{collectionDate ? formatCompactDateTime(collectionDate) : '---'}</strong>
                      </SketchTopItem>
                      <SketchActions>
                        {load.completedAt ? <FinalizedBadge title="Carga finalizada"><CheckCircle2 size={13} /></FinalizedBadge> : null}
                        <SketchActionButton type="button" onClick={() => openEdit(load)} aria-label="Editar carga" title="Editar carga"><Edit3 size={14} /> Editar</SketchActionButton>
                        <SketchActionButton type="button" onClick={() => openDuplicate(load)} aria-label="Duplicar carga" title="Duplicar carga"><Copy size={14} /> Duplicar</SketchActionButton>
                      </SketchActions>
                    </SketchTopBar>

                    <SketchBodyGrid>
                      <SketchBodyItem>
                        <span>Origem</span>
                        <strong>{load.loadingLocation || '—'}</strong>
                        <strong>{formatCompactDateTime(load.loadingAt)}</strong>
                      </SketchBodyItem>
                      <SketchBodyItem>
                        <span>Destino</span>
                        <strong>{load.deliveryLocation || '—'}</strong>
                        <strong>{formatCompactDateTime(load.deliveryAt)}</strong>
                      </SketchBodyItem>
                      <SketchBodyItem>
                        <span>Booking coleta</span>
                        <strong>{load.collectionBookingNumber || '—'}</strong>
                      </SketchBodyItem>
                      <SketchBodyItem>
                        <span>Booking baixa</span>
                        <strong>{load.bookingNumber || '—'}</strong>
                      </SketchBodyItem>
                      <SketchBodyItem>
                        <span>Plano</span>
                        <strong>{load.plan || '—'}</strong>
                      </SketchBodyItem>
                      <SketchBodyItem>
                        <span>{load.loadMode === 'CARGO' ? 'Carga' : load.loadMode === 'LOAD' ? 'Load' : 'Carga / Load'}</span>
                        {load.loadMode === 'CARGO' ? (
                          <strong>{load.cargoNumber || '—'}</strong>
                        ) : load.loadMode === 'LOAD' && load.loadEntries.length > 0 ? (
                          <SketchLoadEntries>
                            {[...load.loadEntries]
                              .sort((a, b) => (a.status === b.status ? 0 : a.status === 'EMPTY' ? -1 : 1))
                              .map((entry, index) => (
                                <div key={`${entry.status}-${entry.number}-${index}`}>
                                  <small>{entry.status === 'EMPTY' ? 'Vazio' : 'Cheio'}</small>
                                  <strong>{entry.number || '—'}</strong>
                                </div>
                              ))}
                          </SketchLoadEntries>
                        ) : (
                          <strong>—</strong>
                        )}
                      </SketchBodyItem>
                    </SketchBodyGrid>

                    <SketchObservation>
                      <div>
                        <span>Observação</span>
                        <strong>{load.notes || '—'}</strong>
                      </div>
                      <div>
                        <span>Placas</span>
                        <strong>{plateSummary(load)}</strong>
                      </div>
                      <div>
                        <span>Motorista</span>
                        <strong>{driverSummary(load)}</strong>
                      </div>
                    </SketchObservation>
                  </LoadCard>
                );
              })}
            </LoadList>
          </LoadListViewport>
        )}
      </LoadsSection>

      {drawerMode ? (
        <>
          <DrawerBackdrop onClick={closeDrawer} />
          <Drawer role="dialog" aria-modal="true" aria-labelledby="calendar-load-drawer-title">
            <DrawerHeader>
              <div>
                <h2 id="calendar-load-drawer-title">{drawerMode === 'create' ? 'Nova carga' : 'Detalhes da carga'}</h2>
                <p>Os mesmos dados do Painel de Logística, salvos na mesma carga.</p>
              </div>
              <IconButton type="button" onClick={closeDrawer} aria-label="Fechar"><X size={17} /></IconButton>
            </DrawerHeader>

            <DrawerBody>
              <AccentPreview $accent={formAccent}>
                <div><strong>{form.shipowner || 'Armador'}</strong><span>{selectedShipper?.name || 'Selecione o embarcador'}</span></div>
                <span>{STAGE_LABELS[form.stage]}</span>
              </AccentPreview>

              <LogisticsLoadForm
                prefix="calendar-load"
                form={form}
                options={options}
                completed={Boolean(selectedLoad?.completedAt)}
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

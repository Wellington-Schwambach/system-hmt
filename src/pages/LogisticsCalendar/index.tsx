import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import type {
  LogisticsFormData,
  LogisticsLoad,
  LogisticsOptions,
  LogisticsStage,
} from '../Logistic/types';
import {
  AccentPreview,
  ArmadorTitle,
  CalendarPane,
  CardActions,
  CardBody,
  CardMeta,
  CompactCalendarList,
  CompactDateButton,
  DataItem,
  DangerButton,
  DayCell,
  DayCount,
  DetailsHeader,
  DetailsPane,
  Dot,
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  EmptyState,
  Field,
  FilterBox,
  FinalizeButton,
  FinalizedBadge,
  Header,
  IconButton,
  Input,
  LoadCard,
  LoadCardHeader,
  LoadList,
  LoadingState,
  MonthControls,
  MonthGrid,
  MonthTitle,
  Page,
  PrimaryButton,
  SecondaryButton,
  Select,
  ShipperBadge,
  Textarea,
  Toolbar,
  ViewTab,
  ViewTabs,
  WeekDay,
  WeekHeader,
  Workspace,
  FormGrid,
} from './styles';

const EMPTY_OPTIONS: LogisticsOptions = {
  shippers: [],
  drivers: [],
  tractors: [],
  trailers: [],
  activeSets: [],
};

const STAGE_LABELS: Record<LogisticsStage, string> = {
  PROGRAMMING: 'Programação',
  COLLECTION: 'Coleta',
  LOADING: 'Carregamento',
  DELIVERY: 'Baixa / Entrega',
};

const STAGES: LogisticsStage[] = ['PROGRAMMING', 'COLLECTION', 'LOADING', 'DELIVERY'];
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
type CalendarView = 'MONTH' | 'WEEK' | 'LIST';
type DrawerMode = 'create' | 'edit' | null;

function localDateString(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function monthKey(date: Date): string {
  return localDateString(new Date(date.getFullYear(), date.getMonth(), 1)).slice(0, 7);
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
  if (!load.tractorPlate) return '—';
  return load.trailerPlate ? `${load.tractorPlate} / ${load.trailerPlate}` : load.tractorPlate;
}

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function emptyForm(selectedDate: string): LogisticsFormData {
  return {
    referenceCode: '',
    shipmentNumber: '',
    loadNumber: '',
    shipowner: '',
    bookingNumber: '',
    shipperId: '',
    driverId: '',
    driverTwoId: '',
    tractorId: '',
    trailerId: '',
    collectionTerminal: '',
    collectionAt: '',
    loadingLocation: '',
    loadingAt: `${selectedDate}T08:00`,
    deliveryLocation: '',
    deliveryAt: '',
    stage: 'PROGRAMMING',
    notes: '',
  };
}

function formFromLoad(load: LogisticsLoad): LogisticsFormData {
  return {
    referenceCode: load.referenceCode,
    shipmentNumber: load.shipmentNumber ?? '',
    loadNumber: load.loadNumber ?? '',
    shipowner: load.shipowner ?? '',
    bookingNumber: load.bookingNumber ?? '',
    shipperId: String(load.shipperId),
    driverId: load.driverId ? String(load.driverId) : '',
    driverTwoId: load.driverTwoId ? String(load.driverTwoId) : '',
    tractorId: load.tractorId ? String(load.tractorId) : '',
    trailerId: load.trailerId ? String(load.trailerId) : '',
    collectionTerminal: load.collectionTerminal ?? '',
    collectionAt: toLocalInput(load.collectionAt),
    loadingLocation: load.loadingLocation ?? '',
    loadingAt: toLocalInput(load.loadingAt),
    deliveryLocation: load.deliveryLocation ?? '',
    deliveryAt: toLocalInput(load.deliveryAt),
    stage: load.stage,
    notes: load.notes ?? '',
  };
}

function buildMonthCells(monthDate: Date): Date[] {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function buildWeekCells(selectedDate: string): Date[] {
  const selected = new Date(`${selectedDate}T12:00:00`);
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function dayColors(loads: LogisticsLoad[], date: string): string[] {
  const unique = new Set(
    loads
      .filter((load) => dateKeyFromIso(load.loadingAt) === date)
      .map((load) => load.shipperColor || '#3FA66C'),
  );
  return Array.from(unique).slice(0, 3);
}


export function LogisticsCalendar() {
  const notifications = useNotifications();
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => localDateString(today));
  const [shipperFilter, setShipperFilter] = useState('');
  const [view, setView] = useState<CalendarView>('MONTH');
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false);
  const [options, setOptions] = useState<LogisticsOptions>(EMPTY_OPTIONS);
  const [loads, setLoads] = useState<LogisticsLoad[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedLoad, setSelectedLoad] = useState<LogisticsLoad | null>(null);
  const [form, setForm] = useState<LogisticsFormData>(() => emptyForm(localDateString(today)));
  const [saving, setSaving] = useState(false);
  const [finishingId, setFinishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const month = monthKey(visibleMonth);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logisticsService.calendar(month, shipperFilter);
      setLoads(data.loads);
      setCounts(data.counts);
      setSelectedLoad((current) => current ? data.loads.find((item) => item.id === current.id) ?? current : null);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível carregar o calendário de cargas.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setLoading(false);
    }
  }, [month, notifications, shipperFilter]);

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

  const selectedDayLoads = useMemo(
    () => loads
      .filter((load) => dateKeyFromIso(load.loadingAt) === selectedDate)
      .sort((a, b) => new Date(a.loadingAt ?? 0).getTime() - new Date(b.loadingAt ?? 0).getTime()),
    [loads, selectedDate],
  );

  const monthCells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const weekCells = useMemo(() => buildWeekCells(selectedDate), [selectedDate]);
  const datesWithLoads = useMemo(
    () => Object.keys(counts).filter((date) => date.startsWith(month)).sort(),
    [counts, month],
  );

  const shipperSelectOptions = useMemo(
    () => options.shippers.map((item) => ({ value: String(item.id), label: item.name })),
    [options.shippers],
  );
  const driverSelectOptions = useMemo(
    () => options.drivers.map((item) => ({ value: String(item.id), label: item.name, searchText: item.employeeCode })),
    [options.drivers],
  );
  const tractorSelectOptions = useMemo(
    () => options.tractors.map((item) => ({
      value: String(item.id),
      label: `${item.plate}${item.fleetNumber ? ` · Frota ${item.fleetNumber}` : ''}`,
      searchText: `${item.brand} ${item.model}`,
    })),
    [options.tractors],
  );
  const trailerSelectOptions = useMemo(
    () => options.trailers.map((item) => ({
      value: String(item.id),
      label: `${item.plate}${item.fleetNumber ? ` · Frota ${item.fleetNumber}` : ''}`,
      searchText: `${item.brand} ${item.model}`,
    })),
    [options.trailers],
  );
  const selectedShipper = useMemo(
    () => options.shippers.find((item) => String(item.id) === form.shipperId),
    [form.shipperId, options.shippers],
  );
  const formAccent = selectedShipper?.displayColor ?? selectedLoad?.shipperColor ?? '#3FA66C';

  function selectCalendarDate(date: Date) {
    const key = localDateString(date);
    setSelectedDate(key);
    setIsDayPanelOpen(true);
    if (date.getFullYear() !== visibleMonth.getFullYear() || date.getMonth() !== visibleMonth.getMonth()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function selectDateFromList(date: string) {
    setSelectedDate(date);
    setIsDayPanelOpen(true);
  }

  function changeMonth(delta: number) {
    setIsDayPanelOpen(false);
    setVisibleMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
      setSelectedDate(localDateString(next));
      return next;
    });
  }

  function goToday() {
    const now = new Date();
    setIsDayPanelOpen(false);
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(localDateString(now));
  }

  function openCreate() {
    setSelectedLoad(null);
    setForm(emptyForm(selectedDate));
    setDrawerMode('create');
  }

  function openEdit(load: LogisticsLoad) {
    setSelectedLoad(load);
    setForm(formFromLoad(load));
    setDrawerMode('edit');
  }

  function closeDrawer() {
    if (saving) return;
    setDrawerMode(null);
    setSelectedLoad(null);
  }

  function handleTractorChange(value: string) {
    setForm((current) => {
      if (!value) return { ...current, tractorId: '' };
      const activeSet = options.activeSets.find((item) => item.tractorId === Number(value));
      if (!activeSet) return { ...current, tractorId: value };
      return {
        ...current,
        tractorId: value,
        trailerId: activeSet.trailerId ? String(activeSet.trailerId) : current.trailerId,
        driverId: activeSet.driverId ? String(activeSet.driverId) : current.driverId,
        driverTwoId: activeSet.driverTwoId ? String(activeSet.driverTwoId) : current.driverTwoId,
      };
    });
  }

  async function saveLoad() {
    if (!form.shipperId) {
      notifications.warning('Embarcador obrigatório', 'Selecione o embarcador da carga.');
      return;
    }
    if (!form.loadingAt) {
      notifications.warning('Data de carregamento', 'Informe a data e hora do carregamento para a carga aparecer no calendário.');
      return;
    }
    if (form.driverId && form.driverId === form.driverTwoId) {
      notifications.warning('Motoristas duplicados', 'O segundo motorista deve ser diferente do primeiro.');
      return;
    }

    setSaving(true);
    try {
      let saved: LogisticsLoad;
      if (drawerMode === 'create') {
        saved = await logisticsService.create(form);
        notifications.success('Carga criada', `${saved.referenceCode} foi adicionada ao calendário.`);
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

      const savedDate = dateKeyFromIso(saved.loadingAt);
      if (savedDate) {
        setSelectedDate(savedDate);
        const savedDateObj = new Date(`${savedDate}T12:00:00`);
        setVisibleMonth(new Date(savedDateObj.getFullYear(), savedDateObj.getMonth(), 1));
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
      message: `A carga ${load.referenceCode} será marcada como finalizada.`,
      details: ['Ela continuará aparecendo no calendário histórico na data do carregamento.'],
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

  function renderCalendarCell(date: Date, compact = false) {
    const key = localDateString(date);
    const count = counts[key] ?? 0;
    const outside = date.getMonth() !== visibleMonth.getMonth();
    const isToday = key === localDateString(today);
    const colors = dayColors(loads, key);

    if (compact) {
      return (
        <DayCell
          key={key}
          type="button"
          $outside={outside}
          $selected={key === selectedDate}
          $today={isToday}
          onClick={() => selectCalendarDate(date)}
          style={{ minHeight: '8rem' }}
        >
          <span>{date.getDate()}</span>
          {count > 0 ? <DayCount>{colors.map((color) => <Dot key={color} $color={color} />)} {count}</DayCount> : null}
        </DayCell>
      );
    }

    return (
      <DayCell
        key={key}
        type="button"
        $outside={outside}
        $selected={key === selectedDate}
        $today={isToday}
        onClick={() => selectCalendarDate(date)}
      >
        <span>{date.getDate()}</span>
        {count > 0 ? <DayCount>{colors.map((color) => <Dot key={color} $color={color} />)} {count}</DayCount> : null}
      </DayCell>
    );
  }

  return (
    <Page>
      <Header>
        <h1>Calendário de cargas</h1>
        <PrimaryButton type="button" onClick={openCreate}><Plus size={17} /> Nova carga</PrimaryButton>
      </Header>

      <Toolbar>
        <MonthControls>
          <SecondaryButton type="button" onClick={goToday}>Hoje</SecondaryButton>
          <IconButton type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={18} /></IconButton>
          <IconButton type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês"><ChevronRight size={18} /></IconButton>
          <MonthTitle>{formatMonth(visibleMonth)}</MonthTitle>
        </MonthControls>

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

        <ViewTabs aria-label="Visualização do calendário">
          <ViewTab type="button" $active={view === 'MONTH'} onClick={() => setView('MONTH')}>Mês</ViewTab>
          <ViewTab type="button" $active={view === 'WEEK'} onClick={() => setView('WEEK')}>Semana</ViewTab>
          <ViewTab type="button" $active={view === 'LIST'} onClick={() => setView('LIST')}>Lista</ViewTab>
        </ViewTabs>
      </Toolbar>

      <Workspace $detailsOpen={isDayPanelOpen}>
        <CalendarPane $detailsOpen={isDayPanelOpen}>
          {view !== 'LIST' ? <WeekHeader>{WEEK_DAYS.map((day) => <WeekDay key={day}>{day}</WeekDay>)}</WeekHeader> : null}
          {view === 'MONTH' ? <MonthGrid>{monthCells.map((date) => renderCalendarCell(date))}</MonthGrid> : null}
          {view === 'WEEK' ? (
            <MonthGrid style={{ gridTemplateRows: 'minmax(12rem, 1fr)', minHeight: '20rem' }}>
              {weekCells.map((date) => renderCalendarCell(date, true))}
            </MonthGrid>
          ) : null}
          {view === 'LIST' ? (
            <CompactCalendarList>
              {datesWithLoads.length === 0 ? <EmptyState>Nenhuma carga com data de carregamento neste mês.</EmptyState> : datesWithLoads.map((date) => (
                <CompactDateButton key={date} type="button" $active={date === selectedDate} onClick={() => selectDateFromList(date)}>
                  <div><strong>{formatDate(date)}</strong><br /><small>{new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(`${date}T12:00:00`))}</small></div>
                  <strong>{counts[date]} carga(s)</strong>
                </CompactDateButton>
              ))}
            </CompactCalendarList>
          ) : null}
        </CalendarPane>

        {isDayPanelOpen ? (
          <DetailsPane>
            <DetailsHeader>
              <div>
                <h2>Cargas do dia {formatDate(selectedDate)}</h2>
                <p>{selectedDayLoads.length} carga(s) programada(s)</p>
              </div>
              <IconButton type="button" onClick={() => setIsDayPanelOpen(false)} aria-label="Recolher cargas do dia" title="Recolher painel">
                <X size={17} />
              </IconButton>
            </DetailsHeader>

            {loading ? <LoadingState><RefreshCw size={22} /> Carregando calendário...</LoadingState> : (
              <LoadList>
                {selectedDayLoads.length === 0 ? (
                  <EmptyState>Nenhuma carga com carregamento programado para este dia.</EmptyState>
                ) : selectedDayLoads.map((load) => (
                  <LoadCard key={load.id} $accent={load.shipperColor}>
                    <LoadCardHeader $accent={load.shipperColor}>
                      <ShipperBadge $accent={load.shipperColor}>{load.shipperName}</ShipperBadge>
                      <CardActions>
                        <ArmadorTitle>
                          <strong>{load.shipowner || 'Armador não informado'}</strong>
                          {load.completedAt ? <FinalizedBadge><CheckCircle2 size={13} /> Finalizado</FinalizedBadge> : null}
                        </ArmadorTitle>
                        <IconButton type="button" onClick={() => openEdit(load)} aria-label="Editar carga" title="Editar carga"><Edit3 size={15} /></IconButton>
                      </CardActions>
                    </LoadCardHeader>
                    <CardBody>
                      <DataItem><span>Data</span><strong>{formatDate(dateKeyFromIso(load.loadingAt) ?? selectedDate)}</strong></DataItem>
                      <DataItem><span>Remessa</span><strong>{load.shipmentNumber || '—'}</strong></DataItem>
                      <DataItem><span>Load</span><strong>{load.loadNumber || '—'}</strong></DataItem>
                      <DataItem><span>Origem</span><strong>{load.loadingLocation || load.collectionTerminal || '—'}</strong></DataItem>
                      <DataItem><span>Destino</span><strong>{load.deliveryLocation || '—'}</strong></DataItem>
                      <DataItem><span>Armador</span><strong>{load.shipowner || '—'}</strong></DataItem>
                      <DataItem><span>Booking de baixa</span><strong>{load.bookingNumber || '—'}</strong></DataItem>
                    </CardBody>
                    <CardMeta>
                      <DataItem><span>Cavalo / Carreta</span><strong>{plateSummary(load)}</strong></DataItem>
                      <DataItem><span>Motorista(s)</span><strong>{driverSummary(load)}</strong></DataItem>
                    </CardMeta>
                  </LoadCard>
                ))}
              </LoadList>
            )}
          </DetailsPane>
        ) : null}
      </Workspace>

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

              <FormGrid>
                <Field className="full">Referência da carga<Input value={form.referenceCode} onChange={(event) => setForm((current) => ({ ...current, referenceCode: event.target.value.toUpperCase() }))} placeholder="Ex.: número do container / referência" /></Field>
                <Field>Remessa<Input value={form.shipmentNumber} onChange={(event) => setForm((current) => ({ ...current, shipmentNumber: event.target.value }))} placeholder="Em branco" /></Field>
                <Field>Load<Input value={form.loadNumber} onChange={(event) => setForm((current) => ({ ...current, loadNumber: event.target.value }))} placeholder="Em branco" /></Field>
                <Field>Armador<Input value={form.shipowner} onChange={(event) => setForm((current) => ({ ...current, shipowner: event.target.value }))} placeholder="Armador" /></Field>
                <Field>Booking<Input value={form.bookingNumber} onChange={(event) => setForm((current) => ({ ...current, bookingNumber: event.target.value }))} placeholder="Booking" /></Field>
                <Field className="half">Cliente / Embarcador<SearchableSelect id="cal-form-shipper" value={form.shipperId} options={shipperSelectOptions} onChange={(value) => setForm((current) => ({ ...current, shipperId: value }))} placeholder="Selecione" clearable={false} /></Field>
                <Field className="half">Etapa<Select disabled={Boolean(selectedLoad?.completedAt)} value={form.stage} onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as LogisticsStage }))}>{STAGES.map((stage) => <option key={stage} value={stage}>{STAGE_LABELS[stage]}</option>)}</Select></Field>

                <Field className="half">Terminal de coleta<Input value={form.collectionTerminal} onChange={(event) => setForm((current) => ({ ...current, collectionTerminal: event.target.value }))} placeholder="Campo livre" /></Field>
                <Field className="half">Data / hora da coleta<Input type="datetime-local" value={form.collectionAt} onChange={(event) => setForm((current) => ({ ...current, collectionAt: event.target.value }))} /></Field>
                <Field className="half">Carregamento<Input value={form.loadingLocation} onChange={(event) => setForm((current) => ({ ...current, loadingLocation: event.target.value }))} placeholder="Local de carregamento" /></Field>
                <Field className="half">Data / hora do carregamento<Input type="datetime-local" value={form.loadingAt} onChange={(event) => setForm((current) => ({ ...current, loadingAt: event.target.value }))} /></Field>
                <Field className="half">Baixa / Entrega<Input value={form.deliveryLocation} onChange={(event) => setForm((current) => ({ ...current, deliveryLocation: event.target.value }))} placeholder="Local da baixa/entrega" /></Field>
                <Field className="half">Data / hora da baixa / entrega<Input type="datetime-local" value={form.deliveryAt} onChange={(event) => setForm((current) => ({ ...current, deliveryAt: event.target.value }))} /></Field>

                <Field className="half">Placa (cavalo)<SearchableSelect id="cal-form-tractor" value={form.tractorId} options={tractorSelectOptions} onChange={handleTractorChange} placeholder="Selecione o cavalo" /></Field>
                <Field className="half">Carreta<SearchableSelect id="cal-form-trailer" value={form.trailerId} options={trailerSelectOptions} onChange={(value) => setForm((current) => ({ ...current, trailerId: value }))} placeholder="Selecione a carreta" /></Field>
                <Field className="half">Motorista principal<SearchableSelect id="cal-form-driver" value={form.driverId} options={driverSelectOptions} onChange={(value) => setForm((current) => ({ ...current, driverId: value }))} placeholder="Selecione o motorista" /></Field>
                <Field className="half">Segundo motorista<SearchableSelect id="cal-form-driver-two" value={form.driverTwoId} options={driverSelectOptions.filter((item) => item.value !== form.driverId)} onChange={(value) => setForm((current) => ({ ...current, driverTwoId: value }))} placeholder="Opcional" /></Field>
                <Field className="full">Observações<Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Instruções, janela, contato, particularidades da carga..." /></Field>
              </FormGrid>
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

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Factory,
  Hash,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Ship,
  Truck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SearchableSelect } from '../../components/SearchableSelect';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { LOGISTICS_SYNC_STORAGE_KEY, logisticsService } from './services';
import type {
  LogisticsFilters,
  LogisticsFormData,
  LogisticsLoad,
  LogisticsLoadEvent,
  LogisticsOptions,
  LogisticsStage,
} from './types';
import {
  AccentPreview,
  Board,
  BoardScroll,
  CardFooter,
  CardHead,
  CardReference,
  CardRow,
  CardRows,
  Column,
  ColumnBody,
  ColumnHeader,
  CompletedBadge,
  CountBadge,
  DangerButton,
  DetailPanel,
  EmptyColumn,
  Field,
  FilterPanel,
  FinalizeButton,
  FinalizedGrid,
  FinalizedHeader,
  FinalizedSection,
  FormGrid,
  Header,
  HeaderActions,
  HistoryBox,
  HistoryItem,
  HistoryList,
  IconButton,
  Input,
  LoadCard,
  LoadingState,
  MainGrid,
  MobileBackdrop,
  Page,
  PanelActions,
  PanelBody,
  PanelHeader,
  PrimaryButton,
  RangeBadge,
  RouteRow,
  SecondaryButton,
  Select,
  Textarea,
} from './styles';

const EMPTY_OPTIONS: LogisticsOptions = {
  shippers: [],
  drivers: [],
  tractors: [],
  trailers: [],
  activeSets: [],
};

interface StageMeta {
  label: string;
  shortLabel: string;
  accent: string;
  icon: LucideIcon;
}

interface NextActivity {
  label: string;
  location: string | null;
  date: string | null;
}

const STAGES: Record<LogisticsStage, StageMeta> = {
  PROGRAMMING: { label: 'Programação', shortLabel: 'Programação', accent: '#3B82F6', icon: ClipboardList },
  COLLECTION: { label: 'Coleta', shortLabel: 'Coleta', accent: '#22C55E', icon: Truck },
  LOADING: { label: 'Carregamento', shortLabel: 'Carregamento', accent: '#F59E0B', icon: Factory },
  DELIVERY: { label: 'Baixa / Entrega', shortLabel: 'Baixa / Entrega', accent: '#8B5CF6', icon: PackageCheck },
};

const STAGE_ORDER: LogisticsStage[] = ['PROGRAMMING', 'COLLECTION', 'LOADING', 'DELIVERY'];

function localDateString(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function defaultFilters(): LogisticsFilters {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    dateFrom: localDateString(monthStart),
    dateTo: localDateString(monthEnd),
    shipperId: '',
    driverId: '',
    tractorId: '',
    location: '',
    stage: '',
    status: 'PROCESSING',
    search: '',
  };
}

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function emptyForm(stage: LogisticsStage = 'PROGRAMMING'): LogisticsFormData {
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
    loadingAt: '',
    deliveryLocation: '',
    deliveryAt: '',
    stage,
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

function formatDateTime(value: string | null): string {
  if (!value) return 'Data não informada';
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

function nextActivity(load: LogisticsLoad): NextActivity {
  if (load.completedAt) {
    return { label: 'Finalizada', location: load.deliveryLocation, date: load.completedAt };
  }

  if (load.stage === 'PROGRAMMING') {
    if (load.collectionAt) {
      return { label: 'Coleta', location: load.collectionTerminal, date: load.collectionAt };
    }
    if (!load.tractorPlate) {
      return { label: 'Carregamento', location: load.loadingLocation, date: load.loadingAt };
    }
    return { label: 'Coleta', location: load.collectionTerminal, date: null };
  }
  if (load.stage === 'COLLECTION') {
    return { label: 'Carregamento', location: load.loadingLocation, date: load.loadingAt };
  }
  return { label: 'Baixa / Entrega', location: load.deliveryLocation, date: load.deliveryAt };
}

function routeLabel(load: LogisticsLoad): string {
  const points = [load.collectionTerminal, load.loadingLocation, load.deliveryLocation].filter(Boolean) as string[];
  if (points.length === 0) return 'Locais ainda não informados';
  return points.join('  →  ');
}

function eventTitle(event: LogisticsLoadEvent): string {
  if (event.action === 'CREATED') return 'Carga criada';
  if (event.action === 'UPDATED') return 'Dados atualizados';
  if (event.action === 'FINALIZED') return 'Carga finalizada';
  if (event.action === 'STAGE_CHANGED' && event.toStage) return `Movida para ${STAGES[event.toStage].label}`;
  return 'Movimentação';
}

function eventAccent(event: LogisticsLoadEvent): string {
  if (event.action === 'FINALIZED') return '#16A34A';
  if (event.toStage) return STAGES[event.toStage].accent;
  return '#64748B';
}

export function Logistic() {
  const notifications = useNotifications();
  const [options, setOptions] = useState<LogisticsOptions>(EMPTY_OPTIONS);
  const [loads, setLoads] = useState<LogisticsLoad[]>([]);
  const [filters, setFilters] = useState<LogisticsFilters>(() => defaultFilters());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [finishingId, setFinishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LogisticsStage | null>(null);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<LogisticsLoad | null>(null);
  const [form, setForm] = useState<LogisticsFormData>(() => emptyForm());

  const shipperSelectOptions = useMemo(
    () => options.shippers.map((item) => ({ value: String(item.id), label: item.name })),
    [options.shippers],
  );
  const driverSelectOptions = useMemo(
    () => options.drivers.map((item) => ({
      value: String(item.id),
      label: item.name,
      searchText: item.employeeCode,
    })),
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
    [options.shippers, form.shipperId],
  );
  const formAccent = selectedShipper?.displayColor ?? selectedLoad?.shipperColor ?? '#3FA66C';

  const processLoads = useMemo(() => loads.filter((load) => !load.completedAt), [loads]);
  const finalizedLoads = useMemo(() => loads.filter((load) => Boolean(load.completedAt)), [loads]);

  const grouped = useMemo(() => {
    const result: Record<LogisticsStage, LogisticsLoad[]> = {
      PROGRAMMING: [],
      COLLECTION: [],
      LOADING: [],
      DELIVERY: [],
    };
    processLoads.forEach((load) => result[load.stage].push(load));
    STAGE_ORDER.forEach((stage) => result[stage].sort((a, b) => {
      const aDate = nextActivity(a).date;
      const bDate = nextActivity(b).date;
      const aTime = aDate ? new Date(aDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = bDate ? new Date(bDate).getTime() : Number.POSITIVE_INFINITY;
      if (aTime !== bTime) return aTime - bTime;
      return a.id - b.id;
    }));
    return result;
  }, [processLoads]);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logisticsService.list(filters);
      setLoads(data);
      setSelectedLoad((current) => {
        if (!current) return null;
        return data.find((load) => load.id === current.id) ?? current;
      });
    } catch (error) {
      const feedback = getApiErrorFeedback(error);
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setLoading(false);
    }
  }, [filters, notifications]);

  useEffect(() => {
    let active = true;
    void logisticsService.options()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch((error) => {
        if (!active) return;
        const feedback = getApiErrorFeedback(error);
        notifications.error(feedback.title, feedback.message, feedback.details);
      });
    return () => { active = false; };
  }, [notifications]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBoard(), 220);
    return () => window.clearTimeout(timer);
  }, [loadBoard]);

  useEffect(() => {
    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void loadBoard(), 80);
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
  }, [loadBoard]);

  useEffect(() => {
    if (!panelMode) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [panelMode]);

  function openCreate(stage: LogisticsStage = 'PROGRAMMING') {
    setSelectedLoad(null);
    setForm(emptyForm(stage));
    setPanelMode('create');
  }

  function openEdit(load: LogisticsLoad) {
    setSelectedLoad(load);
    setForm(formFromLoad(load));
    setPanelMode('edit');
  }

  function closePanel() {
    setPanelMode(null);
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
      notifications.warning('Embarcador obrigatório', 'Selecione o embarcador para definir também a cor do ticket.');
      return;
    }
    if (form.driverId && form.driverId === form.driverTwoId) {
      notifications.warning('Motoristas duplicados', 'O segundo motorista deve ser diferente do primeiro.');
      return;
    }

    setSaving(true);
    try {
      if (panelMode === 'create') {
        const created = await logisticsService.create(form);
        setSelectedLoad(created);
        setForm(formFromLoad(created));
        setPanelMode('edit');
        notifications.success('Carga criada', `${created.referenceCode} adicionada ao quadro de logística.`);
      } else if (selectedLoad) {
        const originalStage = selectedLoad.stage;
        let updated = await logisticsService.update(selectedLoad.id, form);
        if (!selectedLoad.completedAt && form.stage !== originalStage) {
          const position = grouped[form.stage].filter((item) => item.id !== selectedLoad.id).length;
          updated = await logisticsService.move(selectedLoad.id, form.stage, position);
        }
        setSelectedLoad(updated);
        setForm(formFromLoad(updated));
        notifications.success('Carga atualizada', `${updated.referenceCode} foi salva com sucesso.`);
      }
      await loadBoard();
    } catch (error) {
      const feedback = getApiErrorFeedback(error);
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  function optimisticMove(id: number, stage: LogisticsStage, position: number) {
    setLoads((current) => {
      const moving = current.find((item) => item.id === id && !item.completedAt);
      if (!moving) return current;
      const without = current.filter((item) => item.id !== id);
      const target = without.filter((item) => item.stage === stage && !item.completedAt).sort((a, b) => a.position - b.position);
      const safePosition = Math.min(Math.max(0, position), target.length);
      target.splice(safePosition, 0, { ...moving, stage });
      const stageIds = new Map(target.map((item, index) => [item.id, index]));
      return without
        .map((item) => item.stage === stage && stageIds.has(item.id)
          ? { ...item, position: stageIds.get(item.id) ?? item.position }
          : item)
        .concat([{ ...moving, stage, position: safePosition }]);
    });
  }

  async function moveLoad(id: number, stage: LogisticsStage, position: number) {
    if (movingId !== null) return;
    const current = loads.find((item) => item.id === id);
    if (!current || current.completedAt) return;
    if (current.stage === stage && current.position === position) return;

    setMovingId(id);
    optimisticMove(id, stage, position);
    try {
      const updated = await logisticsService.move(id, stage, position);
      setSelectedLoad((selected) => selected?.id === id ? updated : selected);
      setForm((currentForm) => selectedLoad?.id === id ? { ...currentForm, stage: updated.stage } : currentForm);
      await loadBoard();
    } catch (error) {
      const feedback = getApiErrorFeedback(error);
      notifications.error(feedback.title, feedback.message, feedback.details);
      await loadBoard();
    } finally {
      setMovingId(null);
      setDraggedId(null);
      setDragOverStage(null);
    }
  }

  async function finishLoad(load: LogisticsLoad) {
    if (finishingId !== null || load.stage !== 'DELIVERY' || load.completedAt) return;
    const confirmed = await notifications.confirm({
      title: 'Finalizar carga?',
      message: `A carga ${load.referenceCode} será encerrada e sairá do quadro de cargas em processo.`,
      details: ['Ela continuará disponível no filtro de cargas finalizadas e manterá todo o histórico da operação.'],
      type: 'warning',
      confirmLabel: 'Finalizar carga',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;

    setFinishingId(load.id);
    try {
      const finalized = await logisticsService.finish(load.id);
      notifications.success('Carga finalizada', `${finalized.referenceCode} foi movida para as cargas finalizadas.`);
      if (selectedLoad?.id === load.id && filters.status === 'PROCESSING') closePanel();
      else if (selectedLoad?.id === load.id) {
        setSelectedLoad(finalized);
        setForm(formFromLoad(finalized));
      }
      await loadBoard();
    } catch (error) {
      const feedback = getApiErrorFeedback(error);
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setFinishingId(null);
    }
  }

  async function deleteLoad(load: LogisticsLoad) {
    const confirmed = await notifications.confirm({
      title: 'Excluir carga?',
      message: `A carga ${load.referenceCode} sairá do Painel e do Calendário.`,
      details: ['A exclusão continuará registrada no banco de dados para auditoria.'],
      type: 'error',
      confirmLabel: 'Excluir carga',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;
    setDeletingId(load.id);
    try {
      await logisticsService.remove(load.id);
      notifications.success('Carga excluída', `${load.referenceCode} foi removida das telas operacionais.`);
      closePanel();
      await loadBoard();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível excluir a carga.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setFilters(defaultFilters());
  }

  function renderCard(load: LogisticsLoad, index?: number, stage?: LogisticsStage) {
    const activity = nextActivity(load);
    const finalized = Boolean(load.completedAt);

    return (
      <LoadCard
        key={load.id}
        draggable={!finalized && movingId === null}
        $accent={load.shipperColor}
        $dragging={draggedId === load.id}
        $selected={selectedLoad?.id === load.id}
        $finalized={finalized}
        onDragStart={(event) => {
          if (finalized) return;
          setDraggedId(load.id);
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', String(load.id));
        }}
        onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
        onDragOver={(event) => {
          if (finalized || !stage) return;
          event.preventDefault();
          event.stopPropagation();
          setDragOverStage(stage);
        }}
        onDrop={(event) => {
          if (finalized || !stage || index === undefined) return;
          event.preventDefault();
          event.stopPropagation();
          if (draggedId && draggedId !== load.id) void moveLoad(draggedId, stage, index);
        }}
        onClick={() => openEdit(load)}
      >
        <CardHead>
          <CardReference $accent={load.shipperColor}>
            <strong>{load.referenceCode}</strong>
            <span>{load.shipperName}</span>
          </CardReference>
          {finalized ? <CompletedBadge><CheckCircle2 size={12} /> Finalizada</CompletedBadge> : null}
        </CardHead>

        <CardRows>
          <CardRow><Truck size={14} /><span>{load.tractorPlate || ''}</span></CardRow>
          <CardRow><UserRound size={14} /><span>{[load.driverName, load.driverTwoName].filter(Boolean).join(' + ') || ''}</span></CardRow>
          {load.shipowner ? <CardRow><Ship size={14} /><span>Armador: {load.shipowner}</span></CardRow> : null}
          {load.bookingNumber ? <CardRow><Hash size={14} /><span>Booking: {load.bookingNumber}</span></CardRow> : null}
          <RouteRow><PackageCheck size={14} /><span>{routeLabel(load)}</span></RouteRow>
          <CardRow>
            <CalendarClock size={14} />
            <span><strong>{activity.label}:</strong> {formatDateTime(activity.date)}</span>
          </CardRow>
          {activity.location ? <CardRow><ArrowRight size={14} /><span>{activity.location}</span></CardRow> : null}
        </CardRows>

        {!finalized && load.stage === 'DELIVERY' ? (
          <FinalizeButton
            type="button"
            disabled={finishingId === load.id}
            onClick={(event) => { event.stopPropagation(); void finishLoad(load); }}
          >
            <CheckCircle2 size={15} /> {finishingId === load.id ? 'Finalizando...' : 'Finalizar carga'}
          </FinalizeButton>
        ) : null}

        <CardFooter type="button" onClick={(event) => { event.stopPropagation(); openEdit(load); }}>
          <span>Ver / editar detalhes</span><ArrowRight size={14} />
        </CardFooter>
      </LoadCard>
    );
  }

  const showProcessBoard = filters.status !== 'FINALIZED';
  const showFinalizedGrid = filters.status !== 'PROCESSING';

  return (
    <Page>
      <Header>
        <div>
          <h1>Logística de Cargas</h1>
          <p>Arraste as cargas entre as etapas. O ticket sempre mostra a data da próxima atividade.</p>
        </div>
        <HeaderActions>
          <RangeBadge><CalendarClock size={16} /> Mês atual</RangeBadge>
          <PrimaryButton type="button" onClick={() => openCreate()}><Plus size={17} /> Nova carga</PrimaryButton>
        </HeaderActions>
      </Header>

      <FilterPanel>
        <Field>
          Período inicial
          <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
        </Field>
        <Field>
          Período final
          <Input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
        </Field>
        <Field>
          Situação
          <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as LogisticsFilters['status'] }))}>
            <option value="PROCESSING">Em processo</option>
            <option value="FINALIZED">Finalizadas</option>
            <option value="ALL">Todas</option>
          </Select>
        </Field>
        <Field>
          Etapa
          <Select value={filters.stage} onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value as LogisticsFilters['stage'] }))}>
            <option value="">Todas</option>
            {STAGE_ORDER.map((stage) => <option key={stage} value={stage}>{STAGES[stage].label}</option>)}
          </Select>
        </Field>
        <Field>
          Embarcador
          <SearchableSelect id="log-filter-shipper" value={filters.shipperId} options={shipperSelectOptions} onChange={(value) => setFilters((f) => ({ ...f, shipperId: value }))} placeholder="Todos" />
        </Field>
        <Field>
          Motorista
          <SearchableSelect id="log-filter-driver" value={filters.driverId} options={driverSelectOptions} onChange={(value) => setFilters((f) => ({ ...f, driverId: value }))} placeholder="Todos" />
        </Field>
        <Field>
          Placa (cavalo)
          <SearchableSelect id="log-filter-tractor" value={filters.tractorId} options={tractorSelectOptions} onChange={(value) => setFilters((f) => ({ ...f, tractorId: value }))} placeholder="Todas" />
        </Field>
        <Field>
          Local
          <Input value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} placeholder="Terminal, carregamento ou entrega" />
        </Field>
        <SecondaryButton type="button" onClick={clearFilters}><X size={15} /> Limpar</SecondaryButton>
        <Field style={{ gridColumn: '1 / -1' }}>
          Busca rápida
          <Input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Referência, remessa, load, booking, armador, placa ou embarcador..." />
        </Field>
      </FilterPanel>

      <MainGrid $panelOpen={panelMode !== null}>
        <BoardScroll>
          {loading ? (
            <LoadingState><RefreshCw size={18} className="select-loading-icon" /> Carregando logística...</LoadingState>
          ) : (
            <>
              {showProcessBoard ? (
                <Board>
                  {STAGE_ORDER.map((stage) => {
                    const meta = STAGES[stage];
                    const Icon = meta.icon;
                    const cards = grouped[stage];
                    return (
                      <Column
                        key={stage}
                        $dragOver={dragOverStage === stage}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragOverStage(stage);
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOverStage(null);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedId) void moveLoad(draggedId, stage, cards.length);
                        }}
                      >
                        <ColumnHeader $accent={meta.accent}>
                          <div><Icon size={18} /><strong>{meta.label}</strong><CountBadge $accent={meta.accent}>{cards.length}</CountBadge></div>
                          <IconButton type="button" title={`Nova carga em ${meta.label}`} onClick={() => openCreate(stage)}><Plus size={15} /></IconButton>
                        </ColumnHeader>
                        <ColumnBody $scrollable={cards.length > 5} $mobileScrollable={cards.length > 2}>
                          {cards.length === 0 ? <EmptyColumn>Arraste uma carga para esta etapa</EmptyColumn> : cards.map((load, index) => renderCard(load, index, stage))}
                        </ColumnBody>
                      </Column>
                    );
                  })}
                </Board>
              ) : null}

              {showFinalizedGrid ? (
                <FinalizedSection $withTopMargin={showProcessBoard}>
                  <FinalizedHeader>
                    <div><CheckCircle2 size={18} /><strong>Cargas finalizadas</strong></div>
                    <CountBadge $accent="#16A34A">{finalizedLoads.length}</CountBadge>
                  </FinalizedHeader>
                  {finalizedLoads.length === 0 ? (
                    <EmptyColumn>Nenhuma carga finalizada encontrada para os filtros selecionados.</EmptyColumn>
                  ) : (
                    <FinalizedGrid>{finalizedLoads.map((load) => renderCard(load))}</FinalizedGrid>
                  )}
                </FinalizedSection>
              ) : null}
            </>
          )}
        </BoardScroll>

        {panelMode ? (
          <>
            <MobileBackdrop onClick={closePanel} />
            <DetailPanel>
              <PanelHeader>
                <h2>{panelMode === 'create' ? 'Nova carga' : 'Detalhes da carga'}</h2>
                <IconButton type="button" onClick={closePanel} aria-label="Fechar"><X size={17} /></IconButton>
              </PanelHeader>
              <PanelBody>
                <AccentPreview $accent={formAccent}>
                  <div><strong>{form.referenceCode || 'Nova carga'}</strong><span>{selectedShipper?.name || 'Escolha o embarcador'}</span></div>
                  <span>{selectedLoad?.completedAt ? 'Finalizada' : STAGES[form.stage].shortLabel}</span>
                </AccentPreview>

                <FormGrid>
                  <Field className="full">
                    Referência da carga
                    <Input value={form.referenceCode} onChange={(e) => setForm((f) => ({ ...f, referenceCode: e.target.value.toUpperCase() }))} placeholder="Ex.: número do container / referência da carga" />
                  </Field>
                  <Field>
                    Remessa
                    <Input value={form.shipmentNumber} onChange={(e) => setForm((f) => ({ ...f, shipmentNumber: e.target.value }))} placeholder="Em branco" />
                  </Field>
                  <Field>
                    Load
                    <Input value={form.loadNumber} onChange={(e) => setForm((f) => ({ ...f, loadNumber: e.target.value }))} placeholder="Em branco" />
                  </Field>
                  <Field>
                    Armador
                    <Input value={form.shipowner} onChange={(e) => setForm((f) => ({ ...f, shipowner: e.target.value }))} placeholder="Armador" />
                  </Field>
                  <Field>
                    Booking
                    <Input value={form.bookingNumber} onChange={(e) => setForm((f) => ({ ...f, bookingNumber: e.target.value }))} placeholder="Booking" />
                  </Field>
                  <Field className="half">
                    Cliente / Embarcador
                    <SearchableSelect id="log-form-shipper" value={form.shipperId} options={shipperSelectOptions} onChange={(value) => setForm((f) => ({ ...f, shipperId: value }))} placeholder="Selecione" clearable={false} />
                  </Field>
                  <Field className="half">
                    Etapa
                    <Select disabled={Boolean(selectedLoad?.completedAt)} value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as LogisticsStage }))}>
                      {STAGE_ORDER.map((stage) => <option key={stage} value={stage}>{STAGES[stage].label}</option>)}
                    </Select>
                  </Field>

                  <Field className="half">
                    Terminal de coleta
                    <Input value={form.collectionTerminal} onChange={(e) => setForm((f) => ({ ...f, collectionTerminal: e.target.value }))} placeholder="Campo livre" />
                  </Field>
                  <Field className="half">
                    Data / hora da coleta
                    <Input type="datetime-local" value={form.collectionAt} onChange={(e) => setForm((f) => ({ ...f, collectionAt: e.target.value }))} />
                  </Field>

                  <Field className="half">
                    Carregamento
                    <Input value={form.loadingLocation} onChange={(e) => setForm((f) => ({ ...f, loadingLocation: e.target.value }))} placeholder="Local de carregamento - campo livre" />
                  </Field>
                  <Field className="half">
                    Data / hora do carregamento
                    <Input type="datetime-local" value={form.loadingAt} onChange={(e) => setForm((f) => ({ ...f, loadingAt: e.target.value }))} />
                  </Field>

                  <Field className="half">
                    Baixa / Entrega
                    <Input value={form.deliveryLocation} onChange={(e) => setForm((f) => ({ ...f, deliveryLocation: e.target.value }))} placeholder="Local da baixa/entrega - campo livre" />
                  </Field>
                  <Field className="half">
                    Data / hora da baixa / entrega
                    <Input type="datetime-local" value={form.deliveryAt} onChange={(e) => setForm((f) => ({ ...f, deliveryAt: e.target.value }))} />
                  </Field>

                  <Field className="half">
                    Placa (cavalo)
                    <SearchableSelect id="log-form-tractor" value={form.tractorId} options={tractorSelectOptions} onChange={handleTractorChange} placeholder="Selecione o cavalo" />
                  </Field>
                  <Field className="half">
                    Carreta
                    <SearchableSelect id="log-form-trailer" value={form.trailerId} options={trailerSelectOptions} onChange={(value) => setForm((f) => ({ ...f, trailerId: value }))} placeholder="Selecione a carreta" />
                  </Field>
                  <Field className="half">
                    Motorista principal
                    <SearchableSelect id="log-form-driver" value={form.driverId} options={driverSelectOptions} onChange={(value) => setForm((f) => ({ ...f, driverId: value }))} placeholder="Selecione o motorista" />
                  </Field>
                  <Field className="half">
                    Segundo motorista
                    <SearchableSelect id="log-form-driver-two" value={form.driverTwoId} options={driverSelectOptions.filter((item) => item.value !== form.driverId)} onChange={(value) => setForm((f) => ({ ...f, driverTwoId: value }))} placeholder="Opcional" />
                  </Field>
                  <Field className="full">
                    Observações
                    <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Instruções, janela, contato, particularidades da carga..." />
                  </Field>
                </FormGrid>

                {selectedLoad?.completedAt ? (
                  <AccentPreview $accent="#16A34A">
                    <div><strong>Carga finalizada</strong><span>{selectedLoad.completedByName ? `Por ${selectedLoad.completedByName}` : 'Finalização registrada'}</span></div>
                    <span>{formatDateTime(selectedLoad.completedAt)}</span>
                  </AccentPreview>
                ) : null}

                {panelMode === 'edit' && selectedLoad ? (
                  <HistoryBox>
                    <h3>Histórico da carga</h3>
                    <HistoryList>
                      {selectedLoad.events.length === 0 ? (
                        <HistoryItem $accent="#64748B"><strong>Sem movimentações</strong>Ainda não há histórico registrado.</HistoryItem>
                      ) : selectedLoad.events.map((event) => (
                        <HistoryItem key={event.id} $accent={eventAccent(event)}>
                          <strong>{eventTitle(event)}</strong>
                          {formatDateTime(event.occurredAt)}{event.userName ? ` · ${event.userName}` : ''}
                        </HistoryItem>
                      ))}
                    </HistoryList>
                  </HistoryBox>
                ) : null}
              </PanelBody>
              <PanelActions>
                <SecondaryButton type="button" onClick={closePanel}>Cancelar</SecondaryButton>
                {panelMode === 'edit' && selectedLoad ? <DangerButton type="button" disabled={deletingId === selectedLoad.id} onClick={() => void deleteLoad(selectedLoad)}><Trash2 size={15} /> {deletingId === selectedLoad.id ? 'Excluindo...' : 'Excluir'}</DangerButton> : null}
                {panelMode === 'edit' && selectedLoad && !selectedLoad.completedAt && selectedLoad.stage === 'DELIVERY' ? (
                  <FinalizeButton type="button" disabled={finishingId === selectedLoad.id} onClick={() => void finishLoad(selectedLoad)}>
                    <CheckCircle2 size={16} /> {finishingId === selectedLoad.id ? 'Finalizando...' : 'Finalizar'}
                  </FinalizeButton>
                ) : null}
                <PrimaryButton type="button" disabled={saving} onClick={() => void saveLoad()}>
                  {saving ? <RefreshCw size={16} /> : <Save size={16} />}{saving ? ' Salvando...' : ' Salvar'}
                </PrimaryButton>
              </PanelActions>
            </DetailPanel>
          </>
        ) : null}
      </MainGrid>
    </Page>
  );
}

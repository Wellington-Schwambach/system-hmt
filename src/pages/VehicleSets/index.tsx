import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  History,
  Info,
  Link2,
  RefreshCw,
  Save,
  Search,
  Truck,
  Unlink,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import genericTractorPhoto from '../../assets/vehicle-sets/generic-tractor.png';
import genericTrailerPhoto from '../../assets/vehicle-sets/generic-trailer.png';
import { SearchableSelect } from '../../components/SearchableSelect';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { vehicleSetService } from './services';
import { exportVehicleSetHistoryToExcel, printActiveVehicleSetsPdf } from './utils';
import type {
  VehicleSetDriverOption,
  VehicleSetEventAction,
  VehicleSetEventRecord,
  VehicleSetOptions,
  VehicleSetRecord,
  VehicleSetVehicleOption,
} from './types';
import {
  ActionBadge,
  ActiveBanner,
  ActiveCard,
  ActiveIcon,
  ActiveList,
  ActiveText,
  BottomGrid,
  Builder,
  BuilderActions,
  BuilderLower,
  BuilderTop,
  CloseButton,
  DangerButton,
  DateGrid,
  DateTimeInput,
  DetailList,
  DriverAvatar,
  DriverCard,
  DriverGrid,
  Empty,
  EmptyVehicle,
  Field,
  HeaderStats,
  HistoryFilters,
  InfoHint,
  LinkBridge,
  Modal,
  ModalActions,
  ModalBackdrop,
  ModalBody,
  ModalHeader,
  ModalSection,
  Page,
  PageButton,
  PageHeader,
  PageInfo,
  Pagination,
  Panel,
  PanelHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SecondaryTrailerHeader,
  SecondaryTrailerPanel,
  SelectionBlock,
  StatChip,
  StepNumber,
  StepTitle,
  Summary,
  SummaryCard,
  SummaryRow,
  SummaryTitle,
  Table,
  TableWrap,
  Td,
  Th,
  VehicleCard,
  VehiclePhoto,
  VehicleVisual,
  Workflow,
  WorkflowSection,
} from './styles';

const EMPTY_OPTIONS: VehicleSetOptions = { tractors: [], trailers: [], drivers: [] };
const HISTORY_PAGE_SIZE = 10;

function nowLocalInput(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string | null): string {
  if (!value) return '-';
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

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

function eventLabel(action: VehicleSetEventAction): string {
  return {
    COUPLED: 'Conjunto atrelado',
    DRIVER_ASSIGNED: 'Motorista atrelado',
    DRIVER_CHANGED: 'Motorista alterado',
    DETACHED: 'Conjunto desatrelado',
  }[action];
}

function eventColor(action: VehicleSetEventAction): 'green' | 'blue' | 'orange' | 'red' {
  return {
    COUPLED: 'green',
    DRIVER_ASSIGNED: 'blue',
    DRIVER_CHANGED: 'orange',
    DETACHED: 'red',
  }[action] as 'green' | 'blue' | 'orange' | 'red';
}

function vehicleLabel(vehicle: VehicleSetVehicleOption): string {
  const model = `${vehicle.brand} ${vehicle.model}`.trim();
  return model ? `${vehicle.plate} - ${model}` : vehicle.plate;
}

function VehicleDetails({ vehicle }: { vehicle: VehicleSetVehicleOption }) {
  const trailer = vehicle.type === 'TRAILER';
  return (
    <VehicleCard $selected>
      <VehicleVisual aria-hidden="true">
        <VehiclePhoto
          src={trailer ? genericTrailerPhoto : genericTractorPhoto}
          alt=""
          $trailer={trailer}
          draggable={false}
        />
      </VehicleVisual>
      <DetailList>
        <dt>Placa</dt><dd>{vehicle.plate}</dd>
        <dt>Marca/Modelo</dt><dd>{vehicle.brand} {vehicle.model}</dd>
        <dt>Ano</dt><dd>{vehicle.modelYear || vehicle.manufactureYear}</dd>
        {trailer ? (
          <>
            <dt>Tara</dt><dd>{formatNumber(vehicle.tareKg)} kg</dd>
            <dt>Capacidade</dt><dd>{formatNumber(vehicle.loadCapacityKg)} kg</dd>
          </>
        ) : (
          <>
            <dt>KM atual</dt><dd>{formatNumber(vehicle.currentKm)}</dd>
            <dt>RENAVAM</dt><dd>{vehicle.renavam || '-'}</dd>
          </>
        )}
        <dt>Chassi</dt><dd>{vehicle.chassis || '-'}</dd>
      </DetailList>
    </VehicleCard>
  );
}

function DriverDetails({ driver }: { driver: VehicleSetDriverOption }) {
  return (
    <DriverCard>
      <DriverAvatar><UserRound size={28} /></DriverAvatar>
      <DetailList>
        <dt>Matrícula</dt><dd>{driver.employeeCode}</dd>
        <dt>CPF</dt><dd>{formatCpf(driver.cpf)}</dd>
        <dt>CNH</dt><dd>{driver.cnhNumber || '-'}{driver.cnhCategory ? ` · Cat. ${driver.cnhCategory}` : ''}</dd>
        <dt>Validade CNH</dt><dd>{driver.cnhExpiryDate ? new Date(`${driver.cnhExpiryDate}T12:00:00`).toLocaleDateString('pt-BR') : '-'}</dd>
      </DetailList>
    </DriverCard>
  );
}

export function VehicleSets() {
  const notifications = useNotifications();
  const [options, setOptions] = useState<VehicleSetOptions>(EMPTY_OPTIONS);
  const [sets, setSets] = useState<VehicleSetRecord[]>([]);
  const [history, setHistory] = useState<VehicleSetEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tractorId, setTractorId] = useState('');
  const [trailerId, setTrailerId] = useState('');
  const [trailerTwoId, setTrailerTwoId] = useState('');
  const [showSecondTrailer, setShowSecondTrailer] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [driverTwoId, setDriverTwoId] = useState('');
  const [showSecondDriver, setShowSecondDriver] = useState(false);
  const [coupledAt, setCoupledAt] = useState(nowLocalInput());
  const [driverAssignedAt, setDriverAssignedAt] = useState(nowLocalInput());
  const [driverTwoAssignedAt, setDriverTwoAssignedAt] = useState(nowLocalInput());
  const [activeSearch, setActiveSearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPlateFilter, setHistoryPlateFilter] = useState('');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [managingSet, setManagingSet] = useState<VehicleSetRecord | null>(null);
  const [managedDriverId, setManagedDriverId] = useState('');
  const [managedDriverAt, setManagedDriverAt] = useState(nowLocalInput());
  const [managedSecondDriverId, setManagedSecondDriverId] = useState('');
  const [managedSecondDriverAt, setManagedSecondDriverAt] = useState(nowLocalInput());
  const [detachedAt, setDetachedAt] = useState(nowLocalInput());
  const [managing, setManaging] = useState(false);

  const loadData = useCallback(async (showError = true) => {
    try {
      const [listData, optionData] = await Promise.all([
        vehicleSetService.list(),
        vehicleSetService.options(),
      ]);
      setSets(listData.sets);
      setHistory(listData.history);
      setOptions(optionData);
    } catch (error) {
      if (showError) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os conjuntos.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      }
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    let active = true;

    Promise.all([vehicleSetService.list(), vehicleSetService.options()])
      .then(([listData, optionData]) => {
        if (!active) return;
        setSets(listData.sets);
        setHistory(listData.history);
        setOptions(optionData);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os conjuntos.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notifications]);

  const selectedTractor = useMemo(
    () => options.tractors.find((item) => item.id === Number(tractorId)) ?? null,
    [options.tractors, tractorId],
  );
  const selectedTrailer = useMemo(
    () => options.trailers.find((item) => item.id === Number(trailerId)) ?? null,
    [options.trailers, trailerId],
  );
  const selectedTrailerTwo = useMemo(
    () => options.trailers.find((item) => item.id === Number(trailerTwoId)) ?? null,
    [options.trailers, trailerTwoId],
  );
  const selectedDriver = useMemo(
    () => options.drivers.find((item) => item.id === Number(driverId)) ?? null,
    [driverId, options.drivers],
  );
  const selectedDriverTwo = useMemo(
    () => options.drivers.find((item) => item.id === Number(driverTwoId)) ?? null,
    [driverTwoId, options.drivers],
  );

  const tractorOptions = useMemo(
    () => options.tractors.filter((item) => item.available).map((item) => ({
      value: String(item.id),
      label: vehicleLabel(item),
      searchText: `${item.plate} ${item.fleetNumber ?? ''} ${item.brand} ${item.model}`,
    })),
    [options.tractors],
  );
  const trailerOptions = useMemo(
    () => options.trailers.filter((item) => item.available && item.id !== Number(trailerTwoId)).map((item) => ({
      value: String(item.id),
      label: vehicleLabel(item),
      searchText: `${item.plate} ${item.fleetNumber ?? ''} ${item.brand} ${item.model}`,
    })),
    [options.trailers, trailerTwoId],
  );
  const trailerTwoOptions = useMemo(
    () => options.trailers.filter((item) => item.available && item.id !== Number(trailerId)).map((item) => ({
      value: String(item.id),
      label: vehicleLabel(item),
      searchText: `${item.plate} ${item.fleetNumber ?? ''} ${item.brand} ${item.model}`,
    })),
    [options.trailers, trailerId],
  );
  const driverOptions = useMemo(
    () => options.drivers
      .filter((item) => item.available && item.id !== Number(driverTwoId))
      .map((item) => ({
        value: String(item.id),
        label: item.name,
        searchText: `${item.name} ${item.employeeCode} ${item.cpf} ${item.cnhNumber ?? ''}`,
      })),
    [driverTwoId, options.drivers],
  );
  const driverTwoOptions = useMemo(
    () => options.drivers
      .filter((item) => item.available && item.id !== Number(driverId))
      .map((item) => ({
        value: String(item.id),
        label: item.name,
        searchText: `${item.name} ${item.employeeCode} ${item.cpf} ${item.cnhNumber ?? ''}`,
      })),
    [driverId, options.drivers],
  );

  const ready = Boolean(
    tractorId && driverId && coupledAt && driverAssignedAt &&
    (!trailerTwoId || (trailerId && trailerTwoId !== trailerId)) &&
    (!driverTwoId || (driverTwoAssignedAt && driverTwoId !== driverId)),
  );

  const filteredActiveSets = useMemo(() => {
    const term = activeSearch.trim().toLocaleLowerCase('pt-BR');
    if (!term) return sets;
    return sets.filter((item) =>
      `${item.tractorPlate} ${item.trailerPlate ?? ''} ${item.trailerTwoPlate ?? ''} ${item.driverName} ${item.driverTwoName ?? ''}`.toLocaleLowerCase('pt-BR').includes(term),
    );
  }, [activeSearch, sets]);

  const historyPlateOptions = useMemo(
    () => Array.from(new Set(history.map((event) => event.tractorPlate).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((plate) => ({ value: plate, label: plate, searchText: plate })),
    [history],
  );

  const filteredHistory = useMemo(() => {
    return history.filter((event) => {
      const eventDate = new Date(event.occurredAt);
      const localDate = Number.isNaN(eventDate.getTime())
        ? event.occurredAt.slice(0, 10)
        : `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

      const matchesPlate = !historyPlateFilter || event.tractorPlate === historyPlateFilter;
      const matchesFrom = !historyDateFrom || localDate >= historyDateFrom;
      const matchesTo = !historyDateTo || localDate <= historyDateTo;
      return matchesPlate && matchesFrom && matchesTo;
    });
  }, [history, historyDateFrom, historyDateTo, historyPlateFilter]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, totalHistoryPages);
  const visibleHistory = filteredHistory.slice(
    (safeHistoryPage - 1) * HISTORY_PAGE_SIZE,
    safeHistoryPage * HISTORY_PAGE_SIZE,
  );

  function resetBuilder() {
    setTractorId('');
    setTrailerId('');
    setTrailerTwoId('');
    setShowSecondTrailer(false);
    setDriverId('');
    setDriverTwoId('');
    setShowSecondDriver(false);
    const now = nowLocalInput();
    setCoupledAt(now);
    setDriverAssignedAt(now);
    setDriverTwoAssignedAt(now);
  }

  async function handleSave() {
    if (!ready) return;
    setSaving(true);
    try {
      const result = await vehicleSetService.create({
        tractorId: Number(tractorId),
        trailerId: trailerId ? Number(trailerId) : null,
        trailerTwoId: trailerTwoId ? Number(trailerTwoId) : null,
        driverId: Number(driverId),
        driverTwoId: driverTwoId ? Number(driverTwoId) : null,
        coupledAt,
        driverAssignedAt,
        driverTwoAssignedAt: driverTwoId ? driverTwoAssignedAt : null,
      });
      notifications.success('Conjunto ativo', result.message);
      resetBuilder();
      setHistoryPage(1);
      await loadData(false);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o conjunto.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  function openManager(vehicleSet: VehicleSetRecord) {
    setManagingSet(vehicleSet);
    setManagedDriverId(String(vehicleSet.driverId ?? ''));
    setManagedDriverAt(nowLocalInput());
    setManagedSecondDriverId(String(vehicleSet.driverTwoId ?? ''));
    setManagedSecondDriverAt(nowLocalInput());
    setDetachedAt(nowLocalInput());
  }

  const managerDriverOptions = useMemo(() => {
    if (!managingSet) return [];
    const ids = new Set<number>();
    return options.drivers
      .filter((item) => (item.available || item.id === managingSet.driverId) && item.id !== managingSet.driverTwoId)
      .filter((item) => {
        if (ids.has(item.id)) return false;
        ids.add(item.id);
        return true;
      })
      .map((item) => ({
        value: String(item.id),
        label: item.name,
        searchText: `${item.name} ${item.employeeCode} ${item.cpf}`,
      }));
  }, [managingSet, options.drivers]);

  const managerSecondDriverOptions = useMemo(() => {
    if (!managingSet) return [];
    const ids = new Set<number>();
    return options.drivers
      .filter((item) => (item.available || item.id === managingSet.driverTwoId) && item.id !== managingSet.driverId)
      .filter((item) => {
        if (ids.has(item.id)) return false;
        ids.add(item.id);
        return true;
      })
      .map((item) => ({
        value: String(item.id),
        label: item.name,
        searchText: `${item.name} ${item.employeeCode} ${item.cpf}`,
      }));
  }, [managingSet, options.drivers]);

  async function handleChangeDriver() {
    if (!managingSet || !managedDriverId || Number(managedDriverId) === managingSet.driverId) return;
    setManaging(true);
    try {
      const result = await vehicleSetService.changeDriver(managingSet.id, Number(managedDriverId), managedDriverAt, 'PRIMARY');
      notifications.success('Motorista atualizado', result.message);
      setManagingSet(null);
      setHistoryPage(1);
      await loadData(false);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível alterar o motorista.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setManaging(false);
    }
  }

  async function handleChangeSecondDriver() {
    if (!managingSet || !managedSecondDriverId || Number(managedSecondDriverId) === managingSet.driverTwoId) return;
    setManaging(true);
    try {
      const result = await vehicleSetService.changeDriver(
        managingSet.id,
        Number(managedSecondDriverId),
        managedSecondDriverAt,
        'SECONDARY',
      );
      notifications.success(managingSet.driverTwoId ? 'Segundo motorista atualizado' : 'Segundo motorista vinculado', result.message);
      setManagingSet(null);
      setHistoryPage(1);
      await loadData(false);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível vincular o segundo motorista.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setManaging(false);
    }
  }

  async function handleDetach() {
    if (!managingSet) return;
    const confirmed = await notifications.confirm({
      title: 'Desatrelar conjunto?',
      message: `${managingSet.tractorPlate}${managingSet.trailerPlate ? ` / ${managingSet.trailerPlate}` : ''}${managingSet.trailerTwoPlate ? ` / ${managingSet.trailerTwoPlate}` : ''} será encerrado e os recursos ficarão disponíveis para novos vínculos.`,
      type: 'error',
      confirmLabel: 'Desatrelar conjunto',
    });
    if (!confirmed) return;

    setManaging(true);
    try {
      const result = await vehicleSetService.detach(managingSet.id, detachedAt);
      notifications.success('Conjunto desatrelado', result.message);
      setManagingSet(null);
      setHistoryPage(1);
      await loadData(false);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível desatrelar o conjunto.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setManaging(false);
    }
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <h1>Vínculos de veículos</h1>
          <p>Vincule o cavalo a uma ou duas carretas opcionais e a um ou dois motoristas responsáveis.</p>
        </div>
        <HeaderStats>
          <StatChip><Link2 size={14} /> {sets.length} conjunto(s) ativo(s)</StatChip>
          <StatChip><Truck size={14} /> {tractorOptions.length} cavalo(s) livre(s)</StatChip>
        </HeaderStats>
      </PageHeader>

      <Builder>
        <BuilderTop>
          <SelectionBlock>
            <StepTitle><StepNumber>1</StepNumber>Selecione o cavalo</StepTitle>
            <SearchableSelect
              id="vehicle-set-tractor"
              value={tractorId}
              options={tractorOptions}
              onChange={setTractorId}
              placeholder="Selecione um cavalo disponível"
              searchPlaceholder="Buscar por placa, frota, marca ou modelo..."
              emptyMessage="Nenhum cavalo disponível."
              ariaLabel="Selecionar cavalo"
            />
            {selectedTractor ? <VehicleDetails vehicle={selectedTractor} /> : (
              <VehicleCard $selected={false}><EmptyVehicle>Selecione um cavalo para visualizar os dados do veículo.</EmptyVehicle></VehicleCard>
            )}
          </SelectionBlock>

          <LinkBridge><span><Link2 size={22} /></span></LinkBridge>

          <SelectionBlock>
            <StepTitle><StepNumber>2</StepNumber>Selecione a carreta <small>(opcional)</small></StepTitle>
            <SearchableSelect
              id="vehicle-set-trailer"
              value={trailerId}
              options={trailerOptions}
              onChange={(value) => {
                setTrailerId(value);
                if (!value) {
                  setTrailerTwoId('');
                  setShowSecondTrailer(false);
                }
              }}
              placeholder="Sem carreta / selecione uma carreta disponível"
              searchPlaceholder="Buscar por placa, frota, marca ou modelo..."
              emptyMessage="Nenhuma carreta disponível."
              ariaLabel="Selecionar carreta"
              clearable
            />
            {selectedTrailer ? <VehicleDetails vehicle={selectedTrailer} /> : (
              <VehicleCard $selected={false}><EmptyVehicle>A carreta é opcional. Selecione uma para visualizar tara e capacidade.</EmptyVehicle></VehicleCard>
            )}

            {trailerId && !showSecondTrailer ? (
              <SecondaryTrailerPanel>
                <SecondaryTrailerHeader>
                  <div>
                    <strong>Precisa vincular outra carreta?</strong><br />
                    <small>A segunda carreta é opcional e não precisa de outra imagem.</small>
                  </div>
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setShowSecondTrailer(true);
                      setTrailerTwoId('');
                    }}
                  >
                    <Link2 size={16} /> Adicionar 2ª carreta
                  </SecondaryButton>
                </SecondaryTrailerHeader>
              </SecondaryTrailerPanel>
            ) : null}

            {showSecondTrailer ? (
              <SecondaryTrailerPanel>
                <SecondaryTrailerHeader>
                  <div>
                    <strong>2ª carreta</strong><br />
                    <small>Opcional</small>
                  </div>
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setTrailerTwoId('');
                      setShowSecondTrailer(false);
                    }}
                  >
                    <X size={15} /> Remover
                  </SecondaryButton>
                </SecondaryTrailerHeader>
                <SearchableSelect
                  id="vehicle-set-trailer-two"
                  value={trailerTwoId}
                  options={trailerTwoOptions}
                  onChange={setTrailerTwoId}
                  placeholder="Selecione a segunda carreta"
                  searchPlaceholder="Buscar por placa, frota, marca ou modelo..."
                  emptyMessage="Nenhuma outra carreta disponível."
                  ariaLabel="Selecionar segunda carreta"
                  clearable
                />
                {selectedTrailerTwo ? (
                  <InfoHint><Link2 size={16} />2ª carreta selecionada: <strong>{vehicleLabel(selectedTrailerTwo)}</strong></InfoHint>
                ) : null}
              </SecondaryTrailerPanel>
            ) : null}
          </SelectionBlock>
        </BuilderTop>

        <BuilderLower>
          <Workflow>
            <WorkflowSection>
              <StepTitle><StepNumber>3</StepNumber>Data e horário de início do vínculo</StepTitle>
              <DateGrid>
                <Field>
                  Início do vínculo
                  <DateTimeInput type="datetime-local" value={coupledAt} onChange={(event) => setCoupledAt(event.target.value)} />
                </Field>
                <InfoHint><Info size={16} />Este registro marca quando o vínculo entrou em vigor, com ou sem carreta.</InfoHint>
              </DateGrid>
            </WorkflowSection>

            <WorkflowSection>
              <StepTitle><StepNumber>4</StepNumber>Atrele o motorista ao conjunto</StepTitle>
              <SearchableSelect
                id="vehicle-set-driver"
                value={driverId}
                options={driverOptions}
                onChange={setDriverId}
                placeholder="Selecione um motorista disponível"
                searchPlaceholder="Buscar por nome, matrícula, CPF ou CNH..."
                emptyMessage="Nenhum motorista disponível."
                ariaLabel="Selecionar motorista"
              />
              <DriverGrid>
                {selectedDriver ? <DriverDetails driver={selectedDriver} /> : (
                  <DriverCard>
                    <DriverAvatar><UserRound size={28} /></DriverAvatar>
                    <span>Selecione o motorista para visualizar matrícula, CPF e CNH.</span>
                  </DriverCard>
                )}
                <div style={{ display: 'grid', gap: '0.7rem' }}>
                  <Field>
                    Data e horário do vínculo do motorista
                    <DateTimeInput type="datetime-local" value={driverAssignedAt} onChange={(event) => setDriverAssignedAt(event.target.value)} />
                  </Field>
                  <InfoHint><Info size={16} />Alterações posteriores de motorista também ficam registradas no histórico.</InfoHint>
                </div>
              </DriverGrid>

              {!showSecondDriver ? (
                <div>
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setShowSecondDriver(true);
                      setDriverTwoAssignedAt(nowLocalInput());
                    }}
                  >
                    <UserPlus size={16} /> Vincular 2º motorista
                  </SecondaryButton>
                </div>
              ) : (
                <>
                  <InfoHint><UserPlus size={16} />O segundo motorista ficará vinculado ao mesmo cavalo e também será bloqueado para outros conjuntos ativos.</InfoHint>
                  <SearchableSelect
                    id="vehicle-set-driver-two"
                    value={driverTwoId}
                    options={driverTwoOptions}
                    onChange={setDriverTwoId}
                    placeholder="Selecione o segundo motorista"
                    searchPlaceholder="Buscar por nome, matrícula, CPF ou CNH..."
                    emptyMessage="Nenhum outro motorista disponível."
                    ariaLabel="Selecionar segundo motorista"
                    clearable
                  />
                  <DriverGrid>
                    {selectedDriverTwo ? <DriverDetails driver={selectedDriverTwo} /> : (
                      <DriverCard>
                        <DriverAvatar><UserPlus size={28} /></DriverAvatar>
                        <span>Selecione o segundo motorista para vinculá-lo ao mesmo conjunto.</span>
                      </DriverCard>
                    )}
                    <div style={{ display: 'grid', gap: '0.7rem' }}>
                      <Field>
                        Data e horário do vínculo do segundo motorista
                        <DateTimeInput type="datetime-local" value={driverTwoAssignedAt} onChange={(event) => setDriverTwoAssignedAt(event.target.value)} />
                      </Field>
                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setDriverTwoId('');
                          setShowSecondDriver(false);
                        }}
                      >
                        Manter apenas 1 motorista
                      </SecondaryButton>
                    </div>
                  </DriverGrid>
                </>
              )}
            </WorkflowSection>
          </Workflow>

          <Summary>
            <SummaryTitle>Resumo do conjunto</SummaryTitle>
            <SummaryCard>
              <SummaryRow><Truck size={15} /><span>Cavalo</span><strong>{selectedTractor ? vehicleLabel(selectedTractor) : 'Não selecionado'}</strong></SummaryRow>
              <SummaryRow><Link2 size={15} /><span>Carreta</span><strong>{selectedTrailer ? vehicleLabel(selectedTrailer) : 'Não selecionada'}</strong></SummaryRow>
              <SummaryRow><UserRound size={15} /><span>Motorista 1</span><strong>{selectedDriver?.name ?? 'Não selecionado'}</strong></SummaryRow>
              <SummaryRow><UserPlus size={15} /><span>Motorista 2</span><strong>{selectedDriverTwo?.name ?? 'Não vinculado'}</strong></SummaryRow>
              <SummaryRow><CalendarClock size={15} /><span>Atrelado</span><strong>{coupledAt ? formatDateTime(coupledAt) : '-'}</strong></SummaryRow>
              <SummaryRow><CalendarClock size={15} /><span>Vínculo 1</span><strong>{driverAssignedAt ? formatDateTime(driverAssignedAt) : '-'}</strong></SummaryRow>
              {driverTwoId ? <SummaryRow><CalendarClock size={15} /><span>Vínculo 2</span><strong>{driverTwoAssignedAt ? formatDateTime(driverTwoAssignedAt) : '-'}</strong></SummaryRow> : null}
            </SummaryCard>
            <ActiveBanner $ready={ready}>{ready ? 'Pronto para ativar' : 'Preencha os 4 passos'}</ActiveBanner>
          </Summary>
        </BuilderLower>

        <BuilderActions>
          <SecondaryButton type="button" onClick={resetBuilder}>Limpar</SecondaryButton>
          <PrimaryButton type="button" disabled={!ready || saving} onClick={() => void handleSave()}>
            {saving ? <RefreshCw size={16} /> : <Save size={16} />}
            {saving ? 'Salvando...' : 'Salvar conjunto'}
          </PrimaryButton>
        </BuilderActions>
      </Builder>

      <BottomGrid>
        <Panel>
          <PanelHeader>
            <div><h2>Histórico de alterações do conjunto</h2><span>{filteredHistory.length} de {history.length} evento(s)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <SecondaryButton
                type="button"
                disabled={filteredHistory.length === 0}
                onClick={() => {
                  exportVehicleSetHistoryToExcel(filteredHistory);
                  notifications.success('Excel gerado', `${filteredHistory.length} evento(s) do histórico exportado(s).`);
                }}
                title="Exportar o histórico conforme os filtros atuais"
              >
                <FileSpreadsheet size={16} /> Exportar Excel
              </SecondaryButton>
              <History size={17} />
            </div>
          </PanelHeader>
          <HistoryFilters>
            <Field>
              Cavalo / placa
              <SearchableSelect
                id="vehicle-set-history-tractor"
                value={historyPlateFilter}
                options={historyPlateOptions}
                onChange={(value) => { setHistoryPlateFilter(value); setHistoryPage(1); }}
                placeholder="Todos os cavalos"
                searchPlaceholder="Pesquisar placa..."
                emptyMessage="Nenhuma placa encontrada"
                clearable
              />
            </Field>
            <Field>
              De
              <DateTimeInput
                type="date"
                value={historyDateFrom}
                max={historyDateTo || undefined}
                onChange={(event) => { setHistoryDateFrom(event.target.value); setHistoryPage(1); }}
              />
            </Field>
            <Field>
              Até
              <DateTimeInput
                type="date"
                value={historyDateTo}
                min={historyDateFrom || undefined}
                onChange={(event) => { setHistoryDateTo(event.target.value); setHistoryPage(1); }}
              />
            </Field>
          </HistoryFilters>
          {loading ? <Empty>Carregando histórico...</Empty> : history.length === 0 ? <Empty>Nenhum vínculo registrado ainda.</Empty> : filteredHistory.length === 0 ? <Empty>Nenhum evento encontrado para os filtros selecionados.</Empty> : (
            <>
              <TableWrap>
                <Table>
                  <thead><tr><Th>Data/Hora</Th><Th>Ação</Th><Th>Cavalo</Th><Th>Carreta(s)</Th><Th>Motorista</Th><Th>Usuário</Th></tr></thead>
                  <tbody>
                    {visibleHistory.map((event) => (
                      <tr key={event.id}>
                        <Td>{formatDateTime(event.occurredAt)}</Td>
                        <Td><ActionBadge $type={eventColor(event.action)}>{eventLabel(event.action)}</ActionBadge></Td>
                        <Td>{event.tractorPlate}</Td>
                        <Td>{[event.trailerPlate, event.trailerTwoPlate].filter(Boolean).join(' / ') || '—'}</Td>
                        <Td>{event.driverName || '-'}</Td>
                        <Td>{event.userName || '-'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
              <Pagination>
                <PageButton type="button" disabled={safeHistoryPage <= 1} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}><ChevronLeft size={16} /></PageButton>
                <PageInfo>Página {safeHistoryPage} de {totalHistoryPages}</PageInfo>
                <PageButton type="button" disabled={safeHistoryPage >= totalHistoryPages} onClick={() => setHistoryPage((page) => Math.min(totalHistoryPages, page + 1))}><ChevronRight size={16} /></PageButton>
              </Pagination>
            </>
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            <div><h2>Conjuntos ativos</h2><span>Clique para gerenciar</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <SecondaryButton
                type="button"
                disabled={filteredActiveSets.length === 0}
                onClick={() => {
                  const opened = printActiveVehicleSetsPdf(filteredActiveSets);
                  if (!opened) notifications.error('PDF bloqueado', 'Permita pop-ups para abrir o relatório dos conjuntos ativos.');
                }}
                title="Gerar PDF dos conjuntos ativos exibidos"
              >
                <FileText size={16} /> PDF
              </SecondaryButton>
              <Link2 size={17} />
            </div>
          </PanelHeader>
          <ActiveList $scrollable={filteredActiveSets.length > 6}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 12, opacity: 0.55 }} />
              <SearchInput value={activeSearch} onChange={(event) => setActiveSearch(event.target.value)} placeholder="Buscar conjunto..." style={{ paddingLeft: 32 }} />
            </div>
            {filteredActiveSets.length === 0 ? <Empty>Nenhum conjunto ativo encontrado.</Empty> : filteredActiveSets.map((vehicleSet) => (
              <ActiveCard key={vehicleSet.id} type="button" onClick={() => openManager(vehicleSet)}>
                <ActiveIcon><Link2 size={17} /></ActiveIcon>
                <ActiveText>
                  <strong>{vehicleSet.tractorPlate}{vehicleSet.trailerPlate ? ` / ${vehicleSet.trailerPlate}` : ' / Sem carreta'}{vehicleSet.trailerTwoPlate ? ` / ${vehicleSet.trailerTwoPlate}` : ''}</strong>
                  <span>{vehicleSet.driverName}{vehicleSet.driverTwoName ? ` / ${vehicleSet.driverTwoName}` : ''}</span>
                  <span>Motorista desde {formatDateTime(vehicleSet.driverAssignedAt)}</span>
                </ActiveText>
                <ChevronRight size={17} />
              </ActiveCard>
            ))}
          </ActiveList>
        </Panel>
      </BottomGrid>

      {managingSet ? (
        <ModalBackdrop role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !managing) setManagingSet(null); }}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="manage-set-title">
            <ModalHeader>
              <div>
                <h3 id="manage-set-title">Gerenciar {managingSet.tractorPlate}{managingSet.trailerPlate ? ` / ${managingSet.trailerPlate}` : ' / Sem carreta'}{managingSet.trailerTwoPlate ? ` / ${managingSet.trailerTwoPlate}` : ''}</h3>
                <p>Gerencie os motoristas ou encerre o conjunto mantendo todo o histórico.</p>
              </div>
              <CloseButton type="button" disabled={managing} onClick={() => setManagingSet(null)}><X size={17} /></CloseButton>
            </ModalHeader>
            <ModalBody>
              <SummaryCard>
                <SummaryRow><Truck size={15} /><span>Cavalo</span><strong>{managingSet.tractorLabel}</strong></SummaryRow>
                <SummaryRow><Link2 size={15} /><span>Carreta 1</span><strong>{managingSet.trailerLabel || 'Não vinculada'}</strong></SummaryRow>
                <SummaryRow><Link2 size={15} /><span>Carreta 2</span><strong>{managingSet.trailerTwoLabel || 'Não vinculada'}</strong></SummaryRow>
                <SummaryRow><UserRound size={15} /><span>Motorista 1</span><strong>{managingSet.driverName}</strong></SummaryRow>
                <SummaryRow><UserPlus size={15} /><span>Motorista 2</span><strong>{managingSet.driverTwoName ?? 'Não vinculado'}</strong></SummaryRow>
                <SummaryRow><CalendarClock size={15} /><span>Motorista 1 desde</span><strong>{formatDateTime(managingSet.driverAssignedAt)}</strong></SummaryRow>
                {managingSet.driverTwoAssignedAt ? <SummaryRow><CalendarClock size={15} /><span>Motorista 2 desde</span><strong>{formatDateTime(managingSet.driverTwoAssignedAt)}</strong></SummaryRow> : null}
                <SummaryRow><CalendarClock size={15} /><span>Conjunto desde</span><strong>{formatDateTime(managingSet.coupledAt)}</strong></SummaryRow>
              </SummaryCard>

              <ModalSection>
                <h4>Alterar motorista principal</h4>
                <p>O motorista atual será preservado no histórico e o novo vínculo ficará registrado com data, hora e usuário.</p>
                <SearchableSelect
                  id="manage-set-driver"
                  value={managedDriverId}
                  options={managerDriverOptions}
                  onChange={setManagedDriverId}
                  placeholder="Selecione o novo motorista"
                  searchPlaceholder="Buscar motorista..."
                  ariaLabel="Novo motorista do conjunto"
                  clearable={false}
                />
                <Field>
                  Data e horário da alteração
                  <DateTimeInput type="datetime-local" value={managedDriverAt} onChange={(event) => setManagedDriverAt(event.target.value)} />
                </Field>
                <ModalActions>
                  <PrimaryButton type="button" disabled={managing || !managedDriverId || Number(managedDriverId) === managingSet.driverId} onClick={() => void handleChangeDriver()}>
                    <UserRound size={15} /> Salvar motorista principal
                  </PrimaryButton>
                </ModalActions>
              </ModalSection>

              <ModalSection>
                <h4>{managingSet.driverTwoId ? 'Alterar segundo motorista' : 'Vincular segundo motorista'}</h4>
                <p>{managingSet.driverTwoId ? 'O segundo motorista atual será preservado no histórico.' : 'Adicione outro motorista ao mesmo cavalo. O vínculo ficará registrado com data, hora e usuário.'}</p>
                <SearchableSelect
                  id="manage-set-second-driver"
                  value={managedSecondDriverId}
                  options={managerSecondDriverOptions}
                  onChange={setManagedSecondDriverId}
                  placeholder="Selecione o segundo motorista"
                  searchPlaceholder="Buscar motorista..."
                  ariaLabel="Segundo motorista do conjunto"
                  clearable={false}
                />
                <Field>
                  Data e horário do vínculo
                  <DateTimeInput type="datetime-local" value={managedSecondDriverAt} onChange={(event) => setManagedSecondDriverAt(event.target.value)} />
                </Field>
                <ModalActions>
                  <PrimaryButton
                    type="button"
                    disabled={managing || !managedSecondDriverId || Number(managedSecondDriverId) === managingSet.driverTwoId}
                    onClick={() => void handleChangeSecondDriver()}
                  >
                    <UserPlus size={15} /> {managingSet.driverTwoId ? 'Salvar segundo motorista' : 'Vincular segundo motorista'}
                  </PrimaryButton>
                </ModalActions>
              </ModalSection>

              <ModalSection>
                <h4>Desatrelar conjunto</h4>
                <p>Encerra o conjunto e libera o cavalo, as carretas quando houver e todos os motoristas vinculados. O histórico permanece intacto.</p>
                <Field>
                  Data e horário do desatrelamento
                  <DateTimeInput type="datetime-local" value={detachedAt} onChange={(event) => setDetachedAt(event.target.value)} />
                </Field>
                <ModalActions>
                  <DangerButton type="button" disabled={managing} onClick={() => void handleDetach()}><Unlink size={15} /> Desatrelar conjunto</DangerButton>
                </ModalActions>
              </ModalSection>
            </ModalBody>
          </Modal>
        </ModalBackdrop>
      ) : null}
    </Page>
  );
}

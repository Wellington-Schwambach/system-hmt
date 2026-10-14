import { ChevronDown, ChevronUp, GripVertical, Plus, Settings2, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { useNotifications } from '../../../../contexts/Notifications';
import { getApiErrorFeedback } from '../../../../utils/apiError';
import { logisticsService } from '../../services';
import type { LogisticsFormData, LogisticsFormFieldKey, LogisticsFormOrder, LogisticsFormSectionKey, LogisticsOptions } from '../../types';
import {
  AddButton, Field, Grid, Hint, Input, LoadAddButton, LoadEntriesArea, LoadEntryField, LoadEntryRow, LoadRemoveButton, QuickActions, QuickBackdrop, QuickButton, QuickModal, QuickTitle,
  FormPreferenceBar, FormPreferenceButton, OrderActions, OrderBackdrop, OrderButton, OrderHandle, OrderItem, OrderItemActions, OrderList, OrderModal, OrderModalHeader, OrderSection, OrderSectionActions, OrderSectionDragHandle, OrderSectionHeader, OrderSectionTitle, OrderTitle, Section, Sections, SectionTitle, Select, SelectAction, Textarea,
} from './styles';

type CatalogKey = 'shippers' | 'cargo-types' | 'container-types' | 'shipowners' | 'location-types';
interface QuickState { catalog: CatalogKey; title: string; scope?: 'C' | 'B' }

interface Props {
  prefix: string;
  form: LogisticsFormData;
  options: LogisticsOptions;
  completed?: boolean;
  fixedLoadingDate?: string;
  onChange: (updater: (current: LogisticsFormData) => LogisticsFormData) => void;
  onOptionsChange: (options: LogisticsOptions) => void;
}

const MAX_LOAD_ENTRIES = 10;

const DEFAULT_FORM_ORDER: LogisticsFormOrder = {
  classification: ['shipper', 'cargo_type', 'container_type', 'shipowner', 'collection_booking_number', 'plan', 'load_mode', 'load_identifier'],
  loading: ['loading_location', 'loading_at', 'origin_notes'],
  collection_schedule: ['collection_scheduled_at'],
  collection: ['collection_terminal', 'collection_at', 'collection_location_type'],
  delivery: ['delivery_city', 'delivery_location', 'delivery_at', 'booking_number', 'delivery_location_type', 'destination_notes'],
  container: ['container_number', 'container_tare_kg', 'container_payload_kg', 'shipowner_seal', 'vessel', 'deadline', 'country', 'temperature', 'sif_seal'],
  fleet: ['plate_mode', 'tractor', 'trailer', 'driver', 'driver_two'],
};

const FORM_SECTION_LABELS: Record<LogisticsFormSectionKey, string> = {
  classification: 'Classificação e bookings',
  loading: 'Carregamento',
  collection_schedule: 'Agendar coleta',
  collection: 'Coleta',
  delivery: 'Baixa / Entrega',
  container: 'Container',
  fleet: 'Placas e motoristas',
};

const FORM_FIELD_LABELS: Record<LogisticsFormFieldKey, string> = {
  shipper: 'Embarcador',
  cargo_type: 'Tipo de carga',
  container_type: 'Tipo de container',
  shipowner: 'Armador',
  collection_booking_number: 'Booking coleta',
  plan: 'Plano',
  load_mode: 'Carga / Load',
  load_identifier: 'Identificação da carga / Load',
  loading_location: 'Local do carregamento',
  loading_at: 'Data / hora do carregamento',
  origin_notes: 'Observação da origem',
  collection_scheduled_at: 'Data do agendamento',
  collection_terminal: 'Local coleta',
  collection_at: 'Data / hora coleta',
  collection_location_type: 'Tipo do local de coleta',
  delivery_city: 'Destino',
  delivery_location: 'Local da baixa',
  delivery_at: 'Data / hora da baixa',
  booking_number: 'Booking de baixa',
  delivery_location_type: 'Tipo de local da baixa',
  destination_notes: 'Observação do destino',
  container_number: 'Nº Container',
  container_tare_kg: 'Tara (kg)',
  container_payload_kg: 'Payload (kg)',
  shipowner_seal: 'Lacre Armador',
  vessel: 'Navio',
  deadline: 'Deadline',
  country: 'País',
  temperature: 'Temperatura',
  sif_seal: 'Lacre SIF',
  plate_mode: 'Tipo da frota',
  tractor: 'Cavalo',
  trailer: 'Carreta',
  driver: 'Motorista',
  driver_two: 'Segundo motorista',
};

const FORM_SECTIONS = Object.keys(DEFAULT_FORM_ORDER) as LogisticsFormSectionKey[];
const DEFAULT_SECTION_ORDER: LogisticsFormSectionKey[] = [...FORM_SECTIONS];

function cloneSectionOrder(order: LogisticsFormSectionKey[]): LogisticsFormSectionKey[] {
  return [...order];
}

function normalizeSectionOrder(order?: LogisticsFormSectionKey[] | null): LogisticsFormSectionKey[] {
  const seen = new Set<LogisticsFormSectionKey>();
  const normalized: LogisticsFormSectionKey[] = [];
  (Array.isArray(order) ? order : []).forEach((section) => {
    if (FORM_SECTIONS.includes(section) && !seen.has(section)) {
      normalized.push(section);
      seen.add(section);
    }
  });
  DEFAULT_SECTION_ORDER.forEach((section) => {
    if (!seen.has(section)) normalized.push(section);
  });
  return normalized;
}

function cloneFormOrder(order: LogisticsFormOrder): LogisticsFormOrder {
  return Object.fromEntries(
    FORM_SECTIONS.map((section) => [section, [...order[section]]]),
  ) as LogisticsFormOrder;
}

function normalizeFormOrder(order?: Partial<LogisticsFormOrder> | null): LogisticsFormOrder {
  const normalized = cloneFormOrder(DEFAULT_FORM_ORDER);
  if (!order) return normalized;

  FORM_SECTIONS.forEach((section) => {
    const defaults = DEFAULT_FORM_ORDER[section];
    const allowed = new Set(defaults);
    const seen = new Set<LogisticsFormFieldKey>();
    const received = Array.isArray(order[section]) ? order[section] : [];
    const values: LogisticsFormFieldKey[] = [];

    received.forEach((field) => {
      if (allowed.has(field) && !seen.has(field)) {
        values.push(field);
        seen.add(field);
      }
    });

    defaults.forEach((field) => {
      if (!seen.has(field)) values.push(field);
    });

    normalized[section] = values;
  });

  return normalized;
}

function normalizeContainerNumber(value: string): string {
  const upper = value.toUpperCase();
  let letters = '';
  let numbers = '';

  for (const char of upper) {
    if (letters.length < 4) {
      if (/[A-Z]/.test(char)) letters += char;
      continue;
    }

    if (/[0-9]/.test(char) && numbers.length < 7) numbers += char;
  }

  return `${letters}${numbers}`;
}

function numericDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

const QUICK_CATALOG_MAX_LENGTH: Record<CatalogKey, number> = {
  shippers: 100,
  'cargo-types': 120,
  'container-types': 120,
  shipowners: 140,
  'location-types': 120,
};

export function LogisticsLoadForm({ prefix, form, options, fixedLoadingDate, onChange, onOptionsChange }: Props) {
  const notifications = useNotifications();
  const [quick, setQuick] = useState<QuickState | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);

  const [formOrder, setFormOrder] = useState<LogisticsFormOrder>(() => cloneFormOrder(DEFAULT_FORM_ORDER));
  const [formOrderDraft, setFormOrderDraft] = useState<LogisticsFormOrder>(() => cloneFormOrder(DEFAULT_FORM_ORDER));
  const [sectionOrder, setSectionOrder] = useState<LogisticsFormSectionKey[]>(() => cloneSectionOrder(DEFAULT_SECTION_ORDER));
  const [sectionOrderDraft, setSectionOrderDraft] = useState<LogisticsFormSectionKey[]>(() => cloneSectionOrder(DEFAULT_SECTION_ORDER));
  const [formOrderOpen, setFormOrderOpen] = useState(false);
  const [formOrderSaving, setFormOrderSaving] = useState(false);
  const [draggingField, setDraggingField] = useState<{ section: LogisticsFormSectionKey; field: LogisticsFormFieldKey } | null>(null);
  const [draggingSection, setDraggingSection] = useState<LogisticsFormSectionKey | null>(null);

  useEffect(() => {
    let active = true;

    void logisticsService.formPreferences()
      .then(({ order, sections }) => {
        if (!active) return;
        const normalized = normalizeFormOrder(order);
        const normalizedSections = normalizeSectionOrder(sections);
        setFormOrder(normalized);
        setFormOrderDraft(cloneFormOrder(normalized));
        setSectionOrder(normalizedSections);
        setSectionOrderDraft(cloneSectionOrder(normalizedSections));
      })
      .catch(() => {
        // Mantém a ordem padrão quando a preferência ainda não estiver disponível.
      });

    return () => { active = false; };
  }, []);

  const fieldOrder = (section: LogisticsFormSectionKey, field: LogisticsFormFieldKey, offset = 0): number => {
    const index = formOrder[section].indexOf(field);
    return offset + (index >= 0 ? index : 999) + 1;
  };

  const sectionPosition = (section: LogisticsFormSectionKey): number => {
    const index = sectionOrder.indexOf(section);
    return index >= 0 ? index : 999;
  };

  function openFormOrder() {
    setFormOrderDraft(cloneFormOrder(formOrder));
    setSectionOrderDraft(cloneSectionOrder(sectionOrder));
    setFormOrderOpen(true);
  }

  function moveFormSection(section: LogisticsFormSectionKey, direction: -1 | 1) {
    setSectionOrderDraft((current) => {
      const next = cloneSectionOrder(current);
      const index = next.indexOf(section);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function dropFormSection(targetSection: LogisticsFormSectionKey) {
    if (!draggingSection || draggingSection === targetSection) {
      setDraggingSection(null);
      return;
    }
    setSectionOrderDraft((current) => {
      const next = cloneSectionOrder(current);
      const fromIndex = next.indexOf(draggingSection);
      const targetIndex = next.indexOf(targetSection);
      if (fromIndex < 0 || targetIndex < 0) return current;
      next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, draggingSection);
      return next;
    });
    setDraggingSection(null);
  }

  function moveFormField(section: LogisticsFormSectionKey, field: LogisticsFormFieldKey, direction: -1 | 1) {
    setFormOrderDraft((current) => {
      const next = cloneFormOrder(current);
      const index = next[section].indexOf(field);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next[section].length) return current;
      [next[section][index], next[section][target]] = [next[section][target], next[section][index]];
      return next;
    });
  }

  function dropFormField(section: LogisticsFormSectionKey, targetField: LogisticsFormFieldKey) {
    if (!draggingField || draggingField.section !== section || draggingField.field === targetField) {
      setDraggingField(null);
      return;
    }

    setFormOrderDraft((current) => {
      const next = cloneFormOrder(current);
      const fields = [...next[section]];
      const fromIndex = fields.indexOf(draggingField.field);
      const targetIndex = fields.indexOf(targetField);
      if (fromIndex < 0 || targetIndex < 0) return current;
      fields.splice(fromIndex, 1);
      fields.splice(targetIndex, 0, draggingField.field);
      next[section] = fields;
      return next;
    });
    setDraggingField(null);
  }

  async function saveFormOrder() {
    setFormOrderSaving(true);
    try {
      const saved = await logisticsService.saveFormPreferences(formOrderDraft, sectionOrderDraft);
      const normalized = normalizeFormOrder(saved.order);
      const normalizedSections = normalizeSectionOrder(saved.sections);
      setFormOrder(normalized);
      setFormOrderDraft(cloneFormOrder(normalized));
      setSectionOrder(normalizedSections);
      setSectionOrderDraft(cloneSectionOrder(normalizedSections));
      setFormOrderOpen(false);
      notifications.success('Ordem salva', 'A ordem dos blocos e dos campos foi salva para o seu usuário.');
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar a ordem do formulário.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setFormOrderSaving(false);
    }
  }

  const selectOptions = (items: Array<{ id: number; name: string }>) => items.map((item) => ({ value: String(item.id), label: item.name }));
  const shipperOptions = useMemo(() => selectOptions(options.shippers), [options.shippers]);
  const cargoTypeOptions = useMemo(() => selectOptions(options.cargoTypes), [options.cargoTypes]);
  const containerTypeOptions = useMemo(() => selectOptions(options.containerTypes), [options.containerTypes]);
  const shipownerOptions = useMemo(() => selectOptions(options.shipowners), [options.shipowners]);
  const cityOptions = useMemo(() => options.cities.map((item) => ({ value: String(item.id), label: item.label, searchText: `${item.name} ${item.stateAbbreviation}` })), [options.cities]);
  const collectionTypeOptions = useMemo(() => selectOptions(options.locationTypes.filter((item) => item.scope === 'C')), [options.locationTypes]);
  const deliveryTypeOptions = useMemo(() => selectOptions(options.locationTypes.filter((item) => item.scope === 'B')), [options.locationTypes]);
  const driverOptions = useMemo(() => options.drivers.map((item) => ({ value: String(item.id), label: item.name, searchText: item.employeeCode })), [options.drivers]);
  const tractorOptions = useMemo(() => options.tractors.map((item) => ({ value: String(item.id), label: `${item.plate}${item.fleetNumber ? ` · Frota ${item.fleetNumber}` : ''}`, searchText: `${item.brand} ${item.model}` })), [options.tractors]);
  const trailerOptions = useMemo(() => options.trailers.map((item) => ({ value: String(item.id), label: `${item.plate}${item.fleetNumber ? ` · Frota ${item.fleetNumber}` : ''}`, searchText: `${item.brand} ${item.model}` })), [options.trailers]);

  const patch = (values: Partial<LogisticsFormData>) => onChange((current) => {
    const normalized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.toLocaleUpperCase('pt-BR') : value,
      ]),
    ) as Partial<LogisticsFormData>;
    return { ...current, ...normalized };
  });

  function handleLoadMode(value: LogisticsFormData['loadMode']) {
    onChange((current) => {
      if (value === 'CARGO') {
        return { ...current, loadMode: value, loadStatus: '', loadNumber: '', loadEntries: [] };
      }
      if (value === 'LOAD') {
        const entries = current.loadEntries.length > 0
          ? current.loadEntries
          : [{ status: 'EMPTY' as const, number: '' }];
        return { ...current, loadMode: value, cargoNumber: '', loadEntries: entries };
      }
      return { ...current, loadMode: '', cargoNumber: '', loadStatus: '', loadNumber: '', loadEntries: [] };
    });
  }

  function updateLoadEntry(index: number, values: Partial<LogisticsFormData['loadEntries'][number]>) {
    onChange((current) => ({
      ...current,
      loadEntries: current.loadEntries.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...values, number: typeof values.number === 'string' ? values.number.toLocaleUpperCase('pt-BR') : (values.number ?? entry.number) } : entry),
    }));
  }

  function addLoadEntry() {
    onChange((current) => {
      if (current.loadEntries.length >= MAX_LOAD_ENTRIES) return current;
      const hasEmpty = current.loadEntries.some((entry) => entry.status === 'EMPTY');
      const nextStatus = hasEmpty ? 'FULL' : 'EMPTY';
      return { ...current, loadEntries: [...current.loadEntries, { status: nextStatus, number: '' }] };
    });
  }

  function removeLoadEntry(index: number) {
    onChange((current) => ({
      ...current,
      loadEntries: current.loadEntries.filter((_, entryIndex) => entryIndex !== index),
    }));
  }

  function handlePlateMode(value: LogisticsFormData['plateMode']) {
    onChange((current) => {
      if (value === 'THIRD_PARTY') {
        return {
          ...current,
          plateMode: value,
          tractorId: '',
          trailerId: '',
          driverId: '',
          driverTwoId: '',
        };
      }

      return {
        ...current,
        plateMode: 'FLEET',
        thirdPartyTractorPlate: '',
        thirdPartyTrailerPlate: '',
        thirdPartyDriverName: '',
        thirdPartyDriverTwoName: '',
      };
    });
  }

  function handleTractor(value: string) {
    onChange((current) => {
      if (!value) return { ...current, tractorId: '', trailerId: '', driverId: '', driverTwoId: '' };

      const activeSet = options.activeSets.find((item) => item.tractorId === Number(value));
      if (!activeSet) {
        // Ao trocar para um cavalo sem conjunto ativo, não podemos carregar
        // carreta/motoristas pertencentes ao cavalo selecionado anteriormente.
        return current.tractorId && current.tractorId !== value
          ? { ...current, tractorId: value, trailerId: '', driverId: '', driverTwoId: '' }
          : { ...current, tractorId: value };
      }

      const driverId = activeSet.driverId ? String(activeSet.driverId) : '';
      const driverTwoId = driverId && activeSet.driverTwoId && activeSet.driverTwoId !== activeSet.driverId
        ? String(activeSet.driverTwoId)
        : '';

      return {
        ...current,
        tractorId: value,
        trailerId: activeSet.trailerId ? String(activeSet.trailerId) : '',
        driverId,
        driverTwoId,
      };
    });
  }

  function handleDriver(value: string) {
    onChange((current) => ({
      ...current,
      driverId: value,
      driverTwoId: !value || current.driverTwoId === value ? '' : current.driverTwoId,
    }));
  }

  function closeQuick() {
    if (quickSaving) return;
    setQuick(null);
    setQuickName('');
  }

  function handleCity(fieldId: 'collectionCityId' | 'loadingCityId' | 'deliveryCityId', fieldText: 'collectionTerminal' | 'loadingLocation' | 'deliveryLocation', value: string) {
    const city = options.cities.find((item) => String(item.id) === value);
    patch({ [fieldId]: value, [fieldText]: city?.label ?? '' } as Partial<LogisticsFormData>);
  }

  async function createQuick() {
    if (!quick) return;
    const normalizedName = quickName.trim().toLocaleUpperCase('pt-BR');
    const maxLength = QUICK_CATALOG_MAX_LENGTH[quick.catalog];
    if (normalizedName.length < 2 || normalizedName.length > maxLength) return;
    setQuickSaving(true);
    try {
      const item = await logisticsService.createCatalog(quick.catalog, normalizedName, quick.scope);
      const fresh = await logisticsService.options();
      onOptionsChange(fresh);
      const id = String(item.id);
      if (quick.catalog === 'shippers') patch({ shipperId: id });
      if (quick.catalog === 'cargo-types') patch({ cargoTypeId: id });
      if (quick.catalog === 'container-types') patch({ containerTypeId: id });
      if (quick.catalog === 'shipowners') patch({ shipownerId: id, shipowner: item.name });
      if (quick.catalog === 'location-types' && quick.scope === 'C') patch({ collectionLocationTypeId: id });
      if (quick.catalog === 'location-types' && quick.scope === 'B') patch({ deliveryLocationTypeId: id });
      notifications.success('Cadastro criado', `${item.name} foi cadastrado e selecionado.`);
      setQuick(null);
      setQuickName('');
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível criar o cadastro.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally { setQuickSaving(false); }
  }

  return (
    <>
      <FormPreferenceBar>
        <FormPreferenceButton type="button" onClick={openFormOrder} title="Personalizar a ordem dos blocos e campos deste formulário">
          <Settings2 size={16} /> Organizar formulário
        </FormPreferenceButton>
      </FormPreferenceBar>
      <Sections>
        <Section style={{ order: sectionPosition('classification') }}>
          <SectionTitle>Classificação e bookings</SectionTitle>
          <Grid>
            <Field $span={4} style={{ order: fieldOrder('classification', 'shipper') }}>Embarcador
              <SelectAction><SearchableSelect id={`${prefix}-shipper`} value={form.shipperId} options={shipperOptions} onChange={(value) => patch({ shipperId: value })} placeholder="Selecione" clearable={false} />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'shippers', title: 'Novo embarcador' })} title="Cadastrar embarcador"><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={4} style={{ order: fieldOrder('classification', 'cargo_type') }}>Tipo de carga
              <SelectAction><SearchableSelect id={`${prefix}-cargo-type`} value={form.cargoTypeId} options={cargoTypeOptions} onChange={(value) => patch({ cargoTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'cargo-types', title: 'Novo tipo de carga' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={4} style={{ order: fieldOrder('classification', 'container_type') }}>Tipo de container
              <SelectAction><SearchableSelect id={`${prefix}-container-type`} value={form.containerTypeId} options={containerTypeOptions} onChange={(value) => patch({ containerTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'container-types', title: 'Novo tipo de container' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>

            <Field $span={4} style={{ order: fieldOrder('classification', 'shipowner') }}>Armador
              <SelectAction><SearchableSelect id={`${prefix}-shipowner`} value={form.shipownerId} options={shipownerOptions} onChange={(value) => { const item = options.shipowners.find((row) => String(row.id) === value); patch({ shipownerId: value, shipowner: item?.name ?? '' }); }} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'shipowners', title: 'Novo armador' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={4} style={{ order: fieldOrder('classification', 'collection_booking_number') }}>Booking coleta<Input maxLength={100} value={form.collectionBookingNumber} onChange={(e) => patch({ collectionBookingNumber: e.target.value })} /></Field>
            <Field $span={4} style={{ order: fieldOrder('classification', 'plan') }}>Plano<Input maxLength={120} value={form.plan} onChange={(e) => patch({ plan: e.target.value })} /></Field>

            <Field $span={4} style={{ order: fieldOrder('classification', 'load_mode') }}>Carga / Load
              <Select value={form.loadMode} onChange={(e) => handleLoadMode(e.target.value as LogisticsFormData['loadMode'])}>
                <option value="">Selecione</option><option value="CARGO">Carga</option><option value="LOAD">Load</option>
              </Select>
            </Field>
            {form.loadMode === 'CARGO' ? (
              <Field $span={4} style={{ order: fieldOrder('classification', 'load_identifier') }}>Nº da carga<Input maxLength={100} value={form.cargoNumber} onChange={(e) => patch({ cargoNumber: e.target.value })} placeholder="Informe o número da carga" /></Field>
            ) : null}
            {form.loadMode === 'LOAD' ? (
              <LoadEntriesArea style={{ order: fieldOrder('classification', 'load_identifier') }}>
                {form.loadEntries.map((entry, index) => (
                  <LoadEntryRow key={`${entry.status}-${index}`}>
                    <LoadEntryField>Situação da Load
                      <Select value={entry.status} onChange={(e) => updateLoadEntry(index, { status: e.target.value as 'EMPTY' | 'FULL' })}>
                        <option value="EMPTY">Vazio</option><option value="FULL">Cheio</option>
                      </Select>
                    </LoadEntryField>
                    <LoadEntryField>Nº Load
                      <Input maxLength={100} value={entry.number} onChange={(e) => updateLoadEntry(index, { number: e.target.value })} placeholder="Número da Load" />
                    </LoadEntryField>
                    <LoadRemoveButton type="button" onClick={() => removeLoadEntry(index)} title="Remover Load" aria-label="Remover Load">
                      <Trash2 size={17} />
                    </LoadRemoveButton>
                  </LoadEntryRow>
                ))}
                <LoadAddButton type="button" onClick={addLoadEntry} disabled={form.loadEntries.length >= MAX_LOAD_ENTRIES}><Plus size={16} /> {form.loadEntries.length >= MAX_LOAD_ENTRIES ? 'Limite de Loads atingido' : 'Adicionar outra Load'}</LoadAddButton>
                <Hint>Você pode informar, por exemplo, uma Load vazia e outra cheia na mesma carga.</Hint>
              </LoadEntriesArea>
            ) : null}
            {!form.loadMode ? <Field $span={4} style={{ order: fieldOrder('classification', 'load_identifier') }}><Hint>Selecione Carga ou Load para informar a identificação correspondente.</Hint></Field> : null}

          </Grid>
        </Section>

        <Section style={{ order: sectionPosition('loading') }}>
          <SectionTitle>Carregamento</SectionTitle>
          <Grid>
            <Field $span={6} style={{ order: fieldOrder('loading', 'loading_location') }}>Local do carregamento<SearchableSelect id={`${prefix}-loading-city`} value={form.loadingCityId} options={cityOptions} onChange={(value) => handleCity('loadingCityId', 'loadingLocation', value)} placeholder="Cidade / UF" searchPlaceholder="Buscar cidade ou UF..." /></Field>
            {fixedLoadingDate ? (
              <>
                <Field $span={3} style={{ order: fieldOrder('loading', 'loading_at') }}>Data do carregamento<Input type="date" value={fixedLoadingDate} disabled title="Data definida pelo dia selecionado no calendário" /></Field>
                <Field $span={3} style={{ order: fieldOrder('loading', 'loading_at') }}>Hora do carregamento<Input type="time" value={form.loadingAt.includes('T') ? form.loadingAt.slice(11, 16) : ''} onChange={(e) => patch({ loadingAt: e.target.value ? `${fixedLoadingDate}T${e.target.value}` : fixedLoadingDate })} /></Field>
              </>
            ) : (
              <Field $span={6} style={{ order: fieldOrder('loading', 'loading_at') }}>Data / hora do carregamento<Input type="datetime-local" value={form.loadingAt} onChange={(e) => patch({ loadingAt: e.target.value })} /></Field>
            )}
            <Field $span={12} style={{ order: fieldOrder('loading', 'origin_notes') }}>Observação da origem
              <Textarea maxLength={4000} value={form.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="OBSERVAÇÃO DA ORIGEM..." />
            </Field>
          </Grid>
        </Section>

        <Section style={{ order: sectionPosition('collection_schedule') }}>
          <SectionTitle>Agendar Coleta</SectionTitle>
          <Grid>
            <Field $span={4} style={{ order: fieldOrder('collection_schedule', 'collection_scheduled_at') }}>Data do agendamento<Input type="date" value={form.collectionScheduledAt} onChange={(e) => patch({ collectionScheduledAt: e.target.value })} /></Field>
          </Grid>
        </Section>

        <Section style={{ order: sectionPosition('collection') }}>
          <SectionTitle>Coleta</SectionTitle>
          <Grid>
            <Field $span={4} style={{ order: fieldOrder('collection', 'collection_terminal') }}>Local coleta<Input maxLength={180} value={form.collectionTerminal} onChange={(e) => patch({ collectionTerminal: e.target.value, collectionCityId: '' })} placeholder="Digite o local da coleta" /></Field>
            <Field $span={4} style={{ order: fieldOrder('collection', 'collection_at') }}>Data / Hora Coleta<Input type="datetime-local" value={form.collectionAt} onChange={(e) => patch({ collectionAt: e.target.value })} /></Field>
            <Field $span={4} style={{ order: fieldOrder('collection', 'collection_location_type') }}>Tipo do local
              <SelectAction><SearchableSelect id={`${prefix}-collection-location-type`} value={form.collectionLocationTypeId} options={collectionTypeOptions} onChange={(value) => patch({ collectionLocationTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'location-types', title: 'Novo tipo de local de coleta', scope: 'C' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
          </Grid>
        </Section>

        <Section style={{ order: sectionPosition('delivery') }}>
          <SectionTitle>Baixa / Entrega</SectionTitle>
          <Grid>
            <Field $span={3} style={{ order: fieldOrder('delivery', 'delivery_city') }}>Destino<SearchableSelect id={`${prefix}-delivery-city`} value={form.deliveryCityId} options={cityOptions} onChange={(value) => patch({ deliveryCityId: value })} placeholder="Cidade / UF" searchPlaceholder="Buscar cidade ou UF..." /></Field>
            <Field $span={3} style={{ order: fieldOrder('delivery', 'delivery_location') }}>Local da baixa<Input maxLength={180} value={form.deliveryLocation} onChange={(e) => patch({ deliveryLocation: e.target.value })} placeholder="Digite o local da baixa" /></Field>
            <Field $span={3} style={{ order: fieldOrder('delivery', 'delivery_at') }}>Data / hora<Input type="datetime-local" value={form.deliveryAt} onChange={(e) => patch({ deliveryAt: e.target.value })} /></Field>
            <Field $span={3} style={{ order: fieldOrder('delivery', 'booking_number') }}>Booking de baixa<Input maxLength={100} value={form.bookingNumber} onChange={(e) => patch({ bookingNumber: e.target.value })} /></Field>
            <Field $span={3} style={{ order: fieldOrder('delivery', 'delivery_location_type') }}>Tipo de local
              <SelectAction><SearchableSelect id={`${prefix}-delivery-location-type`} value={form.deliveryLocationTypeId} options={deliveryTypeOptions} onChange={(value) => patch({ deliveryLocationTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'location-types', title: 'Novo tipo de local de baixa', scope: 'B' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={12} style={{ order: fieldOrder('delivery', 'destination_notes') }}>Observação do destino
              <Textarea maxLength={4000} value={form.destinationNotes} onChange={(e) => patch({ destinationNotes: e.target.value })} placeholder="OBSERVAÇÃO DO DESTINO..." />
            </Field>
          </Grid>
        </Section>

        <Section style={{ order: sectionPosition('container') }}>
          <SectionTitle>Container</SectionTitle>
          <Grid>
            <Field $span={3} style={{ order: fieldOrder('container', 'container_number') }}>Nº Container<Input maxLength={11} value={form.containerNumber} onChange={(e) => patch({ containerNumber: normalizeContainerNumber(e.target.value) })} placeholder="ABCD1234567" /></Field>
            <Field $span={2} style={{ order: fieldOrder('container', 'container_tare_kg') }}>Tara (kg)<Input inputMode="numeric" pattern="[0-9]*" maxLength={4} value={form.containerTareKg} onChange={(e) => patch({ containerTareKg: numericDigits(e.target.value, 4) })} /></Field>
            <Field $span={2} style={{ order: fieldOrder('container', 'container_payload_kg') }}>Payload (kg)<Input inputMode="numeric" pattern="[0-9]*" maxLength={5} value={form.containerPayloadKg} onChange={(e) => patch({ containerPayloadKg: numericDigits(e.target.value, 5) })} /></Field>
            <Field $span={5} style={{ order: fieldOrder('container', 'shipowner_seal') }}>Lacre Armador<Input maxLength={100} value={form.shipownerSeal} onChange={(e) => patch({ shipownerSeal: e.target.value })} /></Field>
            <Field $span={3} style={{ order: fieldOrder('container', 'vessel') }}>Navio<Input maxLength={140} value={form.vessel} onChange={(e) => patch({ vessel: e.target.value })} /></Field>
            <Field $span={2} style={{ order: fieldOrder('container', 'deadline') }}>Deadline<Input type="date" value={form.deadline} onChange={(e) => patch({ deadline: e.target.value })} /></Field>
            <Field $span={2} style={{ order: fieldOrder('container', 'country') }}>País<Input maxLength={100} value={form.country} onChange={(e) => patch({ country: e.target.value })} /></Field>
            <Field $span={2} style={{ order: fieldOrder('container', 'temperature') }}>Temperatura<Input maxLength={40} value={form.temperature} onChange={(e) => patch({ temperature: e.target.value })} placeholder="Ex.: -18°C" /></Field>
            <Field $span={3} style={{ order: fieldOrder('container', 'sif_seal') }}>Lacre SIF<Input maxLength={100} value={form.sifSeal} onChange={(e) => patch({ sifSeal: e.target.value })} /></Field>
          </Grid>
        </Section>

        <Section style={{ order: sectionPosition('fleet') }}>
          <SectionTitle>Placas e motoristas</SectionTitle>
          <Grid>
            <Field $span={3} style={{ order: fieldOrder('fleet', 'plate_mode') }}>Tipo da frota
              <Select value={form.plateMode} onChange={(e) => handlePlateMode(e.target.value as LogisticsFormData['plateMode'])}>
                <option value="FLEET">Frota própria</option>
                <option value="THIRD_PARTY">Terceiro</option>
              </Select>
            </Field>
            {form.plateMode === 'THIRD_PARTY' ? (
              <>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'tractor') }}>Placa cavalo (terceiro)<Input maxLength={40} value={form.thirdPartyTractorPlate} onChange={(e) => patch({ thirdPartyTractorPlate: e.target.value.toUpperCase() })} placeholder="Descreva a placa" /></Field>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'trailer') }}>Placa carreta (terceiro)<Input maxLength={40} value={form.thirdPartyTrailerPlate} onChange={(e) => patch({ thirdPartyTrailerPlate: e.target.value.toUpperCase() })} placeholder="Opcional" /></Field>
              </>
            ) : (
              <>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'tractor') }}>Cavalo<SearchableSelect id={`${prefix}-tractor`} value={form.tractorId} options={tractorOptions} onChange={handleTractor} placeholder="Selecione o cavalo" /></Field>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'trailer') }}>Carreta<SearchableSelect id={`${prefix}-trailer`} value={form.trailerId} options={trailerOptions} onChange={(value) => patch({ trailerId: value })} placeholder="Opcional" /></Field>
              </>
            )}
            {form.plateMode === 'THIRD_PARTY' ? (
              <>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'driver') }}>Motorista (terceiro)<Input maxLength={160} value={form.thirdPartyDriverName} onChange={(e) => patch({ thirdPartyDriverName: e.target.value.toLocaleUpperCase('pt-BR') })} placeholder="Digite o nome do motorista" /></Field>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'driver_two') }}>Segundo motorista (terceiro)<Input maxLength={160} value={form.thirdPartyDriverTwoName} onChange={(e) => patch({ thirdPartyDriverTwoName: e.target.value.toLocaleUpperCase('pt-BR') })} placeholder="Opcional" /></Field>
              </>
            ) : (
              <>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'driver') }}>Motorista<SearchableSelect id={`${prefix}-driver`} value={form.driverId} options={driverOptions} onChange={handleDriver} placeholder="Selecione" /></Field>
                <Field $span={3} style={{ order: fieldOrder('fleet', 'driver_two') }}>Segundo motorista<SearchableSelect id={`${prefix}-driver-two`} value={form.driverTwoId} options={driverOptions.filter((item) => item.value !== form.driverId)} onChange={(value) => patch({ driverTwoId: value })} placeholder={form.driverId ? 'Opcional' : 'Selecione o primeiro motorista'} disabled={!form.driverId && !form.driverTwoId} /></Field>
              </>
            )}
          </Grid>
        </Section>

      </Sections>

      {quick ? <QuickBackdrop onMouseDown={closeQuick}>
        <QuickModal onMouseDown={(e) => e.stopPropagation()}>
          <QuickTitle>{quick.title}</QuickTitle>
          <Input autoFocus maxLength={QUICK_CATALOG_MAX_LENGTH[quick.catalog]} value={quickName} onChange={(e) => setQuickName(e.target.value.toLocaleUpperCase('pt-BR'))} placeholder="Nome do cadastro" />
          <Hint>O item será salvo no banco e selecionado automaticamente nesta carga.</Hint>
          <QuickActions>
            <QuickButton type="button" onClick={closeQuick} disabled={quickSaving}>Cancelar</QuickButton>
            <QuickButton type="button" $primary onClick={() => void createQuick()} disabled={quickSaving || quickName.trim().length < 2 || quickName.trim().length > QUICK_CATALOG_MAX_LENGTH[quick.catalog]}>{quickSaving ? 'Salvando...' : 'Cadastrar e selecionar'}</QuickButton>
          </QuickActions>
        </QuickModal>
      </QuickBackdrop> : null}

      {formOrderOpen ? (
        <OrderBackdrop onMouseDown={() => { if (!formOrderSaving) setFormOrderOpen(false); }}>
          <OrderModal onMouseDown={(event) => event.stopPropagation()}>
            <OrderModalHeader>
              <div>
                <OrderTitle>Organizar formulário</OrderTitle>
                <Hint>Arraste os blocos e os campos ou use as setas. Nenhum campo é adicionado ou removido; somente a ordem dos blocos e dos campos é alterada.</Hint>
              </div>
              <OrderButton type="button" onClick={() => setFormOrderOpen(false)} disabled={formOrderSaving} aria-label="Fechar configuração"><X size={18} /></OrderButton>
            </OrderModalHeader>

            {sectionOrderDraft.map((section, sectionIndex) => (
              <OrderSection
                key={section}
                onDragOver={(event) => { if (draggingSection) event.preventDefault(); }}
                onDrop={() => dropFormSection(section)}
              >
                <OrderSectionHeader>
                  <OrderSectionDragHandle
                    draggable={!formOrderSaving}
                    onDragStart={() => { setDraggingField(null); setDraggingSection(section); }}
                    onDragEnd={() => setDraggingSection(null)}
                    title="Arraste para mover o bloco"
                  >
                    <GripVertical size={18} />
                  </OrderSectionDragHandle>
                  <OrderSectionTitle>{FORM_SECTION_LABELS[section]}</OrderSectionTitle>
                  <OrderSectionActions>
                    <OrderButton type="button" onClick={() => moveFormSection(section, -1)} disabled={formOrderSaving || sectionIndex === 0} aria-label={`Mover bloco ${FORM_SECTION_LABELS[section]} para cima`}><ChevronUp size={16} /></OrderButton>
                    <OrderButton type="button" onClick={() => moveFormSection(section, 1)} disabled={formOrderSaving || sectionIndex === sectionOrderDraft.length - 1} aria-label={`Mover bloco ${FORM_SECTION_LABELS[section]} para baixo`}><ChevronDown size={16} /></OrderButton>
                  </OrderSectionActions>
                </OrderSectionHeader>
                <OrderList>
                  {formOrderDraft[section].map((field, index) => (
                    <OrderItem
                      key={`${section}-${field}`}
                      draggable={!formOrderSaving}
                      onDragStart={(event) => { event.stopPropagation(); setDraggingSection(null); setDraggingField({ section, field }); }}
                      onDragEnd={() => setDraggingField(null)}
                      onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); }}
                      onDrop={(event) => { event.stopPropagation(); dropFormField(section, field); }}
                    >
                      <OrderHandle title="Arraste para reordenar"><GripVertical size={17} /></OrderHandle>
                      <span>{FORM_FIELD_LABELS[field]}</span>
                      <OrderItemActions>
                        <OrderButton type="button" onClick={() => moveFormField(section, field, -1)} disabled={formOrderSaving || index === 0} aria-label={`Mover ${FORM_FIELD_LABELS[field]} para cima`}><ChevronUp size={16} /></OrderButton>
                        <OrderButton type="button" onClick={() => moveFormField(section, field, 1)} disabled={formOrderSaving || index === formOrderDraft[section].length - 1} aria-label={`Mover ${FORM_FIELD_LABELS[field]} para baixo`}><ChevronDown size={16} /></OrderButton>
                      </OrderItemActions>
                    </OrderItem>
                  ))}
                </OrderList>
              </OrderSection>
            ))}

            <OrderActions>
              <QuickButton type="button" onClick={() => { setFormOrderDraft(cloneFormOrder(DEFAULT_FORM_ORDER)); setSectionOrderDraft(cloneSectionOrder(DEFAULT_SECTION_ORDER)); }} disabled={formOrderSaving}>Restaurar ordem padrão</QuickButton>
              <QuickButton type="button" onClick={() => setFormOrderOpen(false)} disabled={formOrderSaving}>Cancelar</QuickButton>
              <QuickButton type="button" $primary onClick={() => void saveFormOrder()} disabled={formOrderSaving}>{formOrderSaving ? 'Salvando...' : 'Salvar ordem'}</QuickButton>
            </OrderActions>
          </OrderModal>
        </OrderBackdrop>
      ) : null}
    </>
  );
}

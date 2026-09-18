import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { useNotifications } from '../../../../contexts/Notifications';
import { getApiErrorFeedback } from '../../../../utils/apiError';
import { logisticsService } from '../../services';
import type { LogisticsFormData, LogisticsOptions } from '../../types';
import {
  AddButton, Field, Grid, Hint, Input, LoadAddButton, LoadEntriesArea, LoadEntryField, LoadEntryRow, LoadRemoveButton, QuickActions, QuickBackdrop, QuickButton, QuickModal, QuickTitle,
  GroupTitle, Section, Sections, SectionTitle, Select, SelectAction, Textarea,
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
        };
      }

      return {
        ...current,
        plateMode: 'FLEET',
        thirdPartyTractorPlate: '',
        thirdPartyTrailerPlate: '',
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
      <Sections>
        <Section>
          <SectionTitle>Classificação e bookings</SectionTitle>
          <Grid>
            <Field $span={4}>Embarcador
              <SelectAction><SearchableSelect id={`${prefix}-shipper`} value={form.shipperId} options={shipperOptions} onChange={(value) => patch({ shipperId: value })} placeholder="Selecione" clearable={false} />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'shippers', title: 'Novo embarcador' })} title="Cadastrar embarcador"><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={4}>Tipo de carga
              <SelectAction><SearchableSelect id={`${prefix}-cargo-type`} value={form.cargoTypeId} options={cargoTypeOptions} onChange={(value) => patch({ cargoTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'cargo-types', title: 'Novo tipo de carga' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={4}>Tipo de container
              <SelectAction><SearchableSelect id={`${prefix}-container-type`} value={form.containerTypeId} options={containerTypeOptions} onChange={(value) => patch({ containerTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'container-types', title: 'Novo tipo de container' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>

            <Field $span={4}>Armador
              <SelectAction><SearchableSelect id={`${prefix}-shipowner`} value={form.shipownerId} options={shipownerOptions} onChange={(value) => { const item = options.shipowners.find((row) => String(row.id) === value); patch({ shipownerId: value, shipowner: item?.name ?? '' }); }} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'shipowners', title: 'Novo armador' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={4}>Booking coleta<Input maxLength={100} value={form.collectionBookingNumber} onChange={(e) => patch({ collectionBookingNumber: e.target.value })} /></Field>
            <Field $span={4}>Plano<Input maxLength={120} value={form.plan} onChange={(e) => patch({ plan: e.target.value })} /></Field>

            <Field $span={4}>Carga / Load
              <Select value={form.loadMode} onChange={(e) => handleLoadMode(e.target.value as LogisticsFormData['loadMode'])}>
                <option value="">Selecione</option><option value="CARGO">Carga</option><option value="LOAD">Load</option>
              </Select>
            </Field>
            {form.loadMode === 'CARGO' ? (
              <Field $span={4}>Nº da carga<Input maxLength={100} value={form.cargoNumber} onChange={(e) => patch({ cargoNumber: e.target.value })} placeholder="Informe o número da carga" /></Field>
            ) : null}
            {form.loadMode === 'LOAD' ? (
              <LoadEntriesArea>
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
            {!form.loadMode ? <Field $span={4}><Hint>Selecione Carga ou Load para informar a identificação correspondente.</Hint></Field> : null}

            <GroupTitle>Carregamento</GroupTitle>
            <Field $span={6}>Local do carregamento<SearchableSelect id={`${prefix}-loading-city`} value={form.loadingCityId} options={cityOptions} onChange={(value) => handleCity('loadingCityId', 'loadingLocation', value)} placeholder="Cidade / UF" searchPlaceholder="Buscar cidade ou UF..." /></Field>
            {fixedLoadingDate ? (
              <>
                <Field $span={3}>Data do carregamento<Input type="date" value={fixedLoadingDate} disabled title="Data definida pelo dia selecionado no calendário" /></Field>
                <Field $span={3}>Hora do carregamento<Input type="time" value={form.loadingAt.includes('T') ? form.loadingAt.slice(11, 16) : ''} onChange={(e) => patch({ loadingAt: e.target.value ? `${fixedLoadingDate}T${e.target.value}` : fixedLoadingDate })} /></Field>
              </>
            ) : (
              <Field $span={6}>Data / hora do carregamento<Input type="datetime-local" value={form.loadingAt} onChange={(e) => patch({ loadingAt: e.target.value })} /></Field>
            )}
            <Field $span={12}>Observação da origem
              <Textarea maxLength={4000} value={form.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="OBSERVAÇÃO DA ORIGEM..." />
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Coleta</SectionTitle>
          <Grid>
            <Field $span={4}>Local coleta<Input maxLength={180} value={form.collectionTerminal} onChange={(e) => patch({ collectionTerminal: e.target.value, collectionCityId: '' })} placeholder="Digite o local da coleta" /></Field>
            <Field $span={4}>Data / Hora Coleta<Input type="datetime-local" value={form.collectionAt} onChange={(e) => patch({ collectionAt: e.target.value })} /></Field>
            <Field $span={4}>Tipo do local
              <SelectAction><SearchableSelect id={`${prefix}-collection-location-type`} value={form.collectionLocationTypeId} options={collectionTypeOptions} onChange={(value) => patch({ collectionLocationTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'location-types', title: 'Novo tipo de local de coleta', scope: 'C' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Baixa / Entrega</SectionTitle>
          <Grid>
            <Field $span={3}>Destino<SearchableSelect id={`${prefix}-delivery-city`} value={form.deliveryCityId} options={cityOptions} onChange={(value) => patch({ deliveryCityId: value })} placeholder="Cidade / UF" searchPlaceholder="Buscar cidade ou UF..." /></Field>
            <Field $span={3}>Local da baixa<Input maxLength={180} value={form.deliveryLocation} onChange={(e) => patch({ deliveryLocation: e.target.value })} placeholder="Digite o local da baixa" /></Field>
            <Field $span={3}>Data / hora<Input type="datetime-local" value={form.deliveryAt} onChange={(e) => patch({ deliveryAt: e.target.value })} /></Field>
            <Field $span={3}>Booking de baixa<Input maxLength={100} value={form.bookingNumber} onChange={(e) => patch({ bookingNumber: e.target.value })} /></Field>
            <Field $span={3}>Tipo de local
              <SelectAction><SearchableSelect id={`${prefix}-delivery-location-type`} value={form.deliveryLocationTypeId} options={deliveryTypeOptions} onChange={(value) => patch({ deliveryLocationTypeId: value })} placeholder="Selecione" />
                <AddButton type="button" onClick={() => setQuick({ catalog: 'location-types', title: 'Novo tipo de local de baixa', scope: 'B' })}><Plus size={18}/></AddButton></SelectAction>
            </Field>
            <Field $span={12}>Observação do destino
              <Textarea maxLength={4000} value={form.destinationNotes} onChange={(e) => patch({ destinationNotes: e.target.value })} placeholder="OBSERVAÇÃO DO DESTINO..." />
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Container</SectionTitle>
          <Grid>
            <Field $span={3}>Nº Container<Input maxLength={11} value={form.containerNumber} onChange={(e) => patch({ containerNumber: normalizeContainerNumber(e.target.value) })} placeholder="ABCD1234567" /></Field>
            <Field $span={2}>Tara (kg)<Input inputMode="numeric" pattern="[0-9]*" maxLength={4} value={form.containerTareKg} onChange={(e) => patch({ containerTareKg: numericDigits(e.target.value, 4) })} /></Field>
            <Field $span={2}>Payload (kg)<Input inputMode="numeric" pattern="[0-9]*" maxLength={5} value={form.containerPayloadKg} onChange={(e) => patch({ containerPayloadKg: numericDigits(e.target.value, 5) })} /></Field>
            <Field $span={5}>Lacre Armador<Input maxLength={100} value={form.shipownerSeal} onChange={(e) => patch({ shipownerSeal: e.target.value })} /></Field>
            <Field $span={3}>Navio<Input maxLength={140} value={form.vessel} onChange={(e) => patch({ vessel: e.target.value })} /></Field>
            <Field $span={2}>Deadline<Input type="date" value={form.deadline} onChange={(e) => patch({ deadline: e.target.value })} /></Field>
            <Field $span={2}>País<Input maxLength={100} value={form.country} onChange={(e) => patch({ country: e.target.value })} /></Field>
            <Field $span={2}>Temperatura<Input maxLength={40} value={form.temperature} onChange={(e) => patch({ temperature: e.target.value })} placeholder="Ex.: -18°C" /></Field>
            <Field $span={3}>Lacre SIF<Input maxLength={100} value={form.sifSeal} onChange={(e) => patch({ sifSeal: e.target.value })} /></Field>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Placas e motoristas</SectionTitle>
          <Grid>
            <Field $span={3}>Tipo das placas
              <Select value={form.plateMode} onChange={(e) => handlePlateMode(e.target.value as LogisticsFormData['plateMode'])}>
                <option value="FLEET">Frota própria</option>
                <option value="THIRD_PARTY">Terceiro</option>
              </Select>
            </Field>
            {form.plateMode === 'THIRD_PARTY' ? (
              <>
                <Field $span={3}>Placa cavalo (terceiro)<Input maxLength={40} value={form.thirdPartyTractorPlate} onChange={(e) => patch({ thirdPartyTractorPlate: e.target.value.toUpperCase() })} placeholder="Descreva a placa" /></Field>
                <Field $span={3}>Placa carreta (terceiro)<Input maxLength={40} value={form.thirdPartyTrailerPlate} onChange={(e) => patch({ thirdPartyTrailerPlate: e.target.value.toUpperCase() })} placeholder="Opcional" /></Field>
              </>
            ) : (
              <>
                <Field $span={3}>Cavalo<SearchableSelect id={`${prefix}-tractor`} value={form.tractorId} options={tractorOptions} onChange={handleTractor} placeholder="Selecione o cavalo" /></Field>
                <Field $span={3}>Carreta<SearchableSelect id={`${prefix}-trailer`} value={form.trailerId} options={trailerOptions} onChange={(value) => patch({ trailerId: value })} placeholder="Opcional" /></Field>
              </>
            )}
            <Field $span={3}>Motorista<SearchableSelect id={`${prefix}-driver`} value={form.driverId} options={driverOptions} onChange={handleDriver} placeholder="Selecione" /></Field>
            <Field $span={3}>Segundo motorista<SearchableSelect id={`${prefix}-driver-two`} value={form.driverTwoId} options={driverOptions.filter((item) => item.value !== form.driverId)} onChange={(value) => patch({ driverTwoId: value })} placeholder={form.driverId ? 'Opcional' : 'Selecione o primeiro motorista'} disabled={!form.driverId && !form.driverTwoId} /></Field>
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
    </>
  );
}

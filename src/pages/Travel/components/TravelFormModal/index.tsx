import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  FilePlus2,
  FileText,
  MapPin,
  Plus,
  Save,
  Trash2,
  Truck,
  UserRound,
  X,
} from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import { CTE_TYPE_OPTIONS, INITIAL_TRAVEL_FORM, createEmptyCte } from '../../constants';
import type {
  TravelCteFormData,
  TravelFormData,
  TravelRecordWithMetrics,
} from '../../types';
import { ShipperQuickModal } from '../ShipperQuickModal';
import { formatCurrency, parseDecimalInput } from '../../utils';
import type { TravelFormModalProps } from './types';
import {
  Actions,
  AddCteButton,
  CalculationItem,
  CalculationLabel,
  CalculationPreview,
  CalculationValue,
  CancelButton,
  CloseButton,
  CteCard,
  CteCardHeader,
  CteCardTitle,
  CteGrid,
  CteList,
  CteRemoveButton,
  CteTotalBox,
  CteTotalLabel,
  CteTotalValue,
  ErrorMessage,
  Field,
  FieldGrid,
  FieldIcon,
  Form,
  FormSection,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionHeaderRow,
  FormSectionTitle,
  Header,
  InlineAddButton,
  InlineInfo,
  Input,
  Label,
  Modal,
  Overlay,
  RoutePreview,
  RoutePreviewArrow,
  RoutePreviewPoint,
  SaveButton,
  Select,
  SelectControl,
  SelectWithAction,
  Subtitle,
  Title,
} from './styles';

function moneyValue(value: number): string {
  return value ? value.toFixed(2).replace('.', ',') : '';
}

function getInitialFormData(editingRecord?: TravelRecordWithMetrics | null): TravelFormData {
  if (!editingRecord) {
    return {
      ...INITIAL_TRAVEL_FORM,
      date: new Date().toISOString().slice(0, 10),
      ctes: [createEmptyCte()],
    };
  }

  const ctes =
    editingRecord.ctes.length > 0
      ? editingRecord.ctes.map((cte) => ({
          key: `cte-${cte.id || Math.random().toString(36).slice(2)}`,
          cteType: cte.cteType,
          cteNumber: cte.cteNumber,
          cteSeries: cte.cteSeries,
          netFreight: moneyValue(cte.netFreight),
          insuranceAmount: moneyValue(cte.insuranceAmount),
          tollAmount: moneyValue(cte.tollAmount),
          icmsAmount: moneyValue(cte.icmsAmount),
        }))
      : [createEmptyCte()];

  return {
    date: editingRecord.date,
    receivedDate: editingRecord.receivedDate,
    origin: editingRecord.origin,
    destination: editingRecord.destination,
    shipperId: editingRecord.shipperId ? String(editingRecord.shipperId) : '',
    operationType: editingRecord.operationType,
    vehicleId: editingRecord.vehicleId ? String(editingRecord.vehicleId) : '',
    driverOneId: editingRecord.driverOneId ? String(editingRecord.driverOneId) : '',
    driverTwoId: editingRecord.driverTwoId ? String(editingRecord.driverTwoId) : '',
    thirdPartyName: editingRecord.thirdPartyName,
    thirdPartyPlate: editingRecord.thirdPartyPlate,
    thirdPartyPayoutAmount: moneyValue(editingRecord.thirdPartyPayoutAmount),
    detachedTrailerId: editingRecord.detachedTrailerId
      ? String(editingRecord.detachedTrailerId)
      : '',
    ctes,
  };
}

function calculateCte(cte: TravelCteFormData) {
  const netFreight = parseDecimalInput(cte.netFreight);
  const insurance = parseDecimalInput(cte.insuranceAmount);
  const toll = parseDecimalInput(cte.tollAmount);
  const icms = parseDecimalInput(cte.icmsAmount);

  return {
    netFreight,
    insurance,
    toll,
    icms,
    grossFreight: netFreight + insurance + toll + icms,
  };
}

export function TravelFormModal({
  isOpen,
  editingRecord,
  options,
  optionsLoading,
  saving,
  creatingShipper,
  onClose,
  onSubmit,
  onCreateShipper,
}: TravelFormModalProps) {
  const [formData, setFormData] = useState<TravelFormData>(() => getInitialFormData(editingRecord));
  const [formError, setFormError] = useState('');
  const [isShipperModalOpen, setIsShipperModalOpen] = useState(false);

  const tractors = useMemo(() => {
    if (
      editingRecord?.vehicleId &&
      !options.tractors.some((vehicle) => vehicle.id === editingRecord.vehicleId)
    ) {
      return [
        ...options.tractors,
        {
          id: editingRecord.vehicleId,
          plate: editingRecord.plate,
          fleetNumber: '',
        },
      ];
    }
    return options.tractors;
  }, [editingRecord, options.tractors]);

  const trailers = useMemo(() => {
    if (
      editingRecord?.detachedTrailerId &&
      !options.trailers.some((vehicle) => vehicle.id === editingRecord.detachedTrailerId)
    ) {
      return [
        ...options.trailers,
        {
          id: editingRecord.detachedTrailerId,
          plate: editingRecord.detachedTrailerPlate,
          fleetNumber: '',
        },
      ];
    }
    return options.trailers;
  }, [editingRecord, options.trailers]);

  const drivers = useMemo(() => {
    const current = [...options.drivers];
    if (
      editingRecord?.driverOneId &&
      !current.some((driver) => driver.id === editingRecord.driverOneId)
    ) {
      current.push({
        id: editingRecord.driverOneId,
        employeeCode: '',
        name: editingRecord.driverOne,
      });
    }
    if (
      editingRecord?.driverTwoId &&
      !current.some((driver) => driver.id === editingRecord.driverTwoId)
    ) {
      current.push({
        id: editingRecord.driverTwoId,
        employeeCode: '',
        name: editingRecord.driverTwo,
      });
    }
    return current;
  }, [editingRecord, options.drivers]);

  const shippers = useMemo(() => {
    const current = [...options.shippers];
    if (
      editingRecord?.shipperId &&
      !current.some((shipper) => shipper.id === editingRecord.shipperId)
    ) {
      current.push({
        id: editingRecord.shipperId,
        name: editingRecord.shipper,
        status: 'ACTIVE',
      });
    }
    return current.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [editingRecord, options.shippers]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, saving]);

  const calculations = useMemo(() => {
    const totals = formData.ctes.reduce(
      (current, cte) => {
        const values = calculateCte(cte);
        return {
          netFreight: current.netFreight + values.netFreight,
          insurance: current.insurance + values.insurance,
          toll: current.toll + values.toll,
          icms: current.icms + values.icms,
          grossFreight: current.grossFreight + values.grossFreight,
        };
      },
      {
        netFreight: 0,
        insurance: 0,
        toll: 0,
        icms: 0,
        grossFreight: 0,
      },
    );

    return {
      ...totals,
      complements: totals.insurance + totals.toll + totals.icms,
      thirdPartyPayout: parseDecimalInput(formData.thirdPartyPayoutAmount),
    };
  }, [formData]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingRecord);
  const isThirdParty = formData.operationType === 'THIRD_PARTY';

  function handleChange(field: Exclude<keyof TravelFormData, 'ctes'>, value: string) {
    setFormError('');
    setFormData((current) => {
      if (field === 'operationType') {
        return {
          ...current,
          operationType: value as TravelFormData['operationType'],
          vehicleId: value === 'FLEET' ? current.vehicleId : '',
          driverOneId: value === 'FLEET' ? current.driverOneId : '',
          driverTwoId: value === 'FLEET' ? current.driverTwoId : '',
          thirdPartyName: value === 'THIRD_PARTY' ? current.thirdPartyName : '',
          thirdPartyPlate: value === 'THIRD_PARTY' ? current.thirdPartyPlate : '',
          thirdPartyPayoutAmount: value === 'THIRD_PARTY' ? current.thirdPartyPayoutAmount : '',
        };
      }

      return { ...current, [field]: value };
    });
  }

  function handleCteChange(
    key: string,
    field: Exclude<keyof TravelCteFormData, 'key'>,
    value: string,
  ) {
    setFormError('');
    setFormData((current) => ({
      ...current,
      ctes: current.ctes.map((cte) =>
        cte.key === key
          ? {
              ...cte,
              [field]: field === 'cteType' ? (value as TravelCteFormData['cteType']) : value,
            }
          : cte,
      ),
    }));
  }

  function addCte() {
    setFormError('');
    setFormData((current) => ({
      ...current,
      ctes: [...current.ctes, createEmptyCte()],
    }));
  }

  function removeCte(key: string) {
    setFormError('');
    setFormData((current) => {
      if (current.ctes.length <= 1) return current;
      return {
        ...current,
        ctes: current.ctes.filter((cte) => cte.key !== key),
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!formData.date) {
      setFormError('Informe a data da viagem.');
      return;
    }

    if (!formData.shipperId) {
      setFormError('Selecione o embarcador.');
      return;
    }

    if (!formData.origin.trim() || !formData.destination.trim()) {
      setFormError('Informe a origem e o destino da viagem.');
      return;
    }

    if (formData.ctes.length === 0) {
      setFormError('Adicione pelo menos um CT-e à viagem.');
      return;
    }

    const invalidCte = formData.ctes.find(
      (cte) =>
        !cte.cteNumber.trim() ||
        !cte.cteSeries.trim() ||
        !cte.netFreight.trim() ||
        !Number.isFinite(parseDecimalInput(cte.netFreight)),
    );
    if (invalidCte) {
      setFormError('Informe o número, a série e o frete líquido de todos os CT-es adicionados.');
      return;
    }

    if (isThirdParty) {
      const normalizedPlate = formData.thirdPartyPlate.trim().toLocaleUpperCase('pt-BR');
      const plateIsValid = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(normalizedPlate);

      if (!formData.thirdPartyName.trim()) {
        setFormError('Informe o nome ou a razão social do terceiro contratado.');
        return;
      }

      if (!plateIsValid) {
        setFormError('Informe uma placa válida para o terceiro, como ABC1D23 ou ABC1234.');
        return;
      }

      if (!formData.thirdPartyPayoutAmount.trim()) {
        setFormError('Informe o valor de repasse ao terceiro.');
        return;
      }

      if (calculations.thirdPartyPayout < 0) {
        setFormError('O valor de repasse ao terceiro não pode ser negativo.');
        return;
      }
    } else {
      if (!formData.vehicleId) {
        setFormError('Selecione o cavalo utilizado na viagem.');
        return;
      }

      if (!formData.driverOneId) {
        setFormError('Selecione pelo menos um motorista para a viagem da frota.');
        return;
      }

      if (formData.driverTwoId && formData.driverTwoId === formData.driverOneId) {
        setFormError('O segundo motorista deve ser diferente do primeiro.');
        return;
      }
    }

    const result = await onSubmit(formData);
    if (!result.success) setFormError(result.error ?? 'Não foi possível salvar a viagem.');
  }

  return (
    <Overlay role="presentation" onMouseDown={() => !saving && onClose()}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="travel-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="travel-modal-title">{isEditing ? 'Editar viagem' : 'Nova viagem'}</Title>
            <Subtitle>
              Uma viagem pode possuir vários CT-es. Os dados da rota, veículo e motoristas são
              compartilhados; cada CT-e mantém seus próprios valores.
            </Subtitle>
          </div>

          <CloseButton type="button" onClick={onClose} aria-label="Fechar modal" disabled={saving}>
            <X size={20} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Dados da viagem</FormSectionTitle>
                <FormSectionDescription>
                  Informe a data, o embarcador e, quando houver, a data de recebimento.
                </FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="travel-date">Data da viagem</Label>
                <DateInput
                  id="travel-date"
                  value={formData.date}
                  onValueChange={(value) => handleChange('date', value)}
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="travel-shipper">Embarcador</Label>
                <SelectWithAction>
                  <SelectControl>
                    <FieldIcon aria-hidden="true"><Building2 size={18} /></FieldIcon>
                    <Select
                      id="travel-shipper"
                      value={formData.shipperId}
                      onChange={(event) => handleChange('shipperId', event.target.value)}
                      required
                      disabled={optionsLoading && shippers.length === 0}
                    >
                      <option value="" disabled>
                        {optionsLoading ? 'Carregando embarcadores...' : 'Selecione o embarcador'}
                      </option>
                      {shippers.map((shipper) => (
                        <option key={shipper.id} value={String(shipper.id)}>{shipper.name}</option>
                      ))}
                    </Select>
                  </SelectControl>
                  <InlineAddButton
                    type="button"
                    onClick={() => setIsShipperModalOpen(true)}
                    title="Cadastrar novo embarcador"
                    aria-label="Cadastrar novo embarcador"
                  >
                    <Plus size={20} aria-hidden="true" />
                  </InlineAddButton>
                </SelectWithAction>
              </Field>

              <Field>
                <Label htmlFor="travel-received-date">Data de recebimento do frete</Label>
                <DateInput
                  id="travel-received-date"
                  value={formData.receivedDate}
                  onValueChange={(value) => handleChange('receivedDate', value)}
                />
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <FormSectionHeaderRow>
              <div>
                <FormSectionTitle>CT-es e valores do frete</FormSectionTitle>
                <FormSectionDescription>
                  Informe número, série e valores de cada CT-e. Use “Adicionar CT-e” quando a mesma
                  viagem possuir mais de um documento.
                </FormSectionDescription>
              </div>
              <AddCteButton type="button" onClick={addCte}>
                <FilePlus2 size={17} aria-hidden="true" />
                Adicionar CT-e
              </AddCteButton>
            </FormSectionHeaderRow>

            <CteList>
              {formData.ctes.map((cte, index) => {
                const cteCalculation = calculateCte(cte);

                return (
                  <CteCard key={cte.key}>
                    <CteCardHeader>
                      <CteCardTitle>
                        <FileText size={17} aria-hidden="true" />
                        CT-e {index + 1}
                      </CteCardTitle>
                      {formData.ctes.length > 1 ? (
                        <CteRemoveButton
                          type="button"
                          onClick={() => removeCte(cte.key)}
                          aria-label={`Remover CT-e ${index + 1}`}
                          title="Remover este CT-e"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Remover
                        </CteRemoveButton>
                      ) : null}
                    </CteCardHeader>

                    <CteGrid>
                      <Field>
                        <Label htmlFor={`travel-cte-type-${cte.key}`}>Tipo</Label>
                        <FieldIcon aria-hidden="true"><FileText size={18} /></FieldIcon>
                        <Select
                          id={`travel-cte-type-${cte.key}`}
                          value={cte.cteType}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'cteType', event.target.value)
                          }
                        >
                          {CTE_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Select>
                      </Field>

                      <Field>
                        <Label htmlFor={`travel-cte-number-${cte.key}`}>Número do CT-e</Label>
                        <FieldIcon aria-hidden="true"><FileText size={18} /></FieldIcon>
                        <Input
                          id={`travel-cte-number-${cte.key}`}
                          type="text"
                          inputMode="numeric"
                          value={cte.cteNumber}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'cteNumber', event.target.value)
                          }
                          placeholder="Ex.: 458921"
                          required
                        />
                      </Field>

                      <Field>
                        <Label htmlFor={`travel-cte-series-${cte.key}`}>Série</Label>
                        <FieldIcon aria-hidden="true"><FileText size={18} /></FieldIcon>
                        <Input
                          id={`travel-cte-series-${cte.key}`}
                          type="text"
                          value={cte.cteSeries}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'cteSeries', event.target.value)
                          }
                          placeholder="Ex.: 1"
                          required
                        />
                      </Field>

                      <Field>
                        <Label htmlFor={`travel-net-freight-${cte.key}`}>Frete líquido</Label>
                        <FieldIcon aria-hidden="true"><CircleDollarSign size={18} /></FieldIcon>
                        <Input
                          id={`travel-net-freight-${cte.key}`}
                          type="text"
                          inputMode="decimal"
                          value={cte.netFreight}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'netFreight', event.target.value)
                          }
                          placeholder="Ex.: 5.000,00"
                          required
                        />
                      </Field>

                      <Field>
                        <Label htmlFor={`travel-insurance-${cte.key}`}>Seguro</Label>
                        <FieldIcon aria-hidden="true"><CircleDollarSign size={18} /></FieldIcon>
                        <Input
                          id={`travel-insurance-${cte.key}`}
                          type="text"
                          inputMode="decimal"
                          value={cte.insuranceAmount}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'insuranceAmount', event.target.value)
                          }
                          placeholder="0,00"
                        />
                      </Field>

                      <Field>
                        <Label htmlFor={`travel-toll-${cte.key}`}>Pedágio</Label>
                        <FieldIcon aria-hidden="true"><CircleDollarSign size={18} /></FieldIcon>
                        <Input
                          id={`travel-toll-${cte.key}`}
                          type="text"
                          inputMode="decimal"
                          value={cte.tollAmount}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'tollAmount', event.target.value)
                          }
                          placeholder="0,00"
                        />
                      </Field>

                      <Field>
                        <Label htmlFor={`travel-icms-${cte.key}`}>ICMS</Label>
                        <FieldIcon aria-hidden="true"><CircleDollarSign size={18} /></FieldIcon>
                        <Input
                          id={`travel-icms-${cte.key}`}
                          type="text"
                          inputMode="decimal"
                          value={cte.icmsAmount}
                          onChange={(event) =>
                            handleCteChange(cte.key, 'icmsAmount', event.target.value)
                          }
                          placeholder="0,00"
                        />
                      </Field>

                      <CteTotalBox>
                        <CteTotalLabel>Frete bruto deste CT-e</CteTotalLabel>
                        <CteTotalValue>{formatCurrency(cteCalculation.grossFreight)}</CteTotalValue>
                      </CteTotalBox>
                    </CteGrid>
                  </CteCard>
                );
              })}
            </CteList>

            <InlineInfo>
              O bruto de cada CT-e = Frete líquido + Seguro + Pedágio + ICMS.
            </InlineInfo>
          </FormSection>

          <CalculationPreview aria-label="Resumo financeiro de todos os CT-es da viagem">
            <CalculationItem>
              <CalculationLabel>CT-es nesta viagem</CalculationLabel>
              <CalculationValue>{String(formData.ctes.length)}</CalculationValue>
            </CalculationItem>
            <CalculationItem>
              <CalculationLabel>Frete líquido total</CalculationLabel>
              <CalculationValue>{formatCurrency(calculations.netFreight)}</CalculationValue>
            </CalculationItem>
            <CalculationItem>
              <CalculationLabel>Total complementos</CalculationLabel>
              <CalculationValue>{formatCurrency(calculations.complements)}</CalculationValue>
            </CalculationItem>
            <CalculationItem>
              <CalculationLabel>Frete bruto total</CalculationLabel>
              <CalculationValue>{formatCurrency(calculations.grossFreight)}</CalculationValue>
            </CalculationItem>
          </CalculationPreview>

          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Rota</FormSectionTitle>
                <FormSectionDescription>Informe o ponto de partida e o destino final.</FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="travel-origin">Origem</Label>
                <FieldIcon aria-hidden="true"><MapPin size={18} /></FieldIcon>
                <Input
                  id="travel-origin"
                  type="text"
                  value={formData.origin}
                  onChange={(event) => handleChange('origin', event.target.value)}
                  placeholder="Ex.: Chapecó/SC"
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="travel-destination">Destino</Label>
                <FieldIcon aria-hidden="true"><MapPin size={18} /></FieldIcon>
                <Input
                  id="travel-destination"
                  type="text"
                  value={formData.destination}
                  onChange={(event) => handleChange('destination', event.target.value)}
                  placeholder="Ex.: Curitiba/PR"
                  required
                />
              </Field>
            </FieldGrid>

            {(formData.origin || formData.destination) && (
              <RoutePreview aria-label="Prévia da rota">
                <RoutePreviewPoint>{formData.origin || 'Origem'}</RoutePreviewPoint>
                <RoutePreviewArrow aria-hidden="true"><ArrowRight size={18} /></RoutePreviewArrow>
                <RoutePreviewPoint>{formData.destination || 'Destino'}</RoutePreviewPoint>
              </RoutePreview>
            )}
          </FormSection>

          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Execução da viagem</FormSectionTitle>
                <FormSectionDescription>
                  Escolha entre frota própria ou frete contratado de terceiro. O desengate é opcional.
                </FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="travel-operation-type">Responsável pela viagem</Label>
                <FieldIcon aria-hidden="true"><Truck size={18} /></FieldIcon>
                <Select
                  id="travel-operation-type"
                  value={formData.operationType}
                  onChange={(event) => handleChange('operationType', event.target.value)}
                >
                  <option value="FLEET">Frota própria</option>
                  <option value="THIRD_PARTY">Terceiro contratado</option>
                </Select>
              </Field>

              {!isThirdParty ? (
                <Field>
                  <Label htmlFor="travel-vehicle">Cavalo / placa</Label>
                  <FieldIcon aria-hidden="true"><Truck size={18} /></FieldIcon>
                  <Select
                    id="travel-vehicle"
                    value={formData.vehicleId}
                    onChange={(event) => handleChange('vehicleId', event.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione o cavalo</option>
                    {tractors.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate}{vehicle.fleetNumber ? ` · Frota ${vehicle.fleetNumber}` : ''}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field>
                  <Label htmlFor="travel-third-party-name">Terceiro contratado</Label>
                  <FieldIcon aria-hidden="true"><Building2 size={18} /></FieldIcon>
                  <Input
                    id="travel-third-party-name"
                    type="text"
                    value={formData.thirdPartyName}
                    onChange={(event) => handleChange('thirdPartyName', event.target.value)}
                    placeholder="Nome ou razão social"
                    required
                  />
                </Field>
              )}

              {!isThirdParty ? (
                <>
                  <Field>
                    <Label htmlFor="travel-driver-one">Motorista</Label>
                    <FieldIcon aria-hidden="true"><UserRound size={18} /></FieldIcon>
                    <Select
                      id="travel-driver-one"
                      value={formData.driverOneId}
                      onChange={(event) => handleChange('driverOneId', event.target.value)}
                      required
                    >
                      <option value="" disabled>Selecione o motorista</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}{driver.employeeCode ? ` · ${driver.employeeCode}` : ''}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <Label htmlFor="travel-driver-two">Segundo motorista (opcional)</Label>
                    <FieldIcon aria-hidden="true"><UserRound size={18} /></FieldIcon>
                    <Select
                      id="travel-driver-two"
                      value={formData.driverTwoId}
                      onChange={(event) => handleChange('driverTwoId', event.target.value)}
                    >
                      <option value="">Sem segundo motorista</option>
                      {drivers
                        .filter((driver) => String(driver.id) !== formData.driverOneId)
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name}{driver.employeeCode ? ` · ${driver.employeeCode}` : ''}
                          </option>
                        ))}
                    </Select>
                  </Field>
                </>
              ) : (
                <>
                  <Field>
                    <Label htmlFor="travel-third-party-plate">Placa do terceiro</Label>
                    <FieldIcon aria-hidden="true"><Truck size={18} /></FieldIcon>
                    <Input
                      id="travel-third-party-plate"
                      type="text"
                      maxLength={8}
                      value={formData.thirdPartyPlate}
                      onChange={(event) =>
                        handleChange(
                          'thirdPartyPlate',
                          event.target.value.toLocaleUpperCase('pt-BR').replace(/[^A-Z0-9]/g, ''),
                        )
                      }
                      placeholder="Ex.: ABC1D23"
                      required
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="travel-third-party-payout">Valor de repasse</Label>
                    <FieldIcon aria-hidden="true"><CircleDollarSign size={18} /></FieldIcon>
                    <Input
                      id="travel-third-party-payout"
                      type="text"
                      inputMode="decimal"
                      value={formData.thirdPartyPayoutAmount}
                      onChange={(event) => handleChange('thirdPartyPayoutAmount', event.target.value)}
                      placeholder="Ex.: 4.500,00"
                      required
                    />
                  </Field>
                </>
              )}

              <Field $fullWidth>
                <Label htmlFor="travel-trailer">Carreta do desengate (opcional)</Label>
                <FieldIcon aria-hidden="true"><Truck size={18} /></FieldIcon>
                <Select
                  id="travel-trailer"
                  value={formData.detachedTrailerId}
                  onChange={(event) => handleChange('detachedTrailerId', event.target.value)}
                >
                  <option value="">Sem carreta de desengate</option>
                  {trailers.map((trailer) => (
                    <option key={trailer.id} value={trailer.id}>
                      {trailer.plate}{trailer.fleetNumber ? ` · Frota ${trailer.fleetNumber}` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGrid>
          </FormSection>

          {isThirdParty ? (
            <CalculationPreview aria-label="Resumo do repasse ao terceiro">
              <CalculationItem>
                <CalculationLabel>Repasse ao terceiro</CalculationLabel>
                <CalculationValue>{formatCurrency(calculations.thirdPartyPayout)}</CalculationValue>
              </CalculationItem>
              <CalculationItem>
                <CalculationLabel>Frete bruto total</CalculationLabel>
                <CalculationValue>{formatCurrency(calculations.grossFreight)}</CalculationValue>
              </CalculationItem>
            </CalculationPreview>
          ) : null}

          {formError && <ErrorMessage role="alert">{formError}</ErrorMessage>}

          <Actions>
            <CancelButton type="button" onClick={onClose} disabled={saving}>Cancelar</CancelButton>
            <SaveButton type="submit" disabled={saving}>
              <Save size={18} aria-hidden="true" />
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar viagem'}
            </SaveButton>
          </Actions>
        </Form>
      </Modal>

      <ShipperQuickModal
        isOpen={isShipperModalOpen}
        saving={creatingShipper}
        onClose={() => setIsShipperModalOpen(false)}
        onCreate={onCreateShipper}
        onCreated={(shipper) => handleChange('shipperId', String(shipper.id))}
      />
    </Overlay>
  );
}

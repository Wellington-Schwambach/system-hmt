import { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  CircleDollarSign,
  Droplets,
  Fuel,
  Gauge,
  MapPin,
  Save,
  Truck,
  UserRound,
  X,
} from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import { INITIAL_FUEL_FORM } from '../../constants';
import type { FuelFormData, FuelRecordWithMetrics } from '../../types';
import {
  calculateValuePerLiter,
  calculateVehicleAverage,
  formatCurrency,
  formatDecimal,
  formatInteger,
  parseDecimalInput,
} from '../../utils';
import type { FuelFormModalProps } from './types';
import {
  Actions,
  BillingPeriodCopy,
  BillingPeriodDescription,
  BillingPeriodField,
  BillingPeriodPanel,
  BillingPeriodTitle,
  ArlaToggle,
  CalculationItem,
  CalculationLabel,
  CalculationPreview,
  CalculationValue,
  CancelButton,
  CloseButton,
  Field,
  FieldControl,
  FieldGrid,
  FieldHelp,
  FieldIcon,
  Form,
  FormSection,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
  Header,
  Input,
  Label,
  Modal,
  Overlay,
  ReadonlyInput,
  SaveButton,
  Select,
  Subtitle,
  Title,
  ToggleInput,
} from './styles';

function getInitialFormData(editingRecord?: FuelRecordWithMetrics | null): FuelFormData {
  if (!editingRecord) {
    return {
      ...INITIAL_FUEL_FORM,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    station: editingRecord.station,
    vehicleId: editingRecord.vehicleId ? String(editingRecord.vehicleId) : '',
    date: editingRecord.date,
    billingMonth: editingRecord.billingMonth || editingRecord.date.slice(0, 7),
    km: editingRecord.km !== null && editingRecord.km > 0 ? String(editingRecord.km) : '',
    dieselLiters: String(editingRecord.dieselLiters),
    dieselTotalValue: String(editingRecord.dieselTotalValue),
    hasArla: editingRecord.arlaLiters > 0 || editingRecord.arlaTotalValue > 0,
    arlaLiters: editingRecord.arlaLiters > 0 ? String(editingRecord.arlaLiters) : '',
    arlaTotalValue: editingRecord.arlaTotalValue > 0 ? String(editingRecord.arlaTotalValue) : '',
    driverId: editingRecord.driverId ? String(editingRecord.driverId) : '',
  };
}

function Control({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <FieldControl>
      <FieldIcon aria-hidden="true">{icon}</FieldIcon>
      {children}
    </FieldControl>
  );
}

export function FuelFormModal({
  isOpen,
  editingRecord,
  vehicleOptions,
  driverOptions,
  saving = false,
  onClose,
  onSubmit,
}: FuelFormModalProps) {
  const [formData, setFormData] = useState<FuelFormData>(() => getInitialFormData(editingRecord));


  const selectedVehicle = useMemo(
    () => vehicleOptions.find((vehicle) => String(vehicle.id) === formData.vehicleId),
    [formData.vehicleId, vehicleOptions],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, saving]);

  const calculations = useMemo(() => {
    const fuelKm = formData.km.trim() ? Number(formData.km) : null;
    const dieselLiters = parseDecimalInput(formData.dieselLiters);
    const dieselTotalValue = parseDecimalInput(formData.dieselTotalValue);
    const arlaLiters = formData.hasArla ? parseDecimalInput(formData.arlaLiters) : 0;
    const arlaTotalValue = formData.hasArla ? parseDecimalInput(formData.arlaTotalValue) : 0;
    const vehicleCurrentKm =
      editingRecord && editingRecord.vehicleId === selectedVehicle?.id && editingRecord.vehicleKmReference !== null
        ? editingRecord.vehicleKmReference
        : selectedVehicle?.currentKm ?? 0;
    const distanceKm =
      fuelKm !== null && vehicleCurrentKm > 0 && fuelKm >= vehicleCurrentKm
        ? fuelKm - vehicleCurrentKm
        : null;

    return {
      dieselValuePerLiter: calculateValuePerLiter(dieselTotalValue, dieselLiters),
      average: calculateVehicleAverage(vehicleCurrentKm, fuelKm, dieselLiters),
      distanceKm,
      vehicleCurrentKm,
      arlaValuePerLiter: calculateValuePerLiter(arlaTotalValue, arlaLiters),
      totalValue: dieselTotalValue + arlaTotalValue,
    };
  }, [editingRecord, formData, selectedVehicle]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingRecord);

  const handleChange = (field: keyof FuelFormData, value: string | boolean) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await onSubmit(formData);
    if (success) onClose();
  };

  return (
    <Overlay role="presentation" onMouseDown={() => !saving && onClose()}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="fuel-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="fuel-modal-title">{isEditing ? 'Editar abastecimento' : 'Novo abastecimento'}</Title>
            <Subtitle>
              Diesel e Arla ficam no mesmo abastecimento, mas o faturamento de cada produto é
              controlado separadamente na listagem.
            </Subtitle>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar modal" disabled={saving}>
            <X size={20} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
            <BillingPeriodField>
              <Label htmlFor="fuel-billing-month">Mês de faturamento</Label>
              <Control icon={<CalendarRange size={18} />}>
                <Input
                  id="fuel-billing-month"
                  type="month"
                  value={formData.billingMonth}
                  onChange={(event) => handleChange('billingMonth', event.target.value)}
                  required
                />
              </Control>
            </BillingPeriodField>
          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Dados e vínculos</FormSectionTitle>
                <FormSectionDescription>
                  As placas são carregadas somente dos cavalos ativos cadastrados em Veículos.
                </FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="fuel-plate">Placa</Label>
                <Control icon={<Truck size={18} />}>
                  <Select
                    id="fuel-plate"
                    value={formData.vehicleId}
                    onChange={(event) => handleChange('vehicleId', event.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione um cavalo</option>
                    {vehicleOptions.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.plate}</option>
                    ))}
                  </Select>
                </Control>
              </Field>

              <Field>
                <Label htmlFor="vehicle-current-km">KM atual do veículo</Label>
                <Control icon={<Gauge size={18} />}>
                  <ReadonlyInput
                    id="vehicle-current-km"
                    type="text"
                    value={selectedVehicle && selectedVehicle.currentKm > 0 ? formatInteger(selectedVehicle.currentKm) : '—'}
                    readOnly
                    tabIndex={-1}
                  />
                </Control>
                <FieldHelp>
                  {editingRecord && editingRecord.vehicleId === selectedVehicle?.id && editingRecord.vehicleKmReference !== null
                    ? `Valor atual do cadastro. Neste abastecimento, a referência salva para a média é ${formatInteger(editingRecord.vehicleKmReference)} km.`
                    : 'Valor atual informado no cadastro do veículo.'}
                </FieldHelp>
              </Field>

              <Field>
                <Label htmlFor="fuel-driver">Motorista</Label>
                <Control icon={<UserRound size={18} />}>
                  <Select
                    id="fuel-driver"
                    value={formData.driverId}
                    onChange={(event) => handleChange('driverId', event.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione um motorista</option>
                    {driverOptions.map((driver) => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </Select>
                </Control>
              </Field>

              <Field>
                <Label htmlFor="fuel-date">Data do abastecimento</Label>
                <DateInput
                  id="fuel-date"
                  value={formData.date}
                  onValueChange={(value) => handleChange('date', value)}
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="fuel-km">KM do abastecimento (opcional)</Label>
                <Control icon={<Gauge size={18} />}>
                  <Input
                    id="fuel-km"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.km}
                    onChange={(event) => handleChange('km', event.target.value)}
                    placeholder="Ex.: 155870"
                  />
                </Control>
                <FieldHelp>
                  {!formData.km.trim()
                    ? 'Campo opcional. Sem KM, a média fica 0,00 km/L e o KM atual do veículo não é alterado.'
                    : calculations.vehicleCurrentKm <= 0
                      ? 'O abastecimento será salvo. Sem uma referência anterior de KM, a média ficará 0,00 km/L.'
                      : Number(formData.km) < calculations.vehicleCurrentKm
                        ? `O abastecimento será salvo, mas o KM atual (${formatInteger(calculations.vehicleCurrentKm)}) não será reduzido e a média ficará 0,00 km/L.`
                        : calculations.distanceKm !== null
                          ? `Distância usada na média: ${formatInteger(calculations.distanceKm)} km. Este KM pode atualizar o cadastro do veículo.`
                          : 'Campo opcional. Sem KM, a média fica 0,00 km/L e o KM atual do veículo não é alterado.'}
                </FieldHelp>
              </Field>

              <Field>
                <Label htmlFor="fuel-station">Posto</Label>
                <Control icon={<MapPin size={18} />}>
                  <Input
                    id="fuel-station"
                    type="text"
                    value={formData.station}
                    onChange={(event) => handleChange('station', event.target.value)}
                    placeholder="Digite o nome do posto"
                    required
                  />
                </Control>
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Diesel</FormSectionTitle>
                <FormSectionDescription>
                  Informe litragem e valor total do Diesel. O faturamento será feito separadamente.
                </FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="diesel-liters">Litros de Diesel</Label>
                <Control icon={<Fuel size={18} />}>
                  <Input
                    id="diesel-liters"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.dieselLiters}
                    onChange={(event) => handleChange('dieselLiters', event.target.value)}
                    placeholder="Ex.: 400,00"
                    required
                  />
                </Control>
              </Field>
              <Field>
                <Label htmlFor="diesel-total-value">Valor total do Diesel</Label>
                <Control icon={<CircleDollarSign size={18} />}>
                  <Input
                    id="diesel-total-value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.dieselTotalValue}
                    onChange={(event) => handleChange('dieselTotalValue', event.target.value)}
                    placeholder="Ex.: 2.180,00"
                    required
                  />
                </Control>
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Arla</FormSectionTitle>
                <FormSectionDescription>
                  Marque somente quando esse abastecimento também possuir Arla.
                </FormSectionDescription>
              </div>
              <ArlaToggle>
                <ToggleInput
                  type="checkbox"
                  checked={formData.hasArla}
                  onChange={(event) => handleChange('hasArla', event.target.checked)}
                />
                Possui Arla
              </ArlaToggle>
            </FormSectionHeader>

            {formData.hasArla && (
              <FieldGrid>
                <Field>
                  <Label htmlFor="arla-liters">Litros de Arla</Label>
                  <Control icon={<Droplets size={18} />}>
                    <Input
                      id="arla-liters"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.arlaLiters}
                      onChange={(event) => handleChange('arlaLiters', event.target.value)}
                      placeholder="Ex.: 20,00"
                      required
                    />
                  </Control>
                </Field>
                <Field>
                  <Label htmlFor="arla-total-value">Valor total do Arla</Label>
                  <Control icon={<CircleDollarSign size={18} />}>
                    <Input
                      id="arla-total-value"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.arlaTotalValue}
                      onChange={(event) => handleChange('arlaTotalValue', event.target.value)}
                      placeholder="Ex.: 109,20"
                      required
                    />
                  </Control>
                </Field>
              </FieldGrid>
            )}
          </FormSection>

          <CalculationPreview aria-label="Prévia dos cálculos automáticos">
            <CalculationItem>
              <CalculationLabel>Diesel por litro</CalculationLabel>
              <CalculationValue>{calculations.dieselValuePerLiter > 0 ? formatCurrency(calculations.dieselValuePerLiter) : '—'}</CalculationValue>
            </CalculationItem>
            <CalculationItem>
              <CalculationLabel>Média do veículo</CalculationLabel>
              <CalculationValue>{`${formatDecimal(calculations.average)} km/L`}</CalculationValue>
            </CalculationItem>
            <CalculationItem>
              <CalculationLabel>Arla por litro</CalculationLabel>
              <CalculationValue>{calculations.arlaValuePerLiter > 0 ? formatCurrency(calculations.arlaValuePerLiter) : '—'}</CalculationValue>
            </CalculationItem>
            <CalculationItem>
              <CalculationLabel>Total da abastecida</CalculationLabel>
              <CalculationValue>{calculations.totalValue > 0 ? formatCurrency(calculations.totalValue) : '—'}</CalculationValue>
            </CalculationItem>
          </CalculationPreview>

          <Actions>
            <CancelButton type="button" onClick={onClose} disabled={saving}>Cancelar</CancelButton>
            <SaveButton type="submit" disabled={saving}>
              <Save size={18} aria-hidden="true" />
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar abastecimento'}
            </SaveButton>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}

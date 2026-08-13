import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
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

import { getDriverOptions } from '../../../../utils/employeeDrivers';
import { getVehiclePlateOptions } from '../../../../utils/vehiclePlates';
import { INITIAL_FUEL_FORM } from '../../constants';
import type { FuelFormData, FuelRecordWithMetrics } from '../../types';
import {
  calculateValuePerLiter,
  calculateVehicleAverage,
  formatCurrency,
  formatDecimal,
  parseDecimalInput,
} from '../../utils';
import type { FuelFormModalProps } from './types';
import {
  Actions,
  ArlaToggle,
  CalculationItem,
  CalculationLabel,
  CalculationPreview,
  CalculationValue,
  CancelButton,
  CloseButton,
  Field,
  FieldGrid,
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
  SaveButton,
  Select,
  Subtitle,
  Title,
  ToggleInput,
} from './styles';
import { DateInput } from '../../../../components/DateInput';

function getInitialFormData(editingRecord?: FuelRecordWithMetrics | null): FuelFormData {
  if (!editingRecord) {
    return {
      ...INITIAL_FUEL_FORM,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    station: editingRecord.station,
    plate: editingRecord.plate,
    date: editingRecord.date,
    km: String(editingRecord.km),
    dieselLiters: String(editingRecord.dieselLiters),
    dieselTotalValue: String(editingRecord.dieselTotalValue),
    hasArla: editingRecord.arlaLiters > 0 || editingRecord.arlaTotalValue > 0,
    arlaLiters: editingRecord.arlaLiters > 0 ? String(editingRecord.arlaLiters) : '',
    arlaTotalValue: editingRecord.arlaTotalValue > 0 ? String(editingRecord.arlaTotalValue) : '',
    driver: editingRecord.driver,
  };
}

export function FuelFormModal({ isOpen, editingRecord, onClose, onSubmit }: FuelFormModalProps) {
  const [formData, setFormData] = useState<FuelFormData>(() => getInitialFormData(editingRecord));
  const plateOptions = useMemo(
    () => getVehiclePlateOptions(editingRecord ? [editingRecord.plate] : []),
    [editingRecord],
  );
  const driverOptions = useMemo(
    () => getDriverOptions(editingRecord ? [editingRecord.driver] : []),
    [editingRecord],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const calculations = useMemo(() => {
    const km = Number(formData.km);
    const dieselLiters = parseDecimalInput(formData.dieselLiters);
    const dieselTotalValue = parseDecimalInput(formData.dieselTotalValue);
    const arlaLiters = formData.hasArla ? parseDecimalInput(formData.arlaLiters) : 0;
    const arlaTotalValue = formData.hasArla ? parseDecimalInput(formData.arlaTotalValue) : 0;

    return {
      dieselValuePerLiter: calculateValuePerLiter(dieselTotalValue, dieselLiters),
      average: calculateVehicleAverage(km, dieselLiters),
      arlaValuePerLiter: calculateValuePerLiter(arlaTotalValue, arlaLiters),
      totalValue: dieselTotalValue + arlaTotalValue,
    };
  }, [formData]);

  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(editingRecord);

  const handleChange = (field: keyof FuelFormData, value: string | boolean) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Overlay role="presentation" onMouseDown={onClose}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="fuel-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="fuel-modal-title">
              {isEditing ? 'Editar abastecimento' : 'Novo abastecimento'}
            </Title>
            <Subtitle>
              Cadastre Diesel e, quando houver, Arla no mesmo abastecimento. O registro fica
              inicialmente como não faturado e pode ser faturado diretamente pela listagem.
            </Subtitle>
          </div>

          <CloseButton type="button" onClick={onClose} aria-label="Fechar modal">
            <X size={20} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Dados e vínculos</FormSectionTitle>
                <FormSectionDescription>
                  Relacione o abastecimento à placa e ao motorista responsável.
                </FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="fuel-plate">Placa</Label>
                <FieldIcon aria-hidden="true">
                  <Truck size={18} />
                </FieldIcon>
                <Select
                  id="fuel-plate"
                  value={formData.plate}
                  onChange={(event) => handleChange('plate', event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione uma placa
                  </option>
                  {plateOptions.map((plate) => (
                    <option key={plate} value={plate}>
                      {plate}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label htmlFor="fuel-driver">Motorista</Label>
                <FieldIcon aria-hidden="true">
                  <UserRound size={18} />
                </FieldIcon>
                <Select
                  id="fuel-driver"
                  value={formData.driver}
                  onChange={(event) => handleChange('driver', event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um motorista
                  </option>
                  {driverOptions.map((driver) => (
                    <option key={driver} value={driver}>
                      {driver}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label htmlFor="fuel-date">Data do abastecimento</Label>
                <FieldIcon aria-hidden="true">
                  <CalendarDays size={18} />
                </FieldIcon>
                <DateInput
                  id="fuel-date"
                  value={formData.date}
                  onValueChange={(value) => handleChange('date', value)}
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="fuel-km">KM atual</Label>
                <FieldIcon aria-hidden="true">
                  <Gauge size={18} />
                </FieldIcon>
                <Input
                  id="fuel-km"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.km}
                  onChange={(event) => handleChange('km', event.target.value)}
                  placeholder="Ex.: 155870"
                  required
                />
              </Field>

              <Field $fullWidth>
                <Label htmlFor="fuel-station">Posto</Label>
                <FieldIcon aria-hidden="true">
                  <MapPin size={18} />
                </FieldIcon>
                <Input
                  id="fuel-station"
                  type="text"
                  value={formData.station}
                  onChange={(event) => handleChange('station', event.target.value)}
                  placeholder="Digite o nome do posto"
                  required
                />
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Diesel</FormSectionTitle>
                <FormSectionDescription>
                  Informe litragem e valor total para calcular automaticamente o valor por litro e a
                  média do veículo.
                </FormSectionDescription>
              </div>
            </FormSectionHeader>

            <FieldGrid>
              <Field>
                <Label htmlFor="diesel-liters">Litros de Diesel</Label>
                <FieldIcon aria-hidden="true">
                  <Fuel size={18} />
                </FieldIcon>
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
              </Field>

              <Field>
                <Label htmlFor="diesel-total-value">Valor total do Diesel</Label>
                <FieldIcon aria-hidden="true">
                  <CircleDollarSign size={18} />
                </FieldIcon>
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
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <FormSectionHeader>
              <div>
                <FormSectionTitle>Arla</FormSectionTitle>
                <FormSectionDescription>
                  Ative quando o Arla fizer parte da mesma parada de abastecimento.
                </FormSectionDescription>
              </div>

              <ArlaToggle>
                <ToggleInput
                  type="checkbox"
                  checked={formData.hasArla}
                  onChange={(event) => handleChange('hasArla', event.target.checked)}
                />
                Incluir Arla
              </ArlaToggle>
            </FormSectionHeader>

            {formData.hasArla && (
              <FieldGrid>
                <Field>
                  <Label htmlFor="arla-liters">Litros de Arla</Label>
                  <FieldIcon aria-hidden="true">
                    <Droplets size={18} />
                  </FieldIcon>
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
                </Field>

                <Field>
                  <Label htmlFor="arla-total-value">Valor total do Arla</Label>
                  <FieldIcon aria-hidden="true">
                    <CircleDollarSign size={18} />
                  </FieldIcon>
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
                </Field>
              </FieldGrid>
            )}
          </FormSection>

          <CalculationPreview aria-label="Prévia dos cálculos automáticos">
            <CalculationItem>
              <CalculationLabel>Diesel por litro</CalculationLabel>
              <CalculationValue>
                {calculations.dieselValuePerLiter > 0
                  ? formatCurrency(calculations.dieselValuePerLiter)
                  : '—'}
              </CalculationValue>
            </CalculationItem>

            <CalculationItem>
              <CalculationLabel>Média do veículo</CalculationLabel>
              <CalculationValue>
                {calculations.average === null
                  ? '—'
                  : `${formatDecimal(calculations.average)} km/L`}
              </CalculationValue>
            </CalculationItem>

            <CalculationItem>
              <CalculationLabel>Arla por litro</CalculationLabel>
              <CalculationValue>
                {calculations.arlaValuePerLiter > 0
                  ? formatCurrency(calculations.arlaValuePerLiter)
                  : '—'}
              </CalculationValue>
            </CalculationItem>

            <CalculationItem>
              <CalculationLabel>Total da abastecida</CalculationLabel>
              <CalculationValue>
                {calculations.totalValue > 0 ? formatCurrency(calculations.totalValue) : '—'}
              </CalculationValue>
            </CalculationItem>
          </CalculationPreview>

          <Actions>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit">
              <Save size={18} aria-hidden="true" />
              {isEditing ? 'Salvar alterações' : 'Salvar abastecimento'}
            </SaveButton>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}

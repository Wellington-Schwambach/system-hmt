import { useState } from 'react';
import {
  CarFront,
  FileText,
  Fuel,
  Gauge,
  Hash,
  Palette,
  Save,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import {
  ACCEPTED_CRLV_EXTENSIONS,
  ACCEPTED_CRLV_TYPES,
  INITIAL_VEHICLE_FORM,
  MAX_CRLV_SIZE_BYTES,
  VEHICLE_FUEL_OPTIONS,
  VEHICLE_STATUS_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '../../constants';
import type { VehicleFormData } from '../../types';
import {
  formatFileSize,
  normalizePlate,
  normalizeUppercase,
  onlyDigits,
  vehicleRecordToFormData,
} from '../../utils';
import type { VehicleFormProps } from './types';
import {
  Actions,
  DocumentCard,
  DocumentTitle,
  EditingBadge,
  ErrorMessage,
  ExistingFile,
  Field,
  FieldIcon,
  FileInput,
  FileName,
  Form,
  FormCard,
  FormIntro,
  FormTitle,
  Grid,
  HelperText,
  Input,
  InputShell,
  Label,
  NotesDocumentGrid,
  PrimaryButton,
  RemoveFileButton,
  SecondaryButton,
  Section,
  SectionLegend,
  Select,
  Textarea,
} from './styles';

export function VehicleForm({
  editingRecord,
  saving,
  onCancelEditing,
  onSubmit,
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>(() =>
    editingRecord ? vehicleRecordToFormData(editingRecord) : { ...INITIAL_VEHICLE_FORM },
  );
  const [formError, setFormError] = useState('');

  function handleChange(field: keyof VehicleFormData, value: string) {
    setFormError('');
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  }

  function handleFileChange(file: File | null) {
    setFormError('');

    const extension = file?.name.split('.').pop()?.toLowerCase() ?? '';
    const hasAcceptedType = file
      ? ACCEPTED_CRLV_TYPES.includes(file.type) || ACCEPTED_CRLV_EXTENSIONS.includes(extension)
      : true;

    if (file && file.size === 0) {
      setFormError('O arquivo do CRLV está vazio ou não pôde ser lido. Selecione outro arquivo.');
      return;
    }

    if (file && !hasAcceptedType) {
      setFormError('O CRLV deve ser um arquivo PDF, JPG ou PNG.');
      return;
    }

    if (file && file.size > MAX_CRLV_SIZE_BYTES) {
      setFormError('O CRLV deve possuir no máximo 10 MB.');
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      crlvFile: file,
      removeCrlv: false,
    }));
  }

  function handleRemoveStoredCrlv() {
    setFormData((currentData) => ({
      ...currentData,
      crlvFile: null,
      crlvValidUntil: '',
      removeCrlv: true,
    }));
  }

  function handleReset() {
    setFormData({ ...INITIAL_VEHICLE_FORM });
    setFormError('');
    onCancelEditing();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Number(formData.modelYear) < Number(formData.manufactureYear)) {
      setFormError('O ano do modelo não pode ser menor que o ano de fabricação.');
      return;
    }

    const hasCrlv =
      Boolean(formData.crlvFile) || Boolean(editingRecord?.crlv && !formData.removeCrlv);
    if (formData.crlvValidUntil && !hasCrlv) {
      setFormError('Anexe o CRLV antes de informar a data de vigência.');
      return;
    }

    const result = await onSubmit(formData, editingRecord?.id);

    if (!result.success) return;

    handleReset();
  }

  const visibleStoredCrlv = editingRecord?.crlv && !formData.removeCrlv && !formData.crlvFile;

  return (
    <FormCard>
      <FormIntro>
        <div>
          <FormTitle>{editingRecord ? 'Editar veículo' : 'Novo veículo'}</FormTitle>
        </div>

        {editingRecord ? <EditingBadge>Modo de edição</EditingBadge> : null}
      </FormIntro>

      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionLegend>Identificação</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="vehicle-fleet-number">N° Frota</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <Hash size={17} />
                </FieldIcon>
                <Input
                  $withIcon
                  id="vehicle-fleet-number"
                  value={formData.fleetNumber}
                  onChange={(event) =>
                    handleChange('fleetNumber', normalizeUppercase(event.target.value, 30))
                  }
                  placeholder="Ex.: 001"
                  autoComplete="off"
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="vehicle-plate">Placa</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <Tag size={17} />
                </FieldIcon>
                <Input
                  $withIcon
                  id="vehicle-plate"
                  value={formData.plate}
                  onChange={(event) => handleChange('plate', normalizePlate(event.target.value))}
                  placeholder="ABC1D23"
                  autoComplete="off"
                  minLength={7}
                  required
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="vehicle-type">Tipo</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <Truck size={17} />
                </FieldIcon>
                <Select
                  $withIcon
                  id="vehicle-type"
                  value={formData.type}
                  onChange={(event) => handleChange('type', event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {VEHICLE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="vehicle-brand">Marca</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <CarFront size={17} />
                </FieldIcon>
                <Input
                  $withIcon
                  id="vehicle-brand"
                  value={formData.brand}
                  onChange={(event) => handleChange('brand', event.target.value)}
                  placeholder="Ex.: Scania"
                  autoComplete="off"
                  required
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="vehicle-model">Modelo</Label>
              <Input
                id="vehicle-model"
                value={formData.model}
                onChange={(event) => handleChange('model', event.target.value)}
                placeholder="Ex.: R 450"
                autoComplete="off"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-status">Status</Label>
              <Select
                id="vehicle-status"
                value={formData.status}
                onChange={(event) => handleChange('status', event.target.value)}
                required
              >
                {VEHICLE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLegend>Características e operação</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="vehicle-manufacture-year">Ano de fabricação</Label>
              <Input
                id="vehicle-manufacture-year"
                inputMode="numeric"
                value={formData.manufactureYear}
                onChange={(event) =>
                  handleChange('manufactureYear', onlyDigits(event.target.value, 4))
                }
                placeholder="Ex.: 2022"
                minLength={4}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-model-year">Ano do modelo</Label>
              <Input
                id="vehicle-model-year"
                inputMode="numeric"
                value={formData.modelYear}
                onChange={(event) => handleChange('modelYear', onlyDigits(event.target.value, 4))}
                placeholder="Ex.: 2023"
                minLength={4}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-color">Cor</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <Palette size={17} />
                </FieldIcon>
                <Input
                  $withIcon
                  id="vehicle-color"
                  value={formData.color}
                  onChange={(event) => handleChange('color', event.target.value)}
                  placeholder="Ex.: Verde"
                  autoComplete="off"
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="vehicle-fuel-type">Combustível</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <Fuel size={17} />
                </FieldIcon>
                <Select
                  $withIcon
                  id="vehicle-fuel-type"
                  value={formData.fuelType}
                  onChange={(event) => handleChange('fuelType', event.target.value)}
                  required
                >
                  {VEHICLE_FUEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="vehicle-capacity">Capacidade (kg)</Label>
              <Input
                id="vehicle-capacity"
                inputMode="numeric"
                value={formData.loadCapacityKg}
                onChange={(event) =>
                  handleChange('loadCapacityKg', onlyDigits(event.target.value, 8))
                }
                placeholder="Ex.: 45000"
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-tare">Tara (kg)</Label>
              <Input
                id="vehicle-tare"
                inputMode="numeric"
                value={formData.tareKg}
                onChange={(event) => handleChange('tareKg', onlyDigits(event.target.value, 8))}
                placeholder="Ex.: 9500"
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-current-km">KM atual</Label>
              <InputShell>
                <FieldIcon aria-hidden="true">
                  <Gauge size={17} />
                </FieldIcon>
                <Input
                  $withIcon
                  id="vehicle-current-km"
                  inputMode="numeric"
                  value={formData.currentKm}
                  onChange={(event) => handleChange('currentKm', onlyDigits(event.target.value, 9))}
                  placeholder="Ex.: 184700"
                />
              </InputShell>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLegend>Documentação e vencimentos</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="vehicle-renavam">RENAVAM</Label>
              <Input
                id="vehicle-renavam"
                inputMode="numeric"
                value={formData.renavam}
                onChange={(event) => handleChange('renavam', onlyDigits(event.target.value, 11))}
                placeholder="Somente números"
                autoComplete="off"
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-chassis">Chassi</Label>
              <Input
                id="vehicle-chassis"
                value={formData.chassis}
                onChange={(event) =>
                  handleChange('chassis', normalizeUppercase(event.target.value, 17))
                }
                placeholder="17 caracteres"
                autoComplete="off"
                maxLength={17}
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-licensing-expiry">Licenciamento</Label>
              <DateInput
                id="vehicle-licensing-expiry"
                value={formData.licensingExpiryDate}
                onValueChange={(value) => handleChange('licensingExpiryDate', value)}
              />
              <HelperText>Data de vencimento do licenciamento.</HelperText>
            </Field>

            <Field>
              <Label htmlFor="vehicle-opentech-expiry">Vencimento Opentech</Label>
              <DateInput
                id="vehicle-opentech-expiry"
                value={formData.opentechExpiryDate}
                onValueChange={(value) => handleChange('opentechExpiryDate', value)}
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-angellira-expiry">Vencimento Angellira</Label>
              <DateInput
                id="vehicle-angellira-expiry"
                value={formData.angelliraExpiryDate}
                onValueChange={(value) => handleChange('angelliraExpiryDate', value)}
              />
            </Field>

            <Field>
              <Label htmlFor="vehicle-tachograph-expiry">Vencimento tacógrafo</Label>
              <DateInput
                id="vehicle-tachograph-expiry"
                value={formData.tachographExpiryDate}
                onValueChange={(value) => handleChange('tachographExpiryDate', value)}
              />
              <HelperText>Data de vencimento da aferição do tacógrafo.</HelperText>
            </Field>
          </Grid>

          <NotesDocumentGrid>
            <Field>
              <Label htmlFor="vehicle-notes">Observações</Label>
              <Textarea
                id="vehicle-notes"
                value={formData.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
                placeholder="Informações adicionais, equipamentos, restrições ou detalhes importantes..."
                maxLength={1000}
              />
              <HelperText>{formData.notes.length}/1000 caracteres</HelperText>
            </Field>

            <DocumentCard>
              <DocumentTitle>
                <FileText size={17} aria-hidden="true" /> CRLV do veículo
              </DocumentTitle>

              {visibleStoredCrlv ? (
                <ExistingFile>
                  <FileName title={editingRecord.crlv?.name}>
                    {editingRecord.crlv?.name}
                    {editingRecord.crlv?.size
                      ? ` · ${formatFileSize(editingRecord.crlv.size)}`
                      : ''}
                  </FileName>
                  <RemoveFileButton type="button" onClick={handleRemoveStoredCrlv}>
                    <Trash2 size={14} aria-hidden="true" /> Remover
                  </RemoveFileButton>
                </ExistingFile>
              ) : null}

              {formData.removeCrlv ? (
                <HelperText>O documento atual será removido ao salvar.</HelperText>
              ) : null}

              {formData.crlvFile ? (
                <ExistingFile>
                  <FileName title={formData.crlvFile.name}>
                    {formData.crlvFile.name} · {formatFileSize(formData.crlvFile.size)}
                  </FileName>
                  <RemoveFileButton type="button" onClick={() => handleFileChange(null)}>
                    <Trash2 size={14} aria-hidden="true" /> Retirar
                  </RemoveFileButton>
                </ExistingFile>
              ) : null}

              <FileInput
                id="vehicle-crlv"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0] ?? null);
                  event.currentTarget.value = '';
                }}
              />
              <HelperText>PDF, JPG ou PNG, com no máximo 10 MB.</HelperText>

              <Field>
                <Label htmlFor="vehicle-crlv-valid-until">Vigência do CRLV</Label>
                <DateInput
                  id="vehicle-crlv-valid-until"
                  value={formData.crlvValidUntil}
                  onValueChange={(value) => handleChange('crlvValidUntil', value)}
                />
              </Field>
            </DocumentCard>
          </NotesDocumentGrid>
        </Section>

        {formError ? <ErrorMessage role="alert">{formError}</ErrorMessage> : null}

        <Actions>
          <SecondaryButton type="button" onClick={handleReset} disabled={saving}>
            {editingRecord ? 'Cancelar edição' : 'Limpar campos'}
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            <Save size={18} aria-hidden="true" />
            {saving ? 'Salvando...' : editingRecord ? 'Salvar alterações' : 'Cadastrar veículo'}
          </PrimaryButton>
        </Actions>
      </Form>
    </FormCard>
  );
}

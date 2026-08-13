import { useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  FileBadge,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import {
  ACCEPTED_EMPLOYEE_DOCUMENT_EXTENSIONS,
  ACCEPTED_EMPLOYEE_DOCUMENT_TYPES,
  CNH_CATEGORY_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  INITIAL_EMPLOYEE_FORM,
  MAX_EMPLOYEE_DOCUMENT_SIZE_BYTES,
} from '../../constants';
import type { EmployeeDocumentType, EmployeeFormData } from '../../types';
import {
  calculateTenure,
  employeeRecordToFormData,
  formatFileSize,
  normalizeUppercase,
  onlyDigits,
} from '../../utils';
import type { EmployeeFormProps } from './types';
import {
  Actions,
  DocumentCard,
  DocumentsGrid,
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
  FormDescription,
  FormIntro,
  FormTitle,
  Grid,
  HelperText,
  Input,
  InputShell,
  Label,
  PrimaryButton,
  ReadOnlyBox,
  RemoveFileButton,
  SecondaryButton,
  Section,
  SectionLegend,
  Select,
  Textarea,
} from './styles';

const documentFields: ReadonlyArray<{
  type: EmployeeDocumentType;
  label: string;
  fileField: 'cnhFile' | 'asoFile' | 'toxicologicalFile' | 'registrationFormFile';
  removeField:
    | 'removeCnhFile'
    | 'removeAsoFile'
    | 'removeToxicologicalFile'
    | 'removeRegistrationFormFile';
}> = [
  { type: 'cnh', label: 'CNH', fileField: 'cnhFile', removeField: 'removeCnhFile' },
  { type: 'aso', label: 'ASO', fileField: 'asoFile', removeField: 'removeAsoFile' },
  {
    type: 'toxicological',
    label: 'Toxicológico',
    fileField: 'toxicologicalFile',
    removeField: 'removeToxicologicalFile',
  },
  {
    type: 'registrationForm',
    label: 'Ficha de registro',
    fileField: 'registrationFormFile',
    removeField: 'removeRegistrationFormFile',
  },
];

export function EmployeeForm({
  editingRecord,
  saving,
  onCancelEditing,
  onSubmit,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(() =>
    editingRecord ? employeeRecordToFormData(editingRecord) : { ...INITIAL_EMPLOYEE_FORM },
  );
  const [formError, setFormError] = useState('');

  const tenure = useMemo(
    () => calculateTenure(formData.admissionDate, formData.terminationDate),
    [formData.admissionDate, formData.terminationDate],
  );

  function handleChange(field: keyof EmployeeFormData, value: string) {
    setFormError('');
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  }

  function handleDocumentChange(
    fileField: (typeof documentFields)[number]['fileField'],
    removeField: (typeof documentFields)[number]['removeField'],
    file: File | null,
  ) {
    setFormError('');

    const extension = file?.name.split('.').pop()?.toLowerCase() ?? '';
    const hasAcceptedType = file
      ? ACCEPTED_EMPLOYEE_DOCUMENT_TYPES.includes(file.type) ||
        ACCEPTED_EMPLOYEE_DOCUMENT_EXTENSIONS.includes(extension)
      : true;

    if (file && file.size === 0) {
      setFormError('O arquivo selecionado está vazio ou não pôde ser lido. Selecione outro arquivo.');
      return;
    }

    if (file && !hasAcceptedType) {
      setFormError('Os anexos devem ser arquivos PDF, JPG ou PNG.');
      return;
    }

    if (file && file.size > MAX_EMPLOYEE_DOCUMENT_SIZE_BYTES) {
      setFormError('Cada anexo deve possuir no máximo 10 MB.');
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      [fileField]: file,
      [removeField]: false,
    }));
  }

  function removeStoredDocument(
    fileField: (typeof documentFields)[number]['fileField'],
    removeField: (typeof documentFields)[number]['removeField'],
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [fileField]: null,
      [removeField]: true,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formData.terminationDate && formData.terminationDate < formData.admissionDate) {
      setFormError('A data de rescisão não pode ser anterior à admissão.');
      return;
    }

    if (formData.probationEndDate && formData.probationEndDate < formData.admissionDate) {
      setFormError('O fim da experiência não pode ser anterior à admissão.');
      return;
    }

    if (
      formData.cnhIssuedAt &&
      formData.cnhExpiryDate &&
      formData.cnhExpiryDate < formData.cnhIssuedAt
    ) {
      setFormError('O vencimento da CNH não pode ser anterior à emissão.');
      return;
    }

    const result = await onSubmit(formData, editingRecord?.id);

    if (!result.success) return;
  }

  return (
    <FormCard>
      <FormIntro>
        <div>
          <FormTitle>{editingRecord ? 'Editar colaborador' : 'Novo colaborador'}</FormTitle>
          <FormDescription>
            Cadastre dados pessoais, vínculo, CNH, vencimentos e documentos do motorista.
          </FormDescription>
        </div>
        {editingRecord ? <EditingBadge>Modo de edição</EditingBadge> : null}
      </FormIntro>

      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionLegend>Identificação e contato</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="employee-code">Matrícula</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><Hash size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-code"
                  value={formData.employeeCode}
                  onChange={(event) =>
                    handleChange('employeeCode', normalizeUppercase(event.target.value, 30))
                  }
                  placeholder="Ex.: MOT-001"
                  required
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="employee-full-name">Nome completo</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><UserRound size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-full-name"
                  value={formData.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="employee-cpf">CPF</Label>
              <Input
                id="employee-cpf"
                inputMode="numeric"
                value={formData.cpf}
                onChange={(event) => handleChange('cpf', onlyDigits(event.target.value, 11))}
                placeholder="Somente números"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="employee-rg">RG</Label>
              <Input
                id="employee-rg"
                value={formData.rg}
                onChange={(event) =>
                  handleChange('rg', normalizeUppercase(event.target.value, 30))
                }
                placeholder="Documento de identidade"
              />
            </Field>

            <Field>
              <Label htmlFor="employee-birth-date">Data de nascimento</Label>
              <DateInput
                id="employee-birth-date"
                value={formData.birthDate}
                onValueChange={(value) => handleChange('birthDate', value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="employee-phone">Telefone</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><Phone size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-phone"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(event) => handleChange('phone', onlyDigits(event.target.value, 11))}
                  placeholder="DDD + número"
                />
              </InputShell>
            </Field>

            <Field $fullWidth>
              <Label htmlFor="employee-email">E-mail</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><Mail size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="motorista@empresa.com.br"
                />
              </InputShell>
            </Field>

            <Field $fullWidth>
              <Label htmlFor="employee-address">Endereço completo</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><MapPin size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-address"
                  value={formData.fullAddress}
                  onChange={(event) => handleChange('fullAddress', event.target.value)}
                  placeholder="Rua, número, complemento, bairro, cidade, UF e CEP"
                />
              </InputShell>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLegend>Vínculo profissional</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="employee-job-title">Cargo / Função</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><BriefcaseBusiness size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-job-title"
                  value={formData.jobTitle}
                  onChange={(event) => handleChange('jobTitle', event.target.value)}
                  required
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="employee-admission-date">Data de admissão</Label>
              <DateInput
                id="employee-admission-date"
                value={formData.admissionDate}
                onValueChange={(value) => handleChange('admissionDate', value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="employee-termination-date">Data de rescisão</Label>
              <DateInput
                id="employee-termination-date"
                value={formData.terminationDate}
                onValueChange={(value) => handleChange('terminationDate', value)}
              />
            </Field>

            <Field>
              <Label htmlFor="employee-probation-end">Fim da experiência</Label>
              <DateInput
                id="employee-probation-end"
                value={formData.probationEndDate}
                onValueChange={(value) => handleChange('probationEndDate', value)}
              />
            </Field>

            <Field>
              <Label htmlFor="employee-status">Status</Label>
              <Select
                id="employee-status"
                value={formData.status}
                onChange={(event) => handleChange('status', event.target.value)}
                required
              >
                {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>Tempo de empresa</Label>
              <ReadOnlyBox>{tenure}</ReadOnlyBox>
            </Field>

            <Field $fullWidth>
              <Label htmlFor="employee-family-contact">Contato familiar</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><Users size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-family-contact"
                  value={formData.familyContact}
                  onChange={(event) => handleChange('familyContact', event.target.value)}
                  placeholder="Nome, parentesco e telefone"
                />
              </InputShell>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLegend>Informações da CNH</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="employee-cnh-number">Número da CNH</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><FileBadge size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-cnh-number"
                  inputMode="numeric"
                  value={formData.cnhNumber}
                  onChange={(event) =>
                    handleChange('cnhNumber', onlyDigits(event.target.value, 20))
                  }
                  placeholder="Número do documento"
                />
              </InputShell>
            </Field>

            <Field>
              <Label htmlFor="employee-cnh-category">Categoria</Label>
              <Select
                id="employee-cnh-category"
                value={formData.cnhCategory}
                onChange={(event) => handleChange('cnhCategory', event.target.value)}
              >
                <option value="">Selecione</option>
                {CNH_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label htmlFor="employee-cnh-state">UF da CNH</Label>
              <Input
                id="employee-cnh-state"
                value={formData.cnhState}
                onChange={(event) =>
                  handleChange('cnhState', normalizeUppercase(event.target.value, 2))
                }
                placeholder="SC"
              />
            </Field>

            <Field>
              <Label htmlFor="employee-cnh-issued">Data de emissão</Label>
              <DateInput
                id="employee-cnh-issued"
                value={formData.cnhIssuedAt}
                onValueChange={(value) => handleChange('cnhIssuedAt', value)}
              />
            </Field>

            <Field>
              <Label htmlFor="employee-first-license">Primeira habilitação</Label>
              <DateInput
                id="employee-first-license"
                value={formData.cnhFirstLicenseDate}
                onValueChange={(value) => handleChange('cnhFirstLicenseDate', value)}
              />
            </Field>

            <Field>
              <Label htmlFor="employee-cnh-expiry">Vencimento da CNH</Label>
              <DateInput
                id="employee-cnh-expiry"
                value={formData.cnhExpiryDate}
                onValueChange={(value) => handleChange('cnhExpiryDate', value)}
              />
            </Field>

            <Field $fullWidth>
              <Label htmlFor="employee-cnh-security-code">Código de segurança</Label>
              <InputShell>
                <FieldIcon aria-hidden="true"><ShieldCheck size={17} /></FieldIcon>
                <Input
                  $withIcon
                  id="employee-cnh-security-code"
                  value={formData.cnhSecurityCode}
                  onChange={(event) =>
                    handleChange('cnhSecurityCode', normalizeUppercase(event.target.value, 20))
                  }
                  placeholder="Código de segurança da CNH"
                />
              </InputShell>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLegend>Vencimentos obrigatórios</SectionLegend>
          <Grid>
            <Field>
              <Label htmlFor="employee-aso-expiry">Vencimento ASO</Label>
              <DateInput
                id="employee-aso-expiry"
                value={formData.asoExpiryDate}
                onValueChange={(value) => handleChange('asoExpiryDate', value)}
              />
            </Field>
            <Field>
              <Label htmlFor="employee-opentech-expiry">Vencimento Opentech</Label>
              <DateInput
                id="employee-opentech-expiry"
                value={formData.opentechExpiryDate}
                onValueChange={(value) => handleChange('opentechExpiryDate', value)}
              />
            </Field>
            <Field>
              <Label htmlFor="employee-angellira-expiry">Vencimento Angellira</Label>
              <DateInput
                id="employee-angellira-expiry"
                value={formData.angelliraExpiryDate}
                onValueChange={(value) => handleChange('angelliraExpiryDate', value)}
              />
            </Field>
            <Field>
              <Label htmlFor="employee-toxicological-expiry">Vencimento Toxicológico</Label>
              <DateInput
                id="employee-toxicological-expiry"
                value={formData.toxicologicalExpiryDate}
                onValueChange={(value) => handleChange('toxicologicalExpiryDate', value)}
              />
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLegend>Anexos do motorista</SectionLegend>
          <DocumentsGrid>
            {documentFields.map((documentField) => {
              const newFile = formData[documentField.fileField];
              const removed = formData[documentField.removeField];
              const storedDocument = editingRecord?.documents[documentField.type] ?? null;
              const showStored = storedDocument && !removed && !newFile;

              return (
                <DocumentCard key={documentField.type}>
                  <DocumentTitle><FileText size={17} /> {documentField.label}</DocumentTitle>
                  <FileInput
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) =>
                      handleDocumentChange(
                        documentField.fileField,
                        documentField.removeField,
                        event.target.files?.[0] ?? null,
                      )
                    }
                  />
                  {newFile ? (
                    <ExistingFile>
                      <FileName>{newFile.name} · {formatFileSize(newFile.size)}</FileName>
                      <RemoveFileButton
                        type="button"
                        onClick={() =>
                          handleDocumentChange(
                            documentField.fileField,
                            documentField.removeField,
                            null,
                          )
                        }
                      >
                        <Trash2 size={14} /> Remover
                      </RemoveFileButton>
                    </ExistingFile>
                  ) : null}
                  {showStored ? (
                    <ExistingFile>
                      <FileName>
                        {storedDocument.name}
                        {storedDocument.size ? ` · ${formatFileSize(storedDocument.size)}` : ''}
                      </FileName>
                      <RemoveFileButton
                        type="button"
                        onClick={() =>
                          removeStoredDocument(
                            documentField.fileField,
                            documentField.removeField,
                          )
                        }
                      >
                        <Trash2 size={14} /> Excluir
                      </RemoveFileButton>
                    </ExistingFile>
                  ) : null}
                  {removed && !newFile ? <HelperText>O anexo será removido ao salvar.</HelperText> : null}
                  <HelperText>PDF, JPG ou PNG, até 10 MB.</HelperText>
                </DocumentCard>
              );
            })}
          </DocumentsGrid>
        </Section>

        <Section>
          <SectionLegend>Informações complementares</SectionLegend>
          <Grid>
            <Field $fullWidth>
              <Label htmlFor="employee-trainings">Treinamentos</Label>
              <Textarea
                id="employee-trainings"
                value={formData.trainings}
                onChange={(event) => handleChange('trainings', event.target.value)}
                placeholder="MOPP, direção defensiva, integrações..."
              />
            </Field>
            <Field $fullWidth>
              <Label htmlFor="employee-notes">Observações</Label>
              <Textarea
                id="employee-notes"
                value={formData.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
                placeholder="Informações adicionais do colaborador"
              />
            </Field>
          </Grid>
        </Section>

        {formError ? <ErrorMessage role="alert">{formError}</ErrorMessage> : null}

        <Actions>
          <SecondaryButton type="button" onClick={onCancelEditing} disabled={saving}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            <Save size={17} /> {saving ? 'Salvando...' : 'Salvar colaborador'}
          </PrimaryButton>
        </Actions>
      </Form>
    </FormCard>
  );
}

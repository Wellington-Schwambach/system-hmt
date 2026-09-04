import {
  Building2,
  ClipboardList,
  Download,
  FilePlus2,
  FileText,
  Landmark,
  MapPin,
  Paperclip,
  Phone,
  Save,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { companyProfileService } from './services';
import type { CompanyDocumentRecord, CompanyProfileFormData, CompanyProfileRecord } from './types';
import {
  ActionBar,
  Button,
  CompanyIcon,
  DocumentActions,
  DocumentCard,
  DocumentIcon,
  DocumentInfo,
  DocumentsGrid,
  DocumentTop,
  EmptyDocuments,
  Field,
  FileInputLabel,
  Form,
  Grid,
  HeaderCard,
  HeaderAside,
  HeaderIdentity,
  HeaderMeta,
  HeaderText,
  HelperText,
  Input,
  LoadingState,
  Page,
  Section,
  SectionHeader,
  SectionTitle,
  Select,
  Textarea,
} from './styles';

const EMPTY_FORM: CompanyProfileFormData = {
  legalName: '',
  tradeName: '',
  cnpj: '',
  stateRegistration: '',
  municipalRegistration: '',
  rntrc: '',
  openingDate: '',
  taxRegime: '',
  email: '',
  emailSecondary: '',
  phone: '',
  whatsapp: '',
  postalCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  responsibleName: '',
  responsibleCpf: '',
  responsiblePhone: '',
  responsibleEmail: '',
  responsibleTwoName: '',
  responsibleTwoCpf: '',
  responsibleTwoPhone: '',
  responsibleTwoEmail: '',
  notes: '',
};

interface DocumentDraft {
  key: string;
  id: number | null;
  name: string;
  originalName: string;
  originalSavedName: string;
  sizeBytes: number;
  file: File | null;
  removed: boolean;
}

function draftFromDocument(document?: CompanyDocumentRecord): DocumentDraft {
  return {
    key: document ? `stored-${document.id}` : `new-${crypto.randomUUID()}`,
    id: document?.id ?? null,
    name: document?.name ?? '',
    originalName: document?.originalName ?? '',
    originalSavedName: document?.name ?? '',
    sizeBytes: document?.sizeBytes ?? 0,
    file: null,
    removed: false,
  };
}

function formFromCompany(company: CompanyProfileRecord): CompanyProfileFormData {
  return {
    legalName: company.legalName,
    tradeName: company.tradeName,
    cnpj: company.cnpj,
    stateRegistration: company.stateRegistration,
    municipalRegistration: company.municipalRegistration,
    rntrc: company.rntrc,
    openingDate: company.openingDate,
    taxRegime: company.taxRegime,
    email: company.email,
    emailSecondary: company.emailSecondary,
    phone: company.phone,
    whatsapp: company.whatsapp,
    postalCode: company.postalCode,
    street: company.street,
    number: company.number,
    complement: company.complement,
    neighborhood: company.neighborhood,
    city: company.city,
    state: company.state,
    responsibleName: company.responsibleName,
    responsibleCpf: company.responsibleCpf,
    responsiblePhone: company.responsiblePhone,
    responsibleEmail: company.responsibleEmail,
    responsibleTwoName: company.responsibleTwoName,
    responsibleTwoCpf: company.responsibleTwoCpf,
    responsibleTwoPhone: company.responsibleTwoPhone,
    responsibleTwoEmail: company.responsibleTwoEmail,
    notes: company.notes,
  };
}

function digits(value: string): string {
  return value.replace(/\D/g, '');
}

function maskCnpj(value: string): string {
  return digits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskCpf(value: string): string {
  return digits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value: string): string {
  const raw = digits(value).slice(0, 11);
  if (raw.length <= 10) {
    return raw.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return raw.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function maskPostalCode(value: string): string {
  return digits(value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CompanyProfile() {
  const notifications = useNotifications();
  const documentsSectionRef = useRef<HTMLElement | null>(null);
  const [company, setCompany] = useState<CompanyProfileRecord | null>(null);
  const [form, setForm] = useState<CompanyProfileFormData>(EMPTY_FORM);
  const [documents, setDocuments] = useState<DocumentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    companyProfileService
      .get()
      .then((record) => {
        if (!active) return;
        setCompany(record);
        if (record) {
          setForm(formFromCompany(record));
          setDocuments(record.documents.map(draftFromDocument));
        }
      })
      .catch((error) => {
        if (!active) return;
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os dados da empresa.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notifications]);

  const visibleDocuments = useMemo(() => documents.filter((document) => !document.removed), [documents]);

  function change(field: keyof CompanyProfileFormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateDocument(key: string, patch: Partial<DocumentDraft>) {
    setDocuments((current) => current.map((document) => (document.key === key ? { ...document, ...patch } : document)));
  }

  function addDocument() {
    setDocuments((current) => [...current, draftFromDocument()]);
  }

  async function requestRemoveDocument(document: DocumentDraft) {
    if (!document.id) {
      setDocuments((current) => current.filter((item) => item.key !== document.key));
      return;
    }

    const confirmed = await notifications.confirm({
      title: 'Remover documento?',
      message: `${document.name || document.originalName} será removido quando os dados da empresa forem salvos.`,
      type: 'error',
      confirmLabel: 'Remover documento',
    });
    if (!confirmed) return;
    updateDocument(document.key, { removed: true });
  }

  async function syncDocuments(companyId: number) {
    for (const document of documents) {
      if (document.id) {
        if (document.removed) {
          await companyProfileService.removeDocument(companyId, document.id);
          continue;
        }
        if (document.name.trim() !== document.originalSavedName.trim()) {
          await companyProfileService.renameDocument(companyId, document.id, document.name.trim());
        }
        continue;
      }

      if (!document.removed && document.file) {
        await companyProfileService.uploadDocument(companyId, document.name.trim(), document.file);
      }
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.legalName.trim().length < 2) {
      notifications.warning('Razão social obrigatória', 'Informe a razão social da empresa antes de salvar.');
      return;
    }

    const invalidDocument = visibleDocuments.find((document) => document.name.trim().length < 2);
    if (invalidDocument) {
      notifications.warning('Revise os documentos', 'Informe um nome para cada documento adicionado.');
      return;
    }

    const withoutFile = visibleDocuments.find((document) => !document.id && !document.file);
    if (withoutFile) {
      notifications.warning('Arquivo não selecionado', 'Selecione o arquivo de cada novo documento antes de salvar.');
      return;
    }

    const tooLarge = visibleDocuments.find((document) => document.file && document.file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      notifications.warning('Arquivo muito grande', `${tooLarge.name || 'O documento'} deve possuir no máximo 10 MB.`);
      return;
    }

    setSaving(true);
    try {
      const result = await companyProfileService.save(form);
      let documentError: unknown = null;
      try {
        await syncDocuments(result.company.id);
      } catch (error) {
        documentError = error;
      }

      const refreshed = await companyProfileService.get();
      if (refreshed) {
        setCompany(refreshed);
        setForm(formFromCompany(refreshed));
        setDocuments(refreshed.documents.map(draftFromDocument));
      }

      notifications.success('Dados da empresa salvos', result.message);
      if (documentError) {
        const feedback = getApiErrorFeedback(documentError, 'Os dados foram salvos, mas um dos anexos ficou pendente.');
        notifications.warning('Anexo pendente', feedback.message, feedback.details);
      }
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar os dados da empresa.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  async function downloadDocument(document: DocumentDraft) {
    if (!company || !document.id) return;
    const stored = company.documents.find((item) => item.id === document.id);
    if (!stored) return;
    try {
      await companyProfileService.downloadDocument(company.id, stored);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível baixar o documento.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    }
  }

  if (loading) {
    return <LoadingState>Carregando dados da empresa...</LoadingState>;
  }

  return (
    <Page>
      <HeaderCard>
        <HeaderIdentity>
          <CompanyIcon><Building2 size={27} /></CompanyIcon>
          <HeaderText>
            <h1>Dados da empresa</h1>
            <p>Centralize informações cadastrais, fiscais, contatos, endereço e documentos da empresa.</p>
          </HeaderText>
        </HeaderIdentity>
        <HeaderAside>
          <Button
            type="button"
            onClick={() => documentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            title="Ir para documentos e anexos"
          >
            <Paperclip size={16} /> Ver anexos{visibleDocuments.length > 0 ? ` (${visibleDocuments.length})` : ''}
          </Button>
          <HeaderMeta>
            <strong>{form.tradeName || form.legalName || 'Empresa ainda não cadastrada'}</strong>
            <span>{form.cnpj || 'CNPJ não informado'}</span>
            {company?.updatedAt ? <span>Última atualização: {new Date(company.updatedAt).toLocaleString('pt-BR')}</span> : null}
          </HeaderMeta>
        </HeaderAside>
      </HeaderCard>

      <Form onSubmit={handleSave}>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <span><Landmark size={19} /></span>
              <div><h2>Identificação e dados fiscais</h2><p>Informações principais para cadastros, documentos e relatórios.</p></div>
            </SectionTitle>
          </SectionHeader>
          <Grid>
            <Field $span={2}>Razão social *<Input value={form.legalName} onChange={(e) => change('legalName', e.target.value)} maxLength={180} required /></Field>
            <Field>Nome fantasia<Input value={form.tradeName} onChange={(e) => change('tradeName', e.target.value)} maxLength={180} /></Field>
            <Field>CNPJ<Input value={form.cnpj} onChange={(e) => change('cnpj', maskCnpj(e.target.value))} inputMode="numeric" placeholder="00.000.000/0000-00" /></Field>
            <Field>Inscrição estadual<Input value={form.stateRegistration} onChange={(e) => change('stateRegistration', e.target.value)} /></Field>
            <Field>Inscrição municipal<Input value={form.municipalRegistration} onChange={(e) => change('municipalRegistration', e.target.value)} /></Field>
            <Field>RNTRC / ANTT<Input value={form.rntrc} onChange={(e) => change('rntrc', e.target.value)} placeholder="Ex.: 045829170" /></Field>
            <Field>Data de abertura<Input type="date" value={form.openingDate} onChange={(e) => change('openingDate', e.target.value)} /></Field>
            <Field>Regime tributário<Select value={form.taxRegime} onChange={(e) => change('taxRegime', e.target.value)}><option value="">Selecione</option><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option><option>MEI</option><option>Outro</option></Select></Field>
          </Grid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <span><Phone size={19} /></span>
              <div><h2>Contatos</h2><p>Canais oficiais da empresa para comunicação administrativa e operacional.</p></div>
            </SectionTitle>
          </SectionHeader>
          <Grid>
            <Field>E-mail 1<Input type="email" value={form.email} onChange={(e) => change('email', e.target.value)} placeholder="financeiro@empresa.com.br" /></Field>
            <Field>E-mail 2<Input type="email" value={form.emailSecondary} onChange={(e) => change('emailSecondary', e.target.value)} placeholder="operacional@empresa.com.br" /></Field>
            <Field>Telefone<Input value={form.phone} onChange={(e) => change('phone', maskPhone(e.target.value))} inputMode="tel" placeholder="(00) 0000-0000" /></Field>
            <Field>WhatsApp<Input value={form.whatsapp} onChange={(e) => change('whatsapp', maskPhone(e.target.value))} inputMode="tel" placeholder="(00) 00000-0000" /></Field>
          </Grid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <span><MapPin size={19} /></span>
              <div><h2>Endereço</h2><p>Endereço da sede ou unidade principal da empresa.</p></div>
            </SectionTitle>
          </SectionHeader>
          <Grid>
            <Field>CEP<Input value={form.postalCode} onChange={(e) => change('postalCode', maskPostalCode(e.target.value))} inputMode="numeric" placeholder="00000-000" /></Field>
            <Field $span={2}>Rua / Avenida<Input value={form.street} onChange={(e) => change('street', e.target.value)} /></Field>
            <Field>Número<Input value={form.number} onChange={(e) => change('number', e.target.value)} /></Field>
            <Field>Complemento<Input value={form.complement} onChange={(e) => change('complement', e.target.value)} /></Field>
            <Field>Bairro<Input value={form.neighborhood} onChange={(e) => change('neighborhood', e.target.value)} /></Field>
            <Field $span={2}>Cidade<Input value={form.city} onChange={(e) => change('city', e.target.value)} /></Field>
            <Field>UF<Input value={form.state} onChange={(e) => change('state', e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))} maxLength={2} placeholder="SC" /></Field>
          </Grid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <span><UserRound size={19} /></span>
              <div><h2>Responsável legal 1</h2><p>Primeiro responsável de referência para assuntos administrativos e cadastrais.</p></div>
            </SectionTitle>
          </SectionHeader>
          <Grid>
            <Field $span={2}>Nome do responsável<Input value={form.responsibleName} onChange={(e) => change('responsibleName', e.target.value)} /></Field>
            <Field>CPF<Input value={form.responsibleCpf} onChange={(e) => change('responsibleCpf', maskCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" /></Field>
            <Field>Telefone<Input value={form.responsiblePhone} onChange={(e) => change('responsiblePhone', maskPhone(e.target.value))} inputMode="tel" /></Field>
            <Field $span={2}>E-mail<Input type="email" value={form.responsibleEmail} onChange={(e) => change('responsibleEmail', e.target.value)} /></Field>
          </Grid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <span><UserRound size={19} /></span>
              <div><h2>Responsável legal 2</h2><p>Segundo responsável de referência da empresa, quando houver.</p></div>
            </SectionTitle>
          </SectionHeader>
          <Grid>
            <Field $span={2}>Nome do responsável<Input value={form.responsibleTwoName} onChange={(e) => change('responsibleTwoName', e.target.value)} /></Field>
            <Field>CPF<Input value={form.responsibleTwoCpf} onChange={(e) => change('responsibleTwoCpf', maskCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" /></Field>
            <Field>Telefone<Input value={form.responsibleTwoPhone} onChange={(e) => change('responsibleTwoPhone', maskPhone(e.target.value))} inputMode="tel" /></Field>
            <Field $span={2}>E-mail<Input type="email" value={form.responsibleTwoEmail} onChange={(e) => change('responsibleTwoEmail', e.target.value)} /></Field>
          </Grid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <span><ClipboardList size={19} /></span>
              <div><h2>Observações</h2><p>Informações complementares importantes para o cadastro.</p></div>
            </SectionTitle>
          </SectionHeader>
          <Textarea value={form.notes} onChange={(e) => change('notes', e.target.value)} maxLength={5000} placeholder="Informações adicionais sobre a empresa..." />
        </Section>

        <Section ref={documentsSectionRef}>
          <SectionHeader>
            <SectionTitle>
              <span><Paperclip size={19} /></span>
              <div><h2>Documentos e anexos</h2><p>Cartão CNPJ, contrato social, RNTRC, licenças, certificados e demais documentos.</p></div>
            </SectionTitle>
            <Button type="button" onClick={addDocument}><FilePlus2 size={16} /> Adicionar documento</Button>
          </SectionHeader>

          <DocumentsGrid>
            {visibleDocuments.length === 0 ? (
              <EmptyDocuments><div><FileText size={25} /><br />Nenhum documento anexado.<br />Use “Adicionar documento” para incluir um arquivo.</div></EmptyDocuments>
            ) : visibleDocuments.map((document) => (
              <DocumentCard key={document.key}>
                <DocumentTop>
                  <DocumentIcon><FileText size={18} /></DocumentIcon>
                  <DocumentInfo>
                    <strong>{document.name || 'Novo documento'}</strong>
                    <span>{document.file?.name || document.originalName || 'Arquivo ainda não selecionado'}{document.file ? ` • ${formatBytes(document.file.size)}` : document.sizeBytes ? ` • ${formatBytes(document.sizeBytes)}` : ''}</span>
                  </DocumentInfo>
                </DocumentTop>

                <Field>Nome do documento<Input value={document.name} onChange={(e) => updateDocument(document.key, { name: e.target.value })} placeholder="Ex.: Cartão CNPJ" /></Field>

                {!document.id ? (
                  <FileInputLabel>
                    <UploadCloud size={16} /> {document.file ? 'Trocar arquivo' : 'Selecionar arquivo'}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={(e) => updateDocument(document.key, { file: e.target.files?.[0] ?? null })} />
                  </FileInputLabel>
                ) : null}

                <DocumentActions>
                  {document.id ? <Button type="button" onClick={() => void downloadDocument(document)}><Download size={15} /> Baixar</Button> : null}
                  <Button type="button" $variant="danger" onClick={() => void requestRemoveDocument(document)}><Trash2 size={15} /> Remover</Button>
                </DocumentActions>
              </DocumentCard>
            ))}
          </DocumentsGrid>
          <HelperText>Formatos aceitos: PDF, JPG, PNG, Word e Excel. Limite de 10 MB por arquivo. Para substituir um arquivo existente, remova-o e adicione o novo.</HelperText>
        </Section>

        <ActionBar>
          <Button type="submit" $variant="primary" disabled={saving}><Save size={17} /> {saving ? 'Salvando...' : 'Salvar dados da empresa'}</Button>
        </ActionBar>
      </Form>
    </Page>
  );
}

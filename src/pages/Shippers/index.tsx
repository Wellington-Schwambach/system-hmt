import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardPenLine,
  Download,
  FilePlus2,
  FileText,
  List,
  Paperclip,
  Pencil,
  PencilLine,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { shipperService } from './services';
import type {
  ShipperDocumentRecord,
  ShipperFormData,
  ShipperRecord,
  ShipperStatus,
  ShipperTab,
} from './types';
import {
  Actions,
  Card,
  CardHeader,
  ColorBadge,
  ColorButton,
  ColorField,
  ColorInput,
  CountBadge,
  DocumentActions,
  DocumentFile,
  DocumentGrid,
  DocumentHint,
  DocumentNameShell,
  DocumentRow,
  DocumentsHeader,
  DocumentsSection,
  Empty,
  Field,
  Filters,
  Form,
  FormGrid,
  IconButton,
  Input,
  Meta,
  Page,
  PageActions,
  PageButton,
  PageSize,
  Pagination,
  Palette,
  Preview,
  PrimaryButton,
  RowActions,
  SearchIcon,
  SearchInput,
  SearchShell,
  SecondaryButton,
  Select,
  StatusBadge,
  TabButton,
  Table,
  TableWrap,
  Tabs,
  Td,
  Th,
  Toolbar,
} from './styles';

const PALETTE = ['#2563EB', '#16A34A', '#7C3AED', '#EA580C', '#0891B2', '#DC2626', '#CA8A04', '#0F766E', '#C026D3', '#4F46E5'];
const EMPTY_FORM: ShipperFormData = {
  name: '',
  displayColor: '#16A34A',
  receiptTermDays: '',
  status: 'ACTIVE',
};

interface DocumentDraft {
  key: string;
  id: number | null;
  name: string;
  originalName: string;
  originalSavedName: string;
  file: File | null;
  removed: boolean;
}

function createDocumentDraft(document?: ShipperDocumentRecord): DocumentDraft {
  return {
    key: document ? `stored-${document.id}` : `new-${crypto.randomUUID()}`,
    id: document?.id ?? null,
    name: document?.name ?? '',
    originalName: document?.originalName ?? '',
    originalSavedName: document?.name ?? '',
    file: null,
    removed: false,
  };
}

function contrastText(hex: string): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#FFFFFF';
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 165 ? '#172235' : '#FFFFFF';
}

export function Shippers() {
  const notifications = useNotifications();
  const [records, setRecords] = useState<ShipperRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ShipperTab>('LIST');
  const [editing, setEditing] = useState<ShipperRecord | null>(null);
  const [form, setForm] = useState<ShipperFormData>(EMPTY_FORM);
  const [documents, setDocuments] = useState<DocumentDraft[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ShipperStatus>('ACTIVE');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function reloadRecords(): Promise<ShipperRecord[]> {
    const items = await shipperService.list();
    setRecords(items);
    return items;
  }

  useEffect(() => {
    let active = true;

    shipperService
      .list()
      .then((items) => {
        if (active) setRecords(items);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os embarcadores.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notifications]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return records.filter((record) => {
      const matchStatus = status === 'ALL' || record.status === status;
      const matchSearch = term === '' || record.name.toLocaleLowerCase('pt-BR').includes(term);
      return matchStatus && matchSearch;
    });
  }, [records, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visiblePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);
  const first = filtered.length === 0 ? 0 : (visiblePage - 1) * pageSize + 1;
  const last = Math.min(visiblePage * pageSize, filtered.length);

  function resetForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDocuments([]);
  }

  function startCreate() {
    resetForm();
    setActiveTab('FORM');
  }

  function startEdit(record: ShipperRecord) {
    setEditing(record);
    setForm({
      name: record.name,
      displayColor: record.displayColor,
      receiptTermDays: record.receiptTermDays === null ? '' : String(record.receiptTermDays),
      status: record.status,
    });
    setDocuments(record.documents.map(createDocumentDraft));
    setActiveTab('FORM');
  }

  function addDocumentRow() {
    setDocuments((current) => [...current, createDocumentDraft()]);
  }

  function updateDocumentDraft(key: string, patch: Partial<DocumentDraft>) {
    setDocuments((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeDocumentRow(key: string) {
    setDocuments((current) =>
      current
        .map((item) => (item.key === key && item.id ? { ...item, removed: true } : item))
        .filter((item) => item.key !== key || item.id !== null),
    );
  }

  async function syncDocuments(shipperId: number): Promise<void> {
    for (const draft of documents) {
      if (draft.id) {
        if (draft.removed) {
          await shipperService.removeDocument(shipperId, draft.id);
          continue;
        }

        if (draft.name.trim() !== draft.originalSavedName.trim()) {
          await shipperService.renameDocument(shipperId, draft.id, draft.name.trim());
        }
        continue;
      }

      if (!draft.removed && draft.file) {
        await shipperService.uploadDocument(shipperId, draft.name.trim(), draft.file);
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const activeDocuments = documents.filter((document) => !document.removed);
    const invalidDocument = activeDocuments.find((document) => document.name.trim().length < 2);
    if (invalidDocument) {
      notifications.warning('Revise os documentos', 'Informe um nome para cada documento adicionado.');
      return;
    }

    const newWithoutFile = activeDocuments.find((document) => !document.id && !document.file);
    if (newWithoutFile) {
      notifications.warning('Arquivo não selecionado', 'Selecione o arquivo de cada novo documento antes de salvar.');
      return;
    }

    const tooLarge = activeDocuments.find((document) => document.file && document.file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      notifications.warning('Arquivo muito grande', `${tooLarge.name || 'O documento'} deve possuir no máximo 10 MB.`);
      return;
    }

    setSaving(true);

    try {
      const result = editing
        ? await shipperService.update(editing.id, form)
        : await shipperService.create(form);

      let documentError: unknown = null;
      try {
        await syncDocuments(result.shipper.id);
      } catch (error) {
        documentError = error;
      }

      await reloadRecords();
      notifications.success(editing ? 'Embarcador atualizado' : 'Embarcador cadastrado', result.message);

      if (documentError) {
        const feedback = getApiErrorFeedback(
          documentError,
          'O cadastro foi salvo, mas um dos documentos não pôde ser atualizado. Abra o embarcador e tente anexar novamente.',
        );
        notifications.warning('Documento pendente', feedback.message, feedback.details);
      }

      resetForm();
      setActiveTab('LIST');
      setPage(1);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o embarcador.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadDocument(record: ShipperRecord, document: ShipperDocumentRecord) {
    try {
      await shipperService.downloadDocument(record.id, document);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível baixar o documento.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    }
  }

  async function handleDelete(record: ShipperRecord) {
    const confirmed = await notifications.confirm({
      title: 'Excluir embarcador?',
      message: record.travelsCount > 0
        ? `${record.name} possui ${record.travelsCount} viagem(ns) vinculada(s). O sistema não permitirá apagar o histórico.`
        : `${record.name} e seus documentos serão removidos permanentemente.`,
      details: record.travelsCount > 0 ? ['Para preservar as viagens, prefira alterar o status para Inativo.'] : undefined,
      type: 'error',
      confirmLabel: 'Excluir embarcador',
    });
    if (!confirmed) return;

    setDeletingId(record.id);
    try {
      await shipperService.remove(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      notifications.success('Embarcador excluído', `${record.name} foi removido.`);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível excluir o embarcador.');
      notifications.warning(feedback.title, feedback.message, feedback.details);
    } finally {
      setDeletingId(null);
    }
  }

  const previewText = contrastText(form.displayColor);

  return (
    <Page>
      <Tabs aria-label="Navegação do cadastro de embarcadores">
        <TabButton type="button" $active={activeTab === 'FORM'} onClick={startCreate}>
          <ClipboardPenLine size={18} /> Cadastro
        </TabButton>
        <TabButton type="button" $active={activeTab === 'LIST'} onClick={() => setActiveTab('LIST')}>
          <List size={18} /> Listagem de embarcadores <CountBadge>{records.length}</CountBadge>
        </TabButton>
      </Tabs>

      {activeTab === 'FORM' ? (
        <Card>
          <CardHeader>
            <div>
              <h2>{editing ? 'Editar embarcador' : 'Novo embarcador'}</h2>
              <p>Defina identificação, prazo de recebimento e manuais/documentos próprios do embarcador.</p>
            </div>
          </CardHeader>
          <Form onSubmit={handleSubmit}>
            <FormGrid>
              <Field>
                Nome
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex.: Aurora"
                  maxLength={100}
                  autoFocus
                />
              </Field>

              <Field>
                Prazo de recebimento (dias)
                <Input
                  type="number"
                  min={0}
                  max={3650}
                  value={form.receiptTermDays}
                  onChange={(event) => setForm((current) => ({ ...current, receiptTermDays: event.target.value }))}
                  placeholder="Ex.: 45"
                />
              </Field>

              <Field>
                Status
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ShipperStatus }))}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </Select>
              </Field>

              <Field>
                Cor de identificação
                <ColorField>
                  <ColorInput
                    type="color"
                    value={form.displayColor}
                    onChange={(event) => setForm((current) => ({ ...current, displayColor: event.target.value.toUpperCase() }))}
                    aria-label="Selecionar cor do embarcador"
                  />
                  <Preview $color={form.displayColor} $textColor={previewText}>{form.name.trim() || 'Prévia'}</Preview>
                </ColorField>
              </Field>
            </FormGrid>

            <Field>
              Cores rápidas
              <Palette>
                {PALETTE.map((color) => (
                  <ColorButton
                    key={color}
                    type="button"
                    $color={color}
                    $selected={form.displayColor === color}
                    onClick={() => setForm((current) => ({ ...current, displayColor: color }))}
                    aria-label={`Usar cor ${color}`}
                    title={color}
                  />
                ))}
              </Palette>
            </Field>

            <DocumentsSection>
              <DocumentsHeader>
                <div>
                  <strong>Manuais e documentos</strong>
                  <span>Adicione quantos arquivos forem necessários e dê um nome claro para cada um.</span>
                </div>
                <SecondaryButton type="button" onClick={addDocumentRow}>
                  <FilePlus2 size={16} /> Adicionar documento
                </SecondaryButton>
              </DocumentsHeader>

              {documents.filter((document) => !document.removed).length === 0 ? (
                <DocumentHint><Paperclip size={17} /> Nenhum documento adicionado.</DocumentHint>
              ) : (
                <DocumentGrid>
                  {documents.filter((document) => !document.removed).map((document) => (
                    <DocumentRow key={document.key}>
                      <DocumentNameShell>
                        <PencilLine size={16} />
                        <Input
                          value={document.name}
                          onChange={(event) => updateDocumentDraft(document.key, { name: event.target.value })}
                          placeholder="Nome do documento. Ex.: Manual de agendamento"
                          maxLength={120}
                        />
                      </DocumentNameShell>

                      {document.id ? (
                        <DocumentFile>
                          <FileText size={16} />
                          <span title={document.originalName}>{document.originalName}</span>
                        </DocumentFile>
                      ) : (
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                          onChange={(event) => updateDocumentDraft(document.key, { file: event.target.files?.[0] ?? null })}
                        />
                      )}

                      <DocumentActions>
                        {document.id && editing ? (
                          <IconButton
                            type="button"
                            title="Baixar documento"
                            onClick={() => {
                              const stored = editing.documents.find((item) => item.id === document.id);
                              if (stored) void handleDownloadDocument(editing, stored);
                            }}
                          >
                            <Download size={16} />
                          </IconButton>
                        ) : null}
                        <IconButton $danger type="button" title="Remover documento" onClick={() => removeDocumentRow(document.key)}>
                          <X size={16} />
                        </IconButton>
                      </DocumentActions>
                    </DocumentRow>
                  ))}
                </DocumentGrid>
              )}
              <DocumentHint>PDF, JPG, PNG, Word ou Excel, com até 10 MB por arquivo.</DocumentHint>
            </DocumentsSection>

            <Actions>
              <SecondaryButton type="button" onClick={() => { resetForm(); setActiveTab('LIST'); }}>Cancelar</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving || form.name.trim().length < 2}>
                <Save size={17} /> {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar embarcador'}
              </PrimaryButton>
            </Actions>
          </Form>
        </Card>
      ) : (
        <Card>
          <Toolbar>
            <Filters>
              <SearchShell>
                <SearchIcon><Search size={17} /></SearchIcon>
                <SearchInput
                  type="search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                  placeholder="Buscar embarcador pelo nome..."
                  aria-label="Buscar embarcadores"
                />
              </SearchShell>
              <Select value={status} onChange={(event) => { setStatus(event.target.value as 'ALL' | ShipperStatus); setPage(1); }}>
                <option value="ACTIVE">Ativos</option>
                <option value="INACTIVE">Inativos</option>
                <option value="ALL">Todos</option>
              </Select>
            </Filters>
            <PrimaryButton type="button" onClick={startCreate}><Plus size={18} /> Novo embarcador</PrimaryButton>
          </Toolbar>

          <Meta>
            <span>{loading ? 'Carregando embarcadores...' : `${first}-${last} de ${filtered.length} embarcador(es) no filtro atual`}</span>
            <span>{records.length} cadastrado(s) no total</span>
          </Meta>

          {!loading && filtered.length === 0 ? (
            <Empty><Building2 size={38} /><p>Nenhum embarcador encontrado.</p></Empty>
          ) : (
            <>
              <TableWrap>
                <Table>
                  <thead><tr><Th>Nome</Th><Th>Cor</Th><Th>Recebimento</Th><Th>Documentos</Th><Th>Status</Th><Th>Viagens</Th><Th>Ações</Th></tr></thead>
                  <tbody>
                    {visibleRecords.map((record) => {
                      const textColor = contrastText(record.displayColor);
                      return (
                        <tr key={record.id}>
                          <Td><strong>{record.name}</strong></Td>
                          <Td><ColorBadge $color={record.displayColor} $textColor={textColor}>{record.name}</ColorBadge></Td>
                          <Td>{record.receiptTermDays === null ? '-' : `${record.receiptTermDays} dia(s)`}</Td>
                          <Td>{record.documents.length > 0 ? `${record.documents.length} arquivo(s)` : '-'}</Td>
                          <Td><StatusBadge $active={record.status === 'ACTIVE'}>{record.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</StatusBadge></Td>
                          <Td>{record.travelsCount}</Td>
                          <Td>
                            <RowActions>
                              <IconButton type="button" onClick={() => startEdit(record)} title="Editar embarcador"><Pencil size={16} /></IconButton>
                              <IconButton $danger type="button" onClick={() => void handleDelete(record)} disabled={deletingId === record.id} title="Excluir embarcador"><Trash2 size={16} /></IconButton>
                            </RowActions>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrap>
              <Pagination>
                <span>Página {visiblePage} de {totalPages}</span>
                <PageActions>
                  <PageSize value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Quantidade por página">
                    <option value={10}>10 por página</option><option value={25}>25 por página</option><option value={50}>50 por página</option>
                  </PageSize>
                  <PageButton type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={visiblePage <= 1}><ChevronLeft size={16} /></PageButton>
                  <PageButton type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={visiblePage >= totalPages}><ChevronRight size={16} /></PageButton>
                </PageActions>
              </Pagination>
            </>
          )}
        </Card>
      )}
    </Page>
  );
}

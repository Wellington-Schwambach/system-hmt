import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Building2, ChevronLeft, ChevronRight, ClipboardPenLine, List, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';

import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { shipperService } from './services';
import type { ShipperFormData, ShipperRecord, ShipperStatus, ShipperTab } from './types';
import {
  Actions,
  Card,
  CardHeader,
  ColorBadge,
  ColorButton,
  ColorField,
  ColorInput,
  CountBadge,
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
const EMPTY_FORM: ShipperFormData = { name: '', displayColor: '#16A34A', status: 'ACTIVE' };

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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ShipperStatus>('ACTIVE');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setActiveTab('FORM');
  }

  function startEdit(record: ShipperRecord) {
    setEditing(record);
    setForm({ name: record.name, displayColor: record.displayColor, status: record.status });
    setActiveTab('FORM');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = editing
        ? await shipperService.update(editing.id, form)
        : await shipperService.create(form);

      setRecords((current) => {
        const next = editing
          ? current.map((item) => (item.id === result.shipper.id ? result.shipper : item))
          : [...current, result.shipper];
        return next.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      });
      notifications.success(editing ? 'Embarcador atualizado' : 'Embarcador cadastrado', result.message);
      setEditing(null);
      setForm(EMPTY_FORM);
      setActiveTab('LIST');
      setPage(1);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível salvar o embarcador.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record: ShipperRecord) {
    const confirmed = await notifications.confirm({
      title: 'Excluir embarcador?',
      message: record.travelsCount > 0
        ? `${record.name} possui ${record.travelsCount} viagem(ns) vinculada(s). O sistema não permitirá apagar o histórico.`
        : `${record.name} será removido permanentemente.`,
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
              <p>Defina o nome, a situação e a cor usada para identificar o embarcador no sistema.</p>
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

              <Field>
                Status
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ShipperStatus }))}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </Select>
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

            <Actions>
              <SecondaryButton type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setActiveTab('LIST'); }}>Cancelar</SecondaryButton>
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
                  <thead><tr><Th>Nome</Th><Th>Cor</Th><Th>Status</Th><Th>Viagens</Th><Th>Ações</Th></tr></thead>
                  <tbody>
                    {visibleRecords.map((record) => {
                      const textColor = contrastText(record.displayColor);
                      return (
                        <tr key={record.id}>
                          <Td><strong>{record.name}</strong></Td>
                          <Td><ColorBadge $color={record.displayColor} $textColor={textColor}>{record.name}</ColorBadge></Td>
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

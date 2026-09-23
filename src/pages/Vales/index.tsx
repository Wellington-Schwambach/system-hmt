import { useEffect, useMemo, useState } from 'react';
import { Check, CircleCheckBig, Edit3, Plus, ReceiptText, Save, Trash2, X } from 'lucide-react';

import { DateInput } from '../../components/DateInput';
import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorMessage } from '../../utils/apiError';
import { valeService } from './services';
import type { ValeCategory, ValeEmployeeOption, ValeFormData, ValeHistoryEvent, ValeRecord } from './types';
import {
  Actions,
  Badge,
  Empty,
  Field,
  FilterField,
  FilterGroup,
  FilterButton,
  Filters,
  Form,
  FormGrid,
  Header,
  HistoryItem,
  HistoryList,
  IconButton,
  Input,
  InvoiceButton,
  InvoicedLabel,
  Modal,
  ModalActions,
  ModalHeader,
  Overlay,
  Page,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TabButton,
  Table,
  TableWrap,
  Tabs,
  Textarea,
  Title,
  TitleGroup,
} from './styles';

const CATEGORY_LABELS: Record<ValeCategory, string> = {
  ADVANCE: 'Vale',
  FINE: 'Multa',
  OTHER_DISCOUNT: 'Outro desconto',
};

function todayValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function currentMonthRange(): { start: string; end: string } {
  const today = todayValue();
  const [year, month] = today.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${String(month).padStart(2, '0')}-01`,
    end: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

const INITIAL_FORM: ValeFormData = {
  employeeId: '',
  category: 'ADVANCE',
  date: todayValue(),
  description: '',
  amount: '',
  installments: '1',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function eventLabel(action: ValeHistoryEvent['action']): string {
  return ({
    CREATED: 'Criado',
    UPDATED: 'Editado',
    DELETED: 'Excluído',
    SETTLED: 'Aplicado no acerto',
    REOPENED: 'Liberado do acerto',
    INVOICED: 'Faturado',
  })[action];
}

export function Vales() {
  const notifications = useNotifications();
  const { user } = useAuth();
  const isAdministrator = user?.role?.trim().toLocaleLowerCase('pt-BR') === 'administrador';
  const monthRange = useMemo(() => currentMonthRange(), []);
  const [records, setRecords] = useState<ValeRecord[]>([]);
  const [employees, setEmployees] = useState<ValeEmployeeOption[]>([]);
  const [history, setHistory] = useState<ValeHistoryEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'LIST' | 'HISTORY'>('LIST');
  const [driverFilter, setDriverFilter] = useState('ALL');
  const [invoiceFilter, setInvoiceFilter] = useState<'ALL' | 'N' | 'F'>('ALL');
  const [dateFrom, setDateFrom] = useState(monthRange.start);
  const [dateTo, setDateTo] = useState(monthRange.end);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ValeRecord | null>(null);
  const [form, setForm] = useState<ValeFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [invoicingId, setInvoicingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([valeService.list(), valeService.options()])
      .then(([loadedRecords, loadedEmployees]) => {
        if (!active) return;
        setRecords(loadedRecords);
        setEmployees(loadedEmployees);
      })
      .catch((error) => {
        if (!active) return;
        notifications.error('Não foi possível carregar os vales', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
      });

    return () => {
      active = false;
    };
  }, [notifications]);

  const filtered = useMemo(() => records.filter((record) => {
    if (driverFilter !== 'ALL' && record.employeeId !== Number(driverFilter)) return false;
    if (dateFrom && record.date < dateFrom) return false;
    if (dateTo && record.date > dateTo) return false;
    if (invoiceFilter === 'N' && record.invoiced) return false;
    if (invoiceFilter === 'F' && !record.invoiced) return false;
    return true;
  }), [dateFrom, dateTo, driverFilter, invoiceFilter, records]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...INITIAL_FORM,
      date: todayValue(),
      employeeId: driverFilter !== 'ALL' ? driverFilter : employees[0] ? String(employees[0].id) : '',
    });
    setIsModalOpen(true);
  }

  function openEdit(record: ValeRecord) {
    if (!record.canEdit) return;
    setEditing(record);
    setForm({
      employeeId: String(record.employeeId),
      category: record.category,
      date: record.date,
      description: record.description,
      amount: String(record.amount).replace('.', ','),
      installments: String(record.installmentsTotal),
    });
    setIsModalOpen(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount.trim().replace(/\./g, '').replace(',', '.'));
    const installments = Number(form.installments);

    if (!form.employeeId || !form.date || !Number.isFinite(amount) || amount <= 0) {
      notifications.warning('Dados incompletos', 'Informe motorista, data e um valor maior que zero.');
      return;
    }

    if (!editing && (!Number.isInteger(installments) || installments < 1 || installments > 60)) {
      notifications.warning('Parcelas inválidas', 'Informe entre 1 e 60 parcelas.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const saved = await valeService.update(editing.id, form);
        setRecords((current) => current.map((item) => (item.id === saved.id ? saved : item)));
        notifications.success('Parcela atualizada', `${CATEGORY_LABELS[saved.category]} de ${saved.employeeName} atualizado com sucesso.`);
      } else {
        const created = await valeService.create(form);
        const refreshed = await valeService.list();
        setRecords(refreshed);
        notifications.success(
          created.length > 1 ? 'Parcelas gravadas' : 'Vale gravado',
          created.length > 1
            ? `${created.length} parcelas foram geradas para ${created[0]?.employeeName ?? 'o motorista'}.`
            : `${CATEGORY_LABELS[created[0]?.category ?? form.category]} gravado com sucesso.`,
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      notifications.error('Não foi possível salvar', getApiErrorMessage(error, 'Confira os dados e tente novamente.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleInvoice(record: ValeRecord) {
    if (record.invoiced) return;
    const confirmed = await notifications.confirm({
      title: 'Faturar parcela?',
      message: `${record.employeeName} · Parcela ${record.installmentNumber}/${record.installmentsTotal} · ${formatCurrency(record.amount)}. Será marcada como faturada sem alterar o desconto do motorista.`,
      type: 'info',
      confirmLabel: 'Faturar',
    });
    if (!confirmed) return;

    setInvoicingId(record.id);
    try {
      const updated = await valeService.invoice(record.id);
      setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      notifications.success('Parcela faturada', `O faturamento de ${record.employeeName} foi registrado.`);
    } catch (error) {
      notifications.error('Não foi possível faturar', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
    } finally {
      setInvoicingId(null);
    }
  }

  async function handleDelete(record: ValeRecord) {
    if (!record.canEdit) return;
    const confirmed = await notifications.confirm({
      title: 'Excluir parcela?',
      message: `${CATEGORY_LABELS[record.category]} de ${record.employeeName}, parcela ${record.installmentNumber}/${record.installmentsTotal}, no valor de ${formatCurrency(record.amount)}, será removido.`,
      type: 'error',
      confirmLabel: 'Excluir',
    });
    if (!confirmed) return;

    try {
      await valeService.remove(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      notifications.success('Parcela excluída', 'O registro foi removido.');
    } catch (error) {
      notifications.error('Não foi possível excluir', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
    }
  }

  async function openHistory() {
    setActiveTab('HISTORY');
    try {
      setHistory(await valeService.history());
    } catch (error) {
      notifications.error('Não foi possível carregar o histórico', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
    }
  }

  return (
    <Page>
      <Header>
        <TitleGroup>
          <Title>Vales</Title>
        </TitleGroup>
        <PrimaryButton type="button" onClick={openCreate}>
          <Plus size={16} /> Novo vale
        </PrimaryButton>
      </Header>

      <Panel>
        <Tabs>
          <TabButton type="button" $active={activeTab === 'LIST'} onClick={() => setActiveTab('LIST')}><ReceiptText size={14} /> Lançamentos</TabButton>
          {isAdministrator && <TabButton type="button" $active={activeTab === 'HISTORY'} onClick={openHistory}>Histórico ADM</TabButton>}
        </Tabs>

        {activeTab === 'LIST' ? (
          <>
            <Filters>
              <FilterField>
                <span>Motorista</span>
                <Select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
                  <option value="ALL">Todos os motoristas</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </Select>
              </FilterField>
              <FilterField>
                <span>De</span>
                <DateInput value={dateFrom} onValueChange={setDateFrom} />
              </FilterField>
              <FilterField>
                <span>Até</span>
                <DateInput value={dateTo} onValueChange={setDateTo} />
              </FilterField>
              <FilterGroup aria-label="Filtrar vales por faturamento">
                <FilterButton type="button" $active={invoiceFilter === 'ALL'} onClick={() => setInvoiceFilter('ALL')}>Todos</FilterButton>
                <FilterButton type="button" $active={invoiceFilter === 'N'} onClick={() => setInvoiceFilter('N')}>Não faturado</FilterButton>
                <FilterButton type="button" $active={invoiceFilter === 'F'} onClick={() => setInvoiceFilter('F')}>Faturado</FilterButton>
              </FilterGroup>
              <SecondaryButton
                type="button"
                onClick={() => {
                  setDriverFilter('ALL');
                  setDateFrom('');
                  setDateTo('');
                  setInvoiceFilter('ALL');
                }}
              >
                Limpar filtros
              </SecondaryButton>
            </Filters>

            {filtered.length === 0 ? <Empty>Nenhum vale encontrado para os filtros informados.</Empty> : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Motorista</th>
                      <th>Categoria</th>
                      <th>Descrição</th>
                      <th>Parcela</th>
                      <th>Valor</th>
                      <th>Faturar</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => (
                      <tr key={record.id}>
                        <td>{formatDate(record.date)}</td>
                        <td><strong>{record.employeeName}</strong></td>
                        <td><Badge $tone="neutral">{CATEGORY_LABELS[record.category]}</Badge></td>
                        <td>{record.description || '-'}</td>
                        <td><strong>{record.installmentNumber}/{record.installmentsTotal}</strong></td>
                        <td><strong>{formatCurrency(record.amount)}</strong></td>
                        <td>
                          {record.invoiced ? (
                            <InvoicedLabel><Check size={14} /> Faturado</InvoicedLabel>
                          ) : (
                            <InvoiceButton
                              type="button"
                              onClick={() => void handleInvoice(record)}
                              disabled={invoicingId === record.id}
                              title="Faturar esta parcela"
                            >
                              <CircleCheckBig size={15} /> Faturar
                            </InvoiceButton>
                          )}
                        </td>
                        <td>
                          <Actions>
                            <IconButton type="button" onClick={() => openEdit(record)} disabled={!record.canEdit} aria-label="Editar" title={record.canEdit ? 'Editar parcela' : 'Parcela bloqueada para edição'}><Edit3 size={14} /></IconButton>
                            <IconButton type="button" onClick={() => void handleDelete(record)} disabled={!record.canEdit} aria-label="Excluir" title={record.canEdit ? 'Excluir parcela' : 'Parcela bloqueada para exclusão'}><Trash2 size={14} /></IconButton>
                          </Actions>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            )}
          </>
        ) : history.length === 0 ? <Empty>Nenhum evento de auditoria encontrado.</Empty> : (
          <HistoryList>
            {history.map((event) => (
              <HistoryItem key={event.id}>
                <strong>Vale #{event.recordId}</strong>
                <Badge $tone="neutral">{eventLabel(event.action)}</Badge>
                <span>{event.userName || 'Sistema'}</span>
                <span>{formatDateTime(event.occurredAt)}</span>
              </HistoryItem>
            ))}
          </HistoryList>
        )}
      </Panel>

      {isModalOpen && (
        <Overlay onMouseDown={() => !saving && setIsModalOpen(false)}>
          <Modal role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <ModalHeader>
              <h2>{editing ? `Editar parcela ${editing.installmentNumber}/${editing.installmentsTotal}` : 'Novo vale'}</h2>
              <IconButton type="button" onClick={() => setIsModalOpen(false)} disabled={saving}><X size={16} /></IconButton>
            </ModalHeader>
            <Form onSubmit={handleSave}>
              <Field>Motorista
                <Select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} required>
                  <option value="">Selecione...</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </Select>
              </Field>
              <FormGrid>
                <Field>Categoria
                  <Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ValeCategory }))}>
                    <option value="ADVANCE">Vale</option>
                    <option value="FINE">Multa</option>
                    <option value="OTHER_DISCOUNT">Outro desconto</option>
                  </Select>
                </Field>
                <Field>Data da {editing ? 'parcela' : '1ª parcela'}
                  <DateInput value={form.date} onValueChange={(value) => setForm((current) => ({ ...current, date: value }))} required />
                </Field>
              </FormGrid>
              <FormGrid>
                <Field>{editing ? 'Valor da parcela' : 'Valor total'}
                  <Input inputMode="decimal" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="0,00" required />
                </Field>
                {editing ? (
                  <Field>Parcela
                    <Input value={`${editing.installmentNumber}/${editing.installmentsTotal}`} disabled />
                  </Field>
                ) : (
                  <Field>Nº de parcelas
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      step="1"
                      value={form.installments}
                      onChange={(event) => setForm((current) => ({ ...current, installments: event.target.value }))}
                      required
                    />
                  </Field>
                )}
              </FormGrid>
              <Field>Descrição / observação
                <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Ex.: adiantamento, multa de trânsito, avaria..." />
              </Field>
              <ModalActions>
                <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit" disabled={saving}><Save size={15} /> {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Gravar'}</PrimaryButton>
              </ModalActions>
            </Form>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}

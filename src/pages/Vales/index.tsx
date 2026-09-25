import { useEffect, useMemo, useState } from 'react';
import { Check, CircleCheckBig, Edit3, Plus, ReceiptText, Save, Trash2, X } from 'lucide-react';

import { DateInput } from '../../components/DateInput';
import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorMessage } from '../../utils/apiError';
import { vehicleService } from '../Vehicles/services';
import { valeService } from './services';
import type { ValeCategory, ValeEmployeeOption, ValeFormData, ValeHistoryEvent, ValeRecord } from './types';
import {
  Actions,
  Badge,
  CategoryBar,
  Empty,
  Field,
  FilterButton,
  FilterField,
  FilterGroup,
  Filters,
  Form,
  FormGrid,
  GroupHeaderRow,
  GroupSummary,
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
  LOAN: 'Empréstimo',
  OTHER_DISCOUNT: 'Outro desconto',
};

const CREATE_BUTTON_LABELS: Record<ValeCategory, string> = {
  ADVANCE: 'Novo vale',
  FINE: 'Nova multa',
  LOAN: 'Novo empréstimo',
  OTHER_DISCOUNT: 'Novo desconto',
};

function todayValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function currentMonthValue(): string {
  return todayValue().slice(0, 7);
}

function currentMonthRange(): { start: string; end: string } {
  const [year, month] = currentMonthValue().split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${String(month).padStart(2, '0')}-01`,
    end: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

function firstInstallmentMonth(record: ValeRecord): string {
  const [year, month] = record.discountMonth.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1 - Math.max(0, record.installmentNumber - 1), 1));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;
}

const INITIAL_FORM: ValeFormData = {
  employeeId: '',
  category: 'ADVANCE',
  date: todayValue(),
  discountStartMonth: currentMonthValue(),
  description: '',
  amount: '',
  installments: '1',
  finePlate: '',
  fineLocation: '',
  fineNumber: '',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${month}/${year}`;
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

function tableColumnCount(category: ValeCategory): number {
  if (category === 'FINE') return 9;
  if (category === 'ADVANCE') return 7;
  if (category === 'LOAN') return 4;
  return 6;
}

export function Vales() {
  const notifications = useNotifications();
  const { user } = useAuth();
  const isAdministrator = user?.role?.trim().toLocaleLowerCase('pt-BR') === 'administrador';
  const monthRange = useMemo(() => currentMonthRange(), []);
  const [records, setRecords] = useState<ValeRecord[]>([]);
  const [employees, setEmployees] = useState<ValeEmployeeOption[]>([]);
  const [vehiclePlates, setVehiclePlates] = useState<string[]>([]);
  const [history, setHistory] = useState<ValeHistoryEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'LIST' | 'HISTORY'>('LIST');
  const [activeCategory, setActiveCategory] = useState<ValeCategory>('ADVANCE');
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

    Promise.all([valeService.list(), valeService.options(), vehicleService.list()])
      .then(([loadedRecords, loadedEmployees, loadedVehicles]) => {
        if (!active) return;
        setRecords(loadedRecords);
        setEmployees(loadedEmployees);
        setVehiclePlates(
          Array.from(new Set(loadedVehicles.map((vehicle) => vehicle.plate.trim().toUpperCase()).filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'pt-BR')),
        );
      })
      .catch((error) => {
        if (!active) return;
        notifications.error('Não foi possível carregar os lançamentos', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
      });

    return () => {
      active = false;
    };
  }, [notifications]);

  const filtered = useMemo(() => records.filter((record) => {
    if (record.category !== activeCategory) return false;
    if (driverFilter !== 'ALL' && record.employeeId !== Number(driverFilter)) return false;
    if (dateFrom && record.date < dateFrom) return false;
    if (dateTo && record.date > dateTo) return false;
    if (activeCategory === 'ADVANCE' && invoiceFilter === 'N' && record.invoiced) return false;
    if (activeCategory === 'ADVANCE' && invoiceFilter === 'F' && !record.invoiced) return false;
    return true;
  }), [activeCategory, dateFrom, dateTo, driverFilter, invoiceFilter, records]);

  const groupedByDriver = useMemo(() => {
    const groups = new Map<number, { employeeId: number; employeeName: string; records: ValeRecord[]; total: number }>();

    filtered.forEach((record) => {
      const current = groups.get(record.employeeId);
      if (current) {
        current.records.push(record);
        current.total += record.amount;
        return;
      }

      groups.set(record.employeeId, {
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        records: [record],
        total: record.amount,
      });
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        records: [...group.records].sort((a, b) =>
          a.date.localeCompare(b.date)
          || (a.withdrawalDate ?? '').localeCompare(b.withdrawalDate ?? '')
          || a.installmentNumber - b.installmentNumber
          || a.id - b.id),
      }))
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'pt-BR'));
  }, [filtered]);

  function switchCategory(category: ValeCategory) {
    setActiveCategory(category);
    setActiveTab('LIST');
    setInvoiceFilter('ALL');
  }

  function openCreate() {
    setEditing(null);
    setForm({
      ...INITIAL_FORM,
      category: activeCategory,
      date: todayValue(),
      discountStartMonth: currentMonthValue(),
      employeeId: driverFilter !== 'ALL' ? driverFilter : employees[0] ? String(employees[0].id) : '',
    });
    setIsModalOpen(true);
  }

  function openEdit(record: ValeRecord) {
    if (!record.canEdit) return;
    setEditing(record);
    setActiveCategory(record.category);
    setForm({
      employeeId: String(record.employeeId),
      category: record.category,
      date: record.withdrawalDate ?? todayValue(),
      discountStartMonth: firstInstallmentMonth(record),
      description: record.description,
      amount: String(record.amount).replace('.', ','),
      installments: String(record.installmentsTotal),
      finePlate: record.finePlate ?? '',
      fineLocation: record.fineLocation ?? '',
      fineNumber: record.fineNumber ?? '',
    });
    setIsModalOpen(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount.trim().replace(/\./g, '').replace(',', '.'));
    const installments = Number(form.installments);

    if (!form.employeeId || !form.discountStartMonth || !Number.isFinite(amount) || amount <= 0) {
      notifications.warning('Dados incompletos', 'Informe motorista, mês do primeiro desconto e um valor maior que zero.');
      return;
    }
    if (form.category !== 'LOAN' && !form.date) {
      notifications.warning('Data obrigatória', form.category === 'FINE' ? 'Informe a data da multa.' : 'Informe a data do lançamento.');
      return;
    }
    if (form.category === 'FINE' && (!form.finePlate.trim() || !form.fineLocation.trim() || !form.fineNumber.trim())) {
      notifications.warning('Dados da multa incompletos', 'Informe placa, local e número da multa.');
      return;
    }
    if (!editing && (!Number.isInteger(installments) || installments < 1 || installments > 60)) {
      notifications.warning('Parcelas inválidas', 'Informe entre 1 e 60 parcelas.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await valeService.update(editing.id, form);
        setRecords(await valeService.list());
        notifications.success('Lançamento atualizado', `${CATEGORY_LABELS[form.category]} atualizado com sucesso.`);
      } else {
        const created = await valeService.create(form);
        setRecords(await valeService.list());
        notifications.success(
          created.length > 1 ? 'Parcelas gravadas' : 'Lançamento gravado',
          created.length > 1
            ? `${created.length} parcelas foram geradas para ${created[0]?.employeeName ?? 'o motorista'}.`
            : `${CATEGORY_LABELS[form.category]} gravado com sucesso.`,
        );
      }
      setActiveCategory(form.category);
      setIsModalOpen(false);
    } catch (error) {
      notifications.error('Não foi possível salvar', getApiErrorMessage(error, 'Confira os dados e tente novamente.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleInvoice(record: ValeRecord) {
    if (record.category !== 'ADVANCE' || record.invoiced) return;
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

  const columnCount = tableColumnCount(activeCategory);

  return (
    <Page>
      <Header>
        <TitleGroup>
          <Title>Vales, Multas e descontos</Title>
        </TitleGroup>
        {activeTab === 'LIST' && (
          <PrimaryButton type="button" onClick={openCreate}>
            <Plus size={16} /> {CREATE_BUTTON_LABELS[activeCategory]}
          </PrimaryButton>
        )}
      </Header>

      <Panel>
        <Tabs>
          <TabButton type="button" $active={activeTab === 'LIST'} onClick={() => setActiveTab('LIST')}><ReceiptText size={14} /> Lançamentos</TabButton>
          {isAdministrator && <TabButton type="button" $active={activeTab === 'HISTORY'} onClick={openHistory}>Histórico ADM</TabButton>}
        </Tabs>

        {activeTab === 'LIST' ? (
          <>
            <CategoryBar>
              {(['ADVANCE', 'FINE', 'LOAN', 'OTHER_DISCOUNT'] as ValeCategory[]).map((category) => (
                <FilterButton key={category} type="button" $active={activeCategory === category} onClick={() => switchCategory(category)}>
                  {category === 'ADVANCE' ? 'Vales' : category === 'FINE' ? 'Multas' : category === 'LOAN' ? 'Empréstimos' : 'Outros descontos'}
                </FilterButton>
              ))}
            </CategoryBar>

            <Filters>
              <FilterField>
                <span>Motorista</span>
                <Select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
                  <option value="ALL">Todos os motoristas</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </Select>
              </FilterField>
              <FilterField>
                <span>Desconto de</span>
                <DateInput value={dateFrom} onValueChange={setDateFrom} />
              </FilterField>
              <FilterField>
                <span>Desconto até</span>
                <DateInput value={dateTo} onValueChange={setDateTo} />
              </FilterField>
              {activeCategory === 'ADVANCE' && (
                <FilterGroup aria-label="Filtrar vales por faturamento">
                  <FilterButton type="button" $active={invoiceFilter === 'ALL'} onClick={() => setInvoiceFilter('ALL')}>Todos</FilterButton>
                  <FilterButton type="button" $active={invoiceFilter === 'N'} onClick={() => setInvoiceFilter('N')}>Não faturado</FilterButton>
                  <FilterButton type="button" $active={invoiceFilter === 'F'} onClick={() => setInvoiceFilter('F')}>Faturado</FilterButton>
                </FilterGroup>
              )}
              <SecondaryButton
                type="button"
                onClick={() => {
                  setDriverFilter('ALL');
                  setDateFrom(monthRange.start);
                  setDateTo(monthRange.end);
                  setInvoiceFilter('ALL');
                }}
              >
                Limpar filtros
              </SecondaryButton>
            </Filters>

            {filtered.length === 0 ? <Empty>Nenhum lançamento encontrado para os filtros informados.</Empty> : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>Desconto</th>
                      {activeCategory !== 'LOAN' && <th>{activeCategory === 'FINE' ? 'Data multa' : 'Data'}</th>}
                      {activeCategory === 'FINE' && <th>Placa</th>}
                      {activeCategory === 'FINE' && <th>Local</th>}
                      {activeCategory === 'FINE' && <th>Nº multa</th>}
                      {activeCategory !== 'LOAN' && <th>Observação</th>}
                      <th>Parcela</th>
                      <th>{activeCategory === 'LOAN' ? 'Valor parcela' : 'Valor'}</th>
                      {activeCategory === 'ADVANCE' && <th>Faturar</th>}
                      <th>Ações</th>
                    </tr>
                  </thead>
                  {groupedByDriver.map((group) => (
                    <tbody key={group.employeeId}>
                      <GroupHeaderRow>
                        <td colSpan={columnCount}>
                          <strong>{group.employeeName}</strong>
                          <GroupSummary>
                            <span>{group.records.length} {group.records.length === 1 ? 'lançamento' : 'lançamentos'}</span>
                            <strong>Total no período: {formatCurrency(group.total)}</strong>
                          </GroupSummary>
                        </td>
                      </GroupHeaderRow>
                      {group.records.map((record) => (
                        <tr key={record.id}>
                          <td><strong>{formatMonth(record.discountMonth)}</strong></td>
                          {activeCategory !== 'LOAN' && <td><strong>{formatDate(record.withdrawalDate)}</strong></td>}
                          {activeCategory === 'FINE' && <td>{record.finePlate || '-'}</td>}
                          {activeCategory === 'FINE' && <td>{record.fineLocation || '-'}</td>}
                          {activeCategory === 'FINE' && <td>{record.fineNumber || '-'}</td>}
                          {activeCategory !== 'LOAN' && <td>{record.description || '-'}</td>}
                          <td><strong>{record.installmentNumber}/{record.installmentsTotal}</strong></td>
                          <td><strong>{formatCurrency(record.amount)}</strong></td>
                          {activeCategory === 'ADVANCE' && (
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
                          )}
                          <td>
                            <Actions>
                              <IconButton type="button" onClick={() => openEdit(record)} disabled={!record.canEdit} aria-label="Editar" title={record.canEdit ? 'Editar parcela' : 'Parcela bloqueada para edição'}><Edit3 size={14} /></IconButton>
                              <IconButton type="button" onClick={() => void handleDelete(record)} disabled={!record.canEdit} aria-label="Excluir" title={record.canEdit ? 'Excluir parcela' : 'Parcela bloqueada para exclusão'}><Trash2 size={14} /></IconButton>
                            </Actions>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </Table>
              </TableWrap>
            )}
          </>
        ) : history.length === 0 ? <Empty>Nenhum evento de auditoria encontrado.</Empty> : (
          <HistoryList>
            {history.map((event) => (
              <HistoryItem key={event.id}>
                <strong>Lançamento #{event.recordId}</strong>
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
              <h2>{editing ? `Editar ${CATEGORY_LABELS[form.category]} · ${editing.installmentNumber}/${editing.installmentsTotal}` : CREATE_BUTTON_LABELS[form.category]}</h2>
              <IconButton type="button" onClick={() => setIsModalOpen(false)} disabled={saving}><X size={16} /></IconButton>
            </ModalHeader>
            <Form onSubmit={handleSave}>
              <Field>Tipo de lançamento
                <Select
                  value={form.category}
                  onChange={(event) => {
                    const category = event.target.value as ValeCategory;
                    setForm((current) => ({
                      ...current,
                      category,
                      date: category === 'LOAN' ? '' : (current.date || todayValue()),
                      finePlate: category === 'FINE' ? current.finePlate : '',
                      fineLocation: category === 'FINE' ? current.fineLocation : '',
                      fineNumber: category === 'FINE' ? current.fineNumber : '',
                      description: category === 'LOAN' ? '' : current.description,
                    }));
                  }}
                  disabled={Boolean(editing)}
                >
                  <option value="ADVANCE">Vale</option>
                  <option value="FINE">Multa</option>
                  <option value="LOAN">Empréstimo</option>
                  <option value="OTHER_DISCOUNT">Outro desconto</option>
                </Select>
              </Field>

              <Field>Motorista
                <Select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} required>
                  <option value="">Selecione...</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </Select>
              </Field>

              {form.category === 'FINE' && (
                <>
                  <FormGrid>
                    <Field>Data multa
                      <DateInput value={form.date} onValueChange={(value) => setForm((current) => ({ ...current, date: value }))} required />
                    </Field>
                    <Field>Placa
                      <Select
                        value={form.finePlate}
                        onChange={(event) => setForm((current) => ({ ...current, finePlate: event.target.value }))}
                        required
                      >
                        <option value="">Selecione a placa...</option>
                        {form.finePlate && !vehiclePlates.includes(form.finePlate) && (
                          <option value={form.finePlate}>{form.finePlate}</option>
                        )}
                        {vehiclePlates.map((plate) => <option key={plate} value={plate}>{plate}</option>)}
                      </Select>
                    </Field>
                  </FormGrid>
                  <FormGrid>
                    <Field>Local
                      <Input value={form.fineLocation} onChange={(event) => setForm((current) => ({ ...current, fineLocation: event.target.value }))} required />
                    </Field>
                    <Field>Nº Multa
                      <Input value={form.fineNumber} onChange={(event) => setForm((current) => ({ ...current, fineNumber: event.target.value }))} required />
                    </Field>
                  </FormGrid>
                </>
              )}

              {form.category !== 'FINE' && form.category !== 'LOAN' && (
                <Field>Data
                  <DateInput value={form.date} onValueChange={(value) => setForm((current) => ({ ...current, date: value }))} required />
                </Field>
              )}

              <FormGrid>
                <Field>{form.category === 'LOAN' ? 'Valor da parcela' : editing ? 'Valor da parcela' : 'Valor total'}
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

              <Field>Desconto 1ª parcela (mês)
                <Input
                  type="month"
                  value={form.discountStartMonth}
                  onChange={(event) => setForm((current) => ({ ...current, discountStartMonth: event.target.value }))}
                  required
                />
              </Field>

              {form.category !== 'LOAN' && (
                <Field>Observação
                  <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder={form.category === 'FINE' ? 'Observações sobre a multa...' : 'Observações sobre o lançamento...'} />
                </Field>
              )}

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

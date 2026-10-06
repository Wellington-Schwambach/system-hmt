import { useEffect, useMemo, useState } from 'react';
import { Check, CircleCheckBig, Edit3, Plus, ReceiptText, RotateCcw, Save, Trash2, X } from 'lucide-react';

import { DateInput } from '../../components/DateInput';
import { SearchableSelect } from '../../components/SearchableSelect';
import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorFeedback } from '../../utils/apiError';
import { valeService } from './services';
import type { ValeCategory, ValeCityOption, ValeEmployeeOption, ValeFormData, ValeHistoryEvent, ValeRecord } from './types';
import { normalizeFineNumberInput, validateValeForm } from './validation';
import {
  Actions,
  Badge,
  CategoryBar,
  Empty,
  Field,
  FieldHint,
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
  InvoicedWrap,
  UninvoiceButton,
  InlineDateInput,
  InlineDateWrap,
  InlineDateStatus,
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

function getIsoWeekRange(value: string): { start: string; end: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;

  const weekday = date.getDay();
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysSinceMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const iso = (item: Date) => `${item.getFullYear()}-${String(item.getMonth() + 1).padStart(2, '0')}-${String(item.getDate()).padStart(2, '0')}`;
  return { start: iso(monday), end: iso(sunday) };
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
  local: '',
  boletoDueDate: '',
  weeklyAuthorizedBy: '',
  description: '',
  amount: '500,00',
  installments: '1',
  finePlate: '',
  fineLocation: '',
  fineNumber: '',
  fineInfractionCode: '',
  fineInfractionAt: `${todayValue()}T00:00`,
  fineOriginalAmount: '',
  fineObservation: '',
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

function formatFineDateTime(value: string | null, fallbackDate: string | null): string {
  if (value) {
    const normalized = value.length === 16 ? `${value}:00` : value;
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(normalized));
  }
  return formatDate(fallbackDate);
}

function eventLabel(action: ValeHistoryEvent['action']): string {
  return ({
    CREATED: 'Criado',
    UPDATED: 'Editado',
    DELETED: 'Excluído',
    SETTLED: 'Aplicado no acerto',
    REOPENED: 'Liberado do acerto',
    INVOICED: 'Faturado',
    UNINVOICED: 'Desfaturado',
  })[action];
}

function tableColumnCount(category: ValeCategory): number {
  if (category === 'FINE') return 11;
  if (category === 'ADVANCE') return 9;
  if (category === 'LOAN') return 5;
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
  const [cities, setCities] = useState<ValeCityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
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
  const [dueDateDrafts, setDueDateDrafts] = useState<Record<number, string>>({});
  const [savingDueDateId, setSavingDueDateId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([valeService.list(), valeService.formOptions()])
      .then(([loadedRecords, formOptions]) => {
        if (!active) return;
        setRecords(loadedRecords);
        setEmployees(formOptions.employees);
        setVehiclePlates(formOptions.vehiclePlates);
        setCities(formOptions.cities);
        setCitiesLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setCitiesLoading(false);
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar os lançamentos.');
        notifications.error(feedback.title, feedback.message, feedback.details);
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

  const weeklyAdvanceConflicts = useMemo(() => {
    if (editing || form.category !== 'ADVANCE' || !form.employeeId) return [];
    const range = getIsoWeekRange(form.date);
    if (!range) return [];

    return records.filter((record) => {
      if (record.category !== 'ADVANCE' || record.employeeId !== Number(form.employeeId)) return false;
      if (record.installmentNumber !== 1) return false;
      const valeDate = record.withdrawalDate ?? record.date;
      return valeDate >= range.start && valeDate <= range.end;
    });
  }, [editing, form.category, form.date, form.employeeId, records]);

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
      local: '',
      boletoDueDate: '',
      weeklyAuthorizedBy: '',
      amount: activeCategory === 'ADVANCE' ? '500,00' : '',
      fineInfractionCode: '',
      fineInfractionAt: `${todayValue()}T00:00`,
      fineOriginalAmount: '',
      fineObservation: '',
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
      local: record.advanceLocation ?? '',
      boletoDueDate: record.boletoDueDate ?? '',
      weeklyAuthorizedBy: '',
      description: record.description,
      installments: String(record.installmentsTotal),
      finePlate: record.finePlate ?? '',
      fineLocation: record.fineLocation ?? '',
      fineNumber: normalizeFineNumberInput(record.fineNumber ?? ''),
      fineInfractionCode: record.fineInfractionCode ?? '',
      fineInfractionAt: record.fineInfractionAt ?? `${record.withdrawalDate ?? todayValue()}T00:00`,
      fineOriginalAmount: record.fineOriginalAmount != null ? String(record.fineOriginalAmount).replace('.', ',') : '',
      fineObservation: record.fineObservation ?? '',
      amount: record.category === 'FINE' && record.fineChargeAmount != null
        ? String(record.fineChargeAmount).replace('.', ',')
        : String(record.amount).replace('.', ','),
    });
    setIsModalOpen(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateValeForm(form, { editing: Boolean(editing) });
    if (validationErrors.length > 0) {
      notifications.warning(
        'Revise o lançamento antes de gravar',
        'Há informações que precisam ser corrigidas.',
        validationErrors,
      );
      return;
    }

    if (!editing && form.category === 'ADVANCE' && weeklyAdvanceConflicts.length > 0) {
      if (!form.weeklyAuthorizedBy) {
        notifications.warning(
          'Vale já liberado nesta semana',
          'Para liberar outro vale na mesma semana, informe se a exceção foi autorizada por Henrique ou Marina.',
          weeklyAdvanceConflicts.map((record) => `${formatDate(record.withdrawalDate ?? record.date)} · ${formatCurrency(record.amount)} · ${record.advanceLocation || 'Local não informado'}`),
        );
        return;
      }

      const confirmed = await notifications.confirm({
        title: 'Liberar outro vale nesta semana?',
        message: `Já existe vale para ${weeklyAdvanceConflicts[0]?.employeeName ?? 'este motorista'} nesta semana. A exceção ficará registrada como autorizada por ${form.weeklyAuthorizedBy === 'HENRIQUE' ? 'Henrique' : 'Marina'}.`,
        details: weeklyAdvanceConflicts.map((record) => `${formatDate(record.withdrawalDate ?? record.date)} · ${formatCurrency(record.amount)} · ${record.advanceLocation || 'Local não informado'}`),
        type: 'warning',
        confirmLabel: 'Liberar mesmo assim',
        cancelLabel: 'Cancelar',
      });
      if (!confirmed) return;
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
      const feedback = getApiErrorFeedback(error, 'Não foi possível gravar o lançamento.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  async function handleBoletoDueDateBlur(record: ValeRecord) {
    if (record.category !== 'ADVANCE' || savingDueDateId === record.id) return;

    const currentValue = record.boletoDueDate ?? '';
    const nextValue = dueDateDrafts[record.id] ?? currentValue;
    if (nextValue === currentValue) return;

    setSavingDueDateId(record.id);
    try {
      const updated = await valeService.updateBoletoDueDate(record.id, nextValue || null);
      setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setDueDateDrafts((current) => ({ ...current, [record.id]: updated.boletoDueDate ?? '' }));
    } catch (error) {
      setDueDateDrafts((current) => ({ ...current, [record.id]: currentValue }));
      const feedback = getApiErrorFeedback(error, 'Não foi possível atualizar o vencimento do boleto.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSavingDueDateId(null);
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
      const feedback = getApiErrorFeedback(error, 'Não foi possível faturar a parcela.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setInvoicingId(null);
    }
  }

  async function handleUninvoice(record: ValeRecord) {
    if (!isAdministrator || record.category !== 'ADVANCE' || !record.invoiced) return;

    const confirmed = await notifications.confirm({
      title: 'Desfaturar vale?',
      message: `${record.employeeName} · Parcela ${record.installmentNumber}/${record.installmentsTotal} · ${formatCurrency(record.amount)}. O vale voltará para o status de não faturado.`,
      type: 'warning',
      confirmLabel: 'Desfaturar',
      cancelLabel: 'Cancelar',
    });
    if (!confirmed) return;

    setInvoicingId(record.id);
    try {
      const updated = await valeService.uninvoice(record.id);
      setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      notifications.success('Vale desfaturado', `O faturamento de ${record.employeeName} foi removido.`);
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível desfaturar o vale.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setInvoicingId(null);
    }
  }

  async function handleDelete(record: ValeRecord) {
    if (!record.canDelete) return;
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
      const feedback = getApiErrorFeedback(error, 'Não foi possível excluir a parcela.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    }
  }

  async function openHistory() {
    setActiveTab('HISTORY');
    try {
      setHistory(await valeService.history());
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível carregar o histórico.');
      notifications.error(feedback.title, feedback.message, feedback.details);
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
                      {activeCategory !== 'LOAN' && <th>{activeCategory === 'FINE' ? 'Data/hora infração' : 'Data'}</th>}
                      {activeCategory === 'ADVANCE' && <th>Local</th>}
                      {activeCategory === 'FINE' && <th>Placa</th>}
                      {activeCategory === 'FINE' && <th>Local</th>}
                      {activeCategory === 'FINE' && <th>Nº multa</th>}
                      <th>{activeCategory === 'FINE' ? 'Descrição' : 'Observação'}</th>
                      {activeCategory === 'FINE' && <th>Observação</th>}
                      {activeCategory === 'FINE' && <th>Valor original</th>}
                      <th>Parcela</th>
                      <th>{activeCategory === 'LOAN' ? 'Valor parcela' : activeCategory === 'FINE' ? 'Valor à cobrar' : 'Valor'}</th>
                      {activeCategory === 'ADVANCE' && <th>Vencimento boleto</th>}
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
                          {activeCategory !== 'LOAN' && <td><strong>{activeCategory === 'FINE' ? formatFineDateTime(record.fineInfractionAt, record.withdrawalDate) : formatDate(record.withdrawalDate)}</strong></td>}
                          {activeCategory === 'ADVANCE' && <td>{record.advanceLocation || '-'}</td>}
                          {activeCategory === 'FINE' && <td>{record.finePlate || '-'}</td>}
                          {activeCategory === 'FINE' && <td>{record.fineLocation || '-'}</td>}
                          {activeCategory === 'FINE' && <td>{record.fineNumber || '-'}</td>}
                          <td>{record.description || '-'}</td>
                          {activeCategory === 'FINE' && <td>{record.fineObservation || '-'}</td>}
                          {activeCategory === 'FINE' && <td><strong>{record.fineOriginalAmount != null ? formatCurrency(record.fineOriginalAmount) : '-'}</strong></td>}
                          <td><strong>{record.installmentNumber}/{record.installmentsTotal}</strong></td>
                          <td><strong>{formatCurrency(record.amount)}</strong></td>
                          {activeCategory === 'ADVANCE' && (
                            <td>
                              <InlineDateWrap>
                                <InlineDateInput
                                  type="date"
                                  value={dueDateDrafts[record.id] ?? record.boletoDueDate ?? ''}
                                  onChange={(event) => setDueDateDrafts((current) => ({ ...current, [record.id]: event.target.value }))}
                                  onBlur={() => void handleBoletoDueDateBlur(record)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') event.currentTarget.blur();
                                  }}
                                  disabled={savingDueDateId === record.id}
                                  aria-label={`Vencimento do boleto de ${record.employeeName}`}
                                />
                                {savingDueDateId === record.id && <InlineDateStatus>Salvando...</InlineDateStatus>}
                              </InlineDateWrap>
                            </td>
                          )}
                          {activeCategory === 'ADVANCE' && (
                            <td>
                              {record.invoiced ? (
                                <InvoicedWrap>
                                  <InvoicedLabel><Check size={14} /> Faturado</InvoicedLabel>
                                  {isAdministrator && (
                                    <UninvoiceButton
                                      type="button"
                                      onClick={() => void handleUninvoice(record)}
                                      disabled={invoicingId === record.id}
                                      title="Desfaturar este vale (somente administrador)"
                                    >
                                      <RotateCcw size={14} /> Desfaturar
                                    </UninvoiceButton>
                                  )}
                                </InvoicedWrap>
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
                              <IconButton type="button" onClick={() => void handleDelete(record)} disabled={!record.canDelete} aria-label="Excluir" title={record.canDelete ? 'Excluir parcela' : 'Parcela faturada ou vinculada a Acerto não pode ser excluída'}><Trash2 size={14} /></IconButton>
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
                      fineInfractionCode: category === 'FINE' ? current.fineInfractionCode : '',
                      fineInfractionAt: category === 'FINE' ? (current.fineInfractionAt || `${todayValue()}T00:00`) : '',
                      fineOriginalAmount: category === 'FINE' ? current.fineOriginalAmount : '',
                      fineObservation: category === 'FINE' ? current.fineObservation : '',
                      local: category === 'ADVANCE' ? current.local : '',
                      boletoDueDate: category === 'ADVANCE' ? current.boletoDueDate : '',
                      weeklyAuthorizedBy: category === 'ADVANCE' ? current.weeklyAuthorizedBy : '',
                      amount: category === 'ADVANCE' && !current.amount ? '500,00' : current.amount,
                      description: current.description,
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
                    <Field>Data e hora da infração
                      <Input
                        type="datetime-local"
                        value={form.fineInfractionAt}
                        onChange={(event) => setForm((current) => ({ ...current, fineInfractionAt: event.target.value }))}
                        required
                      />
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
                      <SearchableSelect
                        id="fine-location"
                        value={form.fineLocation}
                        options={[
                          ...(form.fineLocation && !cities.some((city) => `${city.name} / ${city.stateAbbreviation}` === form.fineLocation)
                            ? [{ value: form.fineLocation, label: form.fineLocation, searchText: form.fineLocation }]
                            : []),
                          ...cities.map((city) => ({
                            value: `${city.name} / ${city.stateAbbreviation}`,
                            label: `${city.name} / ${city.stateAbbreviation}`,
                            searchText: `${city.name} ${city.stateAbbreviation}`,
                          })),
                        ]}
                        onChange={(value) => setForm((current) => ({ ...current, fineLocation: value }))}
                        placeholder="Selecione a cidade"
                        searchPlaceholder="Pesquisar cidade..."
                        emptyMessage="Nenhuma cidade encontrada."
                        loading={citiesLoading}
                        clearable={false}
                      />
                    </Field>
                    <Field>Nº Multa
                      <Input
                        value={form.fineNumber}
                        onChange={(event) => {
                          const fineNumber = normalizeFineNumberInput(event.target.value);
                          setForm((current) => ({ ...current, fineNumber }));
                        }}
                        maxLength={100}
                        autoCapitalize="characters"
                        autoComplete="off"
                        required
                      />
                    </Field>
                  </FormGrid>
                  <Field>Código da infração
                    <Input
                      value={form.fineInfractionCode}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, fineInfractionCode: event.target.value }));
                      }}
                      inputMode="numeric"
                    />
                  </Field>
                  <Field>Descrição
                    <Textarea
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      required
                    />
                  </Field>
                </>
              )}

              {form.category !== 'FINE' && form.category !== 'LOAN' && (
                <Field>Data
                  <DateInput value={form.date} onValueChange={(value) => setForm((current) => ({ ...current, date: value, weeklyAuthorizedBy: current.category === 'ADVANCE' ? '' : current.weeklyAuthorizedBy }))} required />
                </Field>
              )}

              {form.category === 'ADVANCE' && (
                <Field>Local
                  <Input
                    value={form.local}
                    onChange={(event) => setForm((current) => ({ ...current, local: event.target.value }))}
                    placeholder="Ex.: Posto 45"
                    maxLength={255}
                    required
                  />
                </Field>
              )}

              <FormGrid>
                {form.category === 'FINE' ? (
                  <Field>Valor original
                    <Input inputMode="decimal" value={form.fineOriginalAmount} onChange={(event) => setForm((current) => ({ ...current, fineOriginalAmount: event.target.value }))} placeholder="0,00" required />
                  </Field>
                ) : null}
                <Field>{form.category === 'FINE' ? 'Valor à cobrar' : form.category === 'LOAN' ? 'Valor da parcela' : editing ? 'Valor da parcela' : 'Valor total'}
                  <Input inputMode="decimal" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="0,00" required />
                </Field>
                {editing && form.category !== 'LOAN' ? (
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

              {form.category === 'LOAN' && (() => {
                const installmentValue = Number(form.amount.trim().replace(/\./g, '').replace(',', '.'));
                const installmentCount = Number(form.installments);
                const total = Number.isFinite(installmentValue) && installmentValue > 0 && Number.isInteger(installmentCount) && installmentCount > 0
                  ? installmentValue * installmentCount
                  : null;
                return <FieldHint>Empréstimo: o valor informado é por parcela. {total != null ? `Total estimado: ${formatCurrency(total)} (${installmentCount}x de ${formatCurrency(installmentValue)}).` : 'Informe valor e quantidade para visualizar o total estimado.'}</FieldHint>;
              })()}

              <Field>Desconto 1ª parcela (mês)
                <Input
                  type="month"
                  value={form.discountStartMonth}
                  onChange={(event) => setForm((current) => ({ ...current, discountStartMonth: event.target.value }))}
                  required
                />
              </Field>

              {form.category !== 'FINE' && (
                <Field>Observação
                  <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Observações sobre o lançamento..." />
                </Field>
              )}

              {form.category === 'FINE' && (
                <Field>Observação
                  <Textarea
                    value={form.fineObservation}
                    onChange={(event) => setForm((current) => ({ ...current, fineObservation: event.target.value }))}
                    placeholder="Observações adicionais sobre a multa..."
                  />
                </Field>
              )}

              {form.category === 'ADVANCE' && weeklyAdvanceConflicts.length > 0 && (
                <>
                  <FieldHint>
                    Este motorista já possui {weeklyAdvanceConflicts.length === 1 ? 'um vale' : `${weeklyAdvanceConflicts.length} vales`} nesta semana. Para liberar novamente, registre a autorização abaixo.
                  </FieldHint>
                  <Field>Autorizado por
                    <Select
                      value={form.weeklyAuthorizedBy}
                      onChange={(event) => setForm((current) => ({ ...current, weeklyAuthorizedBy: event.target.value as ValeFormData['weeklyAuthorizedBy'] }))}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="HENRIQUE">Henrique</option>
                      <option value="MARINA">Marina</option>
                    </Select>
                  </Field>
                </>
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

import { useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';

import { DateInput } from '../../../../components/DateInput';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { getApiErrorFeedback } from '../../../../utils/apiError';
import { useNotifications } from '../../../../contexts/Notifications';
import { valeService } from '../../../Vales/services';
import type { ValeCityOption, ValeEmployeeOption, ValeFormData } from '../../../Vales/types';
import { normalizeFineNumberInput, validateValeForm } from '../../../Vales/validation';
import type { ValeEntryEditModalProps } from './types';
import { Actions, Button, CloseButton, Field, Form, Grid, Header, Input, Modal, Overlay, Select, Textarea } from './styles';

function firstInstallmentMonth(date: string, installmentNumber: number): string {
  const [year, month] = date.slice(0, 7).split('-').map(Number);
  const reference = new Date(year, month - 1 - Math.max(0, installmentNumber - 1), 1);
  return `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`;
}

function moneyInput(value: number): string {
  return new Intl.NumberFormat('pt-BR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function ValeEntryEditModal({ isOpen, entry, onClose, onSubmit }: ValeEntryEditModalProps) {
  const notifications = useNotifications();
  const record = entry.valeRecord;
  const [employees, setEmployees] = useState<ValeEmployeeOption[]>([]);
  const [plates, setPlates] = useState<string[]>([]);
  const [cities, setCities] = useState<ValeCityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const initialForm = useMemo<ValeFormData>(() => ({
    employeeId: record ? String(record.employeeId) : '',
    category: record?.category ?? 'ADVANCE',
    date: record?.withdrawalDate ?? '',
    discountStartMonth: record ? firstInstallmentMonth(record.date, record.installmentNumber) : new Date().toISOString().slice(0, 7),
    local: record?.advanceLocation ?? '',
    boletoDueDate: record?.boletoDueDate ?? record?.withdrawalDate ?? new Date().toISOString().slice(0, 10),
    weeklyAuthorizedBy: record?.weeklyAuthorizedBy ?? '',
    description: record?.description ?? '',
    amount: record ? moneyInput(record.category === 'FINE' && record.fineChargeAmount != null ? record.fineChargeAmount : record.amount) : '',
    installments: String(record?.installmentsTotal ?? 1),
    finePlate: record?.finePlate ?? '',
    fineLocation: record?.fineLocation ?? '',
    fineNumber: normalizeFineNumberInput(record?.fineNumber ?? ''),
    fineInfractionCode: record?.fineInfractionCode ?? '',
    fineInfractionAt: record?.fineInfractionAt ?? `${record?.withdrawalDate ?? new Date().toISOString().slice(0, 10)}T00:00`,
    fineOriginalAmount: record?.fineOriginalAmount != null ? moneyInput(record.fineOriginalAmount) : '',
    fineObservation: record?.fineObservation ?? '',
  }), [record]);
  const [form, setForm] = useState<ValeFormData>(initialForm);


  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    valeService.formOptions()
      .then((formOptions) => {
        if (!active) return;
        setEmployees(formOptions.employees);
        setPlates(formOptions.vehiclePlates);
        setCities(formOptions.cities);
        setCitiesLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setCitiesLoading(false);
        const feedback = getApiErrorFeedback(error, 'Não foi possível carregar as opções do lançamento.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      });
    return () => { active = false; };
  }, [isOpen, notifications]);

  if (!isOpen || !record) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateValeForm(form, { editing: true });
    if (validationErrors.length > 0) {
      notifications.warning(
        'Revise o lançamento antes de salvar',
        'Há informações que precisam ser corrigidas.',
        validationErrors,
      );
      return;
    }

    setSaving(true);
    try {
      if (await onSubmit(form)) onClose();
    } catch (error) {
      const feedback = getApiErrorFeedback(error, 'Não foi possível editar o lançamento.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Overlay onMouseDown={() => !saving && onClose()}>
      <Modal role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <Header>
          <h2>Editar lançamento do Acerto</h2>
          <CloseButton type="button" onClick={onClose} disabled={saving}><X size={16} /></CloseButton>
        </Header>
        <Form onSubmit={handleSubmit}>
          <Field>Tipo de lançamento
            <Select value={form.category} disabled>
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
              <Grid>
                <Field>Data e hora da infração
                  <Input type="datetime-local" value={form.fineInfractionAt} onChange={(event) => setForm((current) => ({ ...current, fineInfractionAt: event.target.value }))} required />
                </Field>
                <Field>Placa
                  <Select value={form.finePlate} onChange={(event) => setForm((current) => ({ ...current, finePlate: event.target.value }))} required>
                    <option value="">Selecione...</option>
                    {form.finePlate && !plates.includes(form.finePlate) && <option value={form.finePlate}>{form.finePlate}</option>}
                    {plates.map((plate) => <option key={plate} value={plate}>{plate}</option>)}
                  </Select>
                </Field>
              </Grid>
              <Grid>
                <Field>Local
                  <SearchableSelect
                    id="settlement-fine-location"
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
                <Field>Nº Auto / Multa
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
              </Grid>
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
                <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
              </Field>
            </>
          )}

          {form.category !== 'FINE' && form.category !== 'LOAN' && (
            <Field>Data
              <DateInput value={form.date} onValueChange={(value) => setForm((current) => ({ ...current, date: value }))} required />
            </Field>
          )}

          <Grid>
            {form.category === 'FINE' ? (
              <Field>Valor original
                <Input inputMode="decimal" value={form.fineOriginalAmount} onChange={(event) => setForm((current) => ({ ...current, fineOriginalAmount: event.target.value }))} required />
              </Field>
            ) : null}
            <Field>{form.category === 'FINE' ? 'Valor à cobrar' : 'Valor da parcela'}
              <Input inputMode="decimal" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required />
            </Field>
            {form.category === 'LOAN' ? (
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
            ) : (
              <Field>Parcela
                <Input value={`${record.installmentNumber}/${record.installmentsTotal}`} disabled />
              </Field>
            )}
          </Grid>

          <Field>Desconto 1ª parcela (mês)
            <Input type="month" value={form.discountStartMonth} onChange={(event) => setForm((current) => ({ ...current, discountStartMonth: event.target.value }))} required />
          </Field>

          {form.category !== 'FINE' && (
            <Field>Observação
              <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </Field>
          )}

          {form.category === 'FINE' && (
            <Field>Observação
              <Textarea value={form.fineObservation} onChange={(event) => setForm((current) => ({ ...current, fineObservation: event.target.value }))} placeholder="Observações adicionais sobre a multa..." />
            </Field>
          )}

          <Actions>
            <Button type="button" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" $primary disabled={saving}><Save size={15} /> {saving ? 'Salvando...' : 'Salvar alterações'}</Button>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}

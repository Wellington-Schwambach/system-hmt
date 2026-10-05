import { Calculator, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';

import type { FinancialEntryType } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import type { FinancialPanelProps } from './types';
import {
  AddButton,
  BalanceTotals,
  EditButton,
  ApplyButton,
  BonusHint,
  Content,
  EmptyEntries,
  EntryCopy,
  EntryGroup,
  EntryGroupHeader,
  EntryGroupsGrid,
  EntryGroupTitle,
  EntryItem,
  EntryList,
  EntryValue,
  Field,
  FieldGrid,
  Header,
  HeaderIcon,
  Input,
  Label,
  Panel,
  LoadWarning,
  RemoveButton,
  Section,
  SectionTitle,
  SummaryRow,
  Title,
  TotalReceivable,
} from './styles';

const ENTRY_GROUPS: Array<{ type: FinancialEntryType; title: string; button: string }> = [
  { type: 'FINE', title: 'Multas', button: 'Adicionar multa' },
  { type: 'LOAN', title: 'Empréstimos', button: 'Adicionar empréstimo' },
  { type: 'OTHER_DISCOUNT', title: 'Outros descontos', button: 'Adicionar' },
  { type: 'NEUTRAL_EXPENSE', title: 'Despesas', button: 'Adicionar despesa' },
];

export function FinancialPanel({
  bonusPercent,
  suggestedBonusPercent,
  baseSalary,
  otherEarnings,
  entries,
  totals,
  valesLoadError,
  onBonusPercentChange,
  onBaseSalaryChange,
  onOtherEarningsChange,
  onApplySuggestedBonus,
  onAddEntry,
  onEditEntry,
  onRemoveEntry,
  onRetryVales,
}: FinancialPanelProps) {
  return (
    <Panel>
      <Header>
        <Title>Resumo do acerto</Title>
        <HeaderIcon>
          <Calculator size={18} aria-hidden="true" />
        </HeaderIcon>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Gratificação</SectionTitle>
          <SummaryRow>
            <span>Total das viagens</span>
            <strong>{formatCurrency(totals.totalOriginalNetFreight ?? totals.totalNetFreight)}</strong>
          </SummaryRow>
          <SummaryRow $strong>
            <span>Frete considerado no acerto</span>
            <strong>{formatCurrency(totals.totalNetFreight)}</strong>
          </SummaryRow>

          <Field $full>
            <Label htmlFor="settlement-bonus-percent">Percentual de gratificação (%)</Label>
            <Input
              id="settlement-bonus-percent"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={bonusPercent}
              onChange={(event) => onBonusPercentChange(event.target.value)}
            />
          </Field>

          <BonusHint>
            <span>Sugestão pelas médias: {suggestedBonusPercent}%</span>
            <ApplyButton type="button" onClick={onApplySuggestedBonus}>
              Aplicar
            </ApplyButton>
          </BonusHint>

          <SummaryRow $strong>
            <span>Gratificação calculada</span>
            <strong>{formatCurrency(totals.bonusValue)}</strong>
          </SummaryRow>
        </Section>

        <Section>
          <SectionTitle>Proventos</SectionTitle>
          <FieldGrid>
            <Field $full>
              <Label htmlFor="settlement-base-salary">Salário base</Label>
              <Input
                id="settlement-base-salary"
                type="text"
                inputMode="decimal"
                value={baseSalary}
                onChange={(event) => onBaseSalaryChange(event.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field>
              <Label htmlFor="settlement-other-earnings">Outros</Label>
              <Input
                id="settlement-other-earnings"
                type="text"
                inputMode="decimal"
                value={otherEarnings}
                onChange={(event) => onOtherEarningsChange(event.target.value)}
                placeholder="0,00"
              />
            </Field>
          </FieldGrid>
          <SummaryRow $strong>
            <span>Total de proventos</span>
            <strong>{formatCurrency(totals.totalEarnings)}</strong>
          </SummaryRow>
        </Section>

        <Section>
          <SectionTitle>Demonstrativo</SectionTitle>
          <SummaryRow>
            <span>Salário</span>
            <strong>{formatCurrency(totals.baseSalary)}</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Gratificação</span>
            <strong>{formatCurrency(totals.bonusValue)}</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Outros proventos</span>
            <strong>{formatCurrency(totals.otherEarnings)}</strong>
          </SummaryRow>
          <SummaryRow $muted>
            <span>Multas</span>
            <strong>- {formatCurrency(totals.fines)}</strong>
          </SummaryRow>
          <SummaryRow $muted>
            <span>Empréstimos</span>
            <strong>- {formatCurrency((totals.loans ?? 0))}</strong>
          </SummaryRow>
          <SummaryRow $muted>
            <span>Outros descontos</span>
            <strong>- {formatCurrency(totals.otherDiscounts)}</strong>
          </SummaryRow>
          <BalanceTotals>
            <div className="positive"><span>Total positivo</span><strong>{formatCurrency(totals.totalPositive ?? totals.totalEarnings)}</strong></div>
            <div className="negative"><span>Total negativo</span><strong>- {formatCurrency(totals.totalNegative ?? totals.totalDiscounts)}</strong></div>
          </BalanceTotals>
        </Section>

        <Section $wide>
          <SectionTitle>Lançamentos</SectionTitle>
          {valesLoadError && (
            <LoadWarning>
              <span>Não foi possível atualizar os lançamentos vindos de Vales. Os registros manuais continuam disponíveis.</span>
              {onRetryVales && <button type="button" onClick={onRetryVales}><RefreshCw size={12} /> Tentar novamente</button>}
            </LoadWarning>
          )}
          <EntryGroupsGrid>
            {ENTRY_GROUPS.map((group) => {
              const groupEntries = entries.filter((entry) => entry.type === group.type);

              return (
                <EntryGroup key={group.type}>
                  <EntryGroupHeader>
                    <EntryGroupTitle>{group.title}</EntryGroupTitle>
                    <AddButton type="button" onClick={() => onAddEntry(group.type)}>
                      <Plus size={13} aria-hidden="true" />
                      {group.button}
                    </AddButton>
                  </EntryGroupHeader>

                  {groupEntries.length === 0 ? (
                    <EmptyEntries>Nenhum lançamento.</EmptyEntries>
                  ) : (
                    <EntryList>
                      {groupEntries.map((entry) => (
                        <EntryItem key={entry.id}>
                          <EntryCopy>
                            <strong>{entry.description || group.title}</strong>
                            <span>
                              {formatDate(entry.date)}
                            </span>
                          </EntryCopy>
                          <EntryValue $neutral={entry.type === 'NEUTRAL_EXPENSE'}>
                            {entry.type === 'NEUTRAL_EXPENSE' ? '' : '- '}{formatCurrency(entry.value)}
                          </EntryValue>
                          <EditButton
                            type="button"
                            onClick={() => onEditEntry(entry)}
                            aria-label={`Editar ${entry.description || group.title}`}
                            title="Editar lançamento"
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </EditButton>
                          {entry.source !== 'VALE' && (
                            <RemoveButton
                              type="button"
                              onClick={() => onRemoveEntry(entry.id)}
                              aria-label={`Remover ${entry.description || group.title}`}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </RemoveButton>
                          )}
                        </EntryItem>
                      ))}
                    </EntryList>
                  )}
                </EntryGroup>
              );
            })}
          </EntryGroupsGrid>

          <SummaryRow $strong>
            <span>Total de descontos</span>
            <strong>{formatCurrency(totals.totalDiscounts)}</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Despesas informativas (não alteram o acerto)</span>
            <strong>{formatCurrency(totals.neutralExpenses ?? 0)}</strong>
          </SummaryRow>
        </Section>

        <TotalReceivable>
          <span>Total a receber</span>
          <strong>{formatCurrency(totals.totalReceivable)}</strong>
        </TotalReceivable>
      </Content>
    </Panel>
  );
}

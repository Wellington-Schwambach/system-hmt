import { Calculator, Plus, Trash2 } from 'lucide-react';

import type { FinancialEntryType } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import type { FinancialPanelProps } from './types';
import {
  AddButton,
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
  RemoveButton,
  Section,
  SectionTitle,
  SummaryRow,
  Title,
  TotalReceivable,
} from './styles';

const ENTRY_GROUPS: Array<{ type: FinancialEntryType; title: string; button: string }> = [
  { type: 'ADVANCE', title: 'Vales', button: 'Adicionar vale' },
  { type: 'FINE', title: 'Multas', button: 'Adicionar multa' },
  { type: 'OTHER_DISCOUNT', title: 'Outros descontos', button: 'Adicionar' },
];

export function FinancialPanel({
  bonusPercent,
  suggestedBonusPercent,
  baseSalary,
  dailyAllowance,
  otherEarnings,
  entries,
  totals,
  onBonusPercentChange,
  onBaseSalaryChange,
  onDailyAllowanceChange,
  onOtherEarningsChange,
  onApplySuggestedBonus,
  onAddEntry,
  onRemoveEntry,
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
          <SectionTitle>Bonificação</SectionTitle>
          <SummaryRow $strong>
            <span>Total de fretes</span>
            <strong>{formatCurrency(totals.totalNetFreight)}</strong>
          </SummaryRow>

          <Field $full>
            <Label htmlFor="settlement-bonus-percent">Percentual de bonificação (%)</Label>
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
            <span>Bonificação calculada</span>
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
              <Label htmlFor="settlement-daily-allowance">Diárias</Label>
              <Input
                id="settlement-daily-allowance"
                type="text"
                inputMode="decimal"
                value={dailyAllowance}
                onChange={(event) => onDailyAllowanceChange(event.target.value)}
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
            <span>Bonificação</span>
            <strong>{formatCurrency(totals.bonusValue)}</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Diárias</span>
            <strong>{formatCurrency(totals.dailyAllowance)}</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Outros proventos</span>
            <strong>{formatCurrency(totals.otherEarnings)}</strong>
          </SummaryRow>
          <SummaryRow $muted>
            <span>Vales</span>
            <strong>- {formatCurrency(totals.advances)}</strong>
          </SummaryRow>
          <SummaryRow $muted>
            <span>Multas</span>
            <strong>- {formatCurrency(totals.fines)}</strong>
          </SummaryRow>
          <SummaryRow $muted>
            <span>Outros descontos</span>
            <strong>- {formatCurrency(totals.otherDiscounts)}</strong>
          </SummaryRow>
        </Section>

        <Section $wide>
          <SectionTitle>Descontos</SectionTitle>
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
                            <span>{formatDate(entry.date)}</span>
                          </EntryCopy>
                          <EntryValue>- {formatCurrency(entry.value)}</EntryValue>
                          <RemoveButton
                            type="button"
                            onClick={() => onRemoveEntry(entry.id)}
                            aria-label={`Remover ${entry.description || group.title}`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </RemoveButton>
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
        </Section>

        <TotalReceivable>
          <span>Total a receber</span>
          <strong>{formatCurrency(totals.totalReceivable)}</strong>
        </TotalReceivable>
      </Content>
    </Panel>
  );
}

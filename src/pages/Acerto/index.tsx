import { useState } from 'react';
import { CheckCircle2, Plus, Printer, RotateCcw, Save } from 'lucide-react';

import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import { getApiErrorMessage } from '../../utils/apiError';

import { EntryModal } from './components/EntryModal';
import { FinancialPanel } from './components/FinancialPanel';
import { PeriodModal } from './components/PeriodModal';
import { SettlementDetailsModal } from './components/SettlementDetailsModal';
import { SettlementFilters } from './components/SettlementFilters';
import { SettlementHistory } from './components/SettlementHistory';
import { SettlementList } from './components/SettlementList';
import { SettlementTabs } from './components/SettlementTabs';
import { TripSettlementTable } from './components/TripSettlementTable';
import { VehicleAverageSummary } from './components/VehicleAverageSummary';
import { useDriverSettlement } from './hooks';
import { printSettlementReport } from './services';
import { formatDate } from './utils';
import type {
  DriverSettlementSnapshot,
  FinancialEntryType,
  SettlementTab,
} from './types';
import {
  Eyebrow,
  Page,
  SavedNotice,
  Subtitle,
  Title,
  TitleGroup,
  Toolbar,
  ToolbarActions,
  ToolbarButton,
  TripGrid,
} from './styles';

export function Acerto() {
  const notifications = useNotifications();
  const { user } = useAuth();
  const settlement = useDriverSettlement();
  const isAdministrator = user?.role?.trim().toLocaleLowerCase('pt-BR') === 'administrador';
  const [activeTab, setActiveTab] = useState<SettlementTab>('FORM');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<FinancialEntryType>('ADVANCE');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<DriverSettlementSnapshot | null>(null);

  function handleOpenEntryModal(type: FinancialEntryType) {
    setEntryType(type);
    setIsEntryModalOpen(true);
  }

  async function handleFinalizeSettlement() {
    try {
      const finalizedSettlement = await settlement.finalizeSettlement();

      if (!finalizedSettlement) {
        notifications.warning('Acerto incompleto', 'Selecione um motorista da empresa e mantenha ao menos uma viagem no período.');
        return;
      }

      notifications.success(
        settlement.editingSettlementId ? 'Acerto atualizado' : 'Acerto gravado',
        `O acerto de ${finalizedSettlement.driver} foi salvo no banco.`,
      );
      setActiveTab('LIST');
    } catch (error) {
      notifications.error('Não foi possível salvar o acerto', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
    }
  }

  function handlePrintCurrentSettlement() {
    const opened = printSettlementReport(settlement.createCurrentSnapshot());
    if (!opened) {
      notifications.warning(
        'Pop-up bloqueado',
        'Permita pop-ups para este sistema e tente gerar o relatório novamente.',
      );
    }
  }

  function handleChangeTab(tab: SettlementTab) {
    if (tab === 'HISTORY' && isAdministrator) {
      settlement.loadHistory().catch((error) => {
        notifications.error('Não foi possível carregar o histórico', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
      });
    }
    setActiveTab(tab);
  }

  async function handleClearValues() {
    const shouldClear = await notifications.confirm({
      title: 'Limpar valores?',
      message: 'Bonificações, proventos e descontos desta tela serão zerados.',
      type: 'warning',
      confirmLabel: 'Limpar valores',
    });

    if (shouldClear) {
      settlement.resetFinancialData();
      notifications.success('Valores limpos', 'Os campos financeiros foram zerados.');
    }
  }

  function handleNewSettlement() {
    settlement.startNewSettlement();
    setSelectedSettlement(null);
    setActiveTab('FORM');
  }

  function handleEditSettlement(selected: DriverSettlementSnapshot) {
    settlement.startEditingSettlement(selected);
    setSelectedSettlement(null);
    setActiveTab('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteSettlement(selected: DriverSettlementSnapshot) {
    const shouldDelete = await notifications.confirm({
      title: 'Excluir acerto?',
      message: `O acerto de ${selected.driver}, do período de ${formatDate(selected.startDate)} até ${formatDate(selected.endDate)}, será removido.`,
      type: 'error',
      confirmLabel: 'Excluir acerto',
    });

    if (!shouldDelete) return;

    try {
      await settlement.deleteSettlement(selected.id);
      notifications.success('Acerto excluído', `O acerto de ${selected.driver} foi removido.`);
    } catch (error) {
      notifications.error('Não foi possível excluir o acerto', getApiErrorMessage(error, 'Tente novamente em alguns instantes.'));
      return;
    }

    if (selectedSettlement?.id === selected.id) {
      setSelectedSettlement(null);
    }
  }

  return (
    <Page>
      <Toolbar>
        <TitleGroup>
          <Eyebrow>Operação financeira</Eyebrow>
          <Title>Acerto de motoristas</Title>
          <Subtitle>
            {activeTab === 'FORM'
              ? settlement.editingSettlementId
                ? 'Edite os dados do acerto selecionado e salve as alterações.'
                : 'Monte um novo acerto com viagens, médias, proventos e descontos em uma única tela.'
              : 'Consulte todos os acertos gravados e imprima ou salve o espelho em PDF quando precisar.'}
          </Subtitle>
        </TitleGroup>

        <ToolbarActions>
          {activeTab === 'FORM' ? (
            <>
              <ToolbarButton type="button" onClick={handleClearValues}>
                <RotateCcw size={16} aria-hidden="true" />
                Limpar valores
              </ToolbarButton>
              <ToolbarButton
                type="button"
                onClick={handlePrintCurrentSettlement}
                disabled={!settlement.selectedDriver || settlement.travels.length === 0}
              >
                <Printer size={16} aria-hidden="true" />
                Imprimir / PDF
              </ToolbarButton>
              <ToolbarButton
                type="button"
                $primary
                onClick={handleFinalizeSettlement}
                disabled={!settlement.canSave || settlement.saving}
              >
                <Save size={16} aria-hidden="true" />
                {settlement.saving
                  ? 'Salvando...'
                  : settlement.editingSettlementId
                    ? 'Salvar alterações'
                    : 'Gravar acerto'}
              </ToolbarButton>
            </>
          ) : (
            <ToolbarButton type="button" $primary onClick={handleNewSettlement}>
              <Plus size={16} aria-hidden="true" />
              Novo acerto
            </ToolbarButton>
          )}
        </ToolbarActions>
      </Toolbar>

      <SettlementTabs
        activeTab={activeTab}
        settlementsCount={settlement.settlements.length}
        showHistory={isAdministrator}
        onChange={handleChangeTab}
      />

      {activeTab === 'FORM' ? (
        <>
          {settlement.savedAt && (
            <SavedNotice role="status">
              <CheckCircle2 size={17} aria-hidden="true" />
              Acerto salvo em{' '}
              {new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(settlement.savedAt))}
              .
            </SavedNotice>
          )}

          <SettlementFilters
            drivers={settlement.drivers}
            selectedDriver={settlement.selectedDriver}
            periodMode={settlement.periodMode}
            selectedMonth={settlement.selectedMonth}
            startDate={settlement.dateRange.startDate}
            endDate={settlement.dateRange.endDate}
            onDriverChange={settlement.setSelectedDriver}
            onMonthChange={settlement.applyMonth}
            onOpenCustomPeriod={() => setIsPeriodModalOpen(true)}
          />

          <TripGrid>
            <TripSettlementTable
              travels={settlement.travels}
              totalNetFreight={settlement.totals.totalNetFreight}
            />
            <VehicleAverageSummary
              summaries={settlement.vehicleSummaries}
              fuelRecords={settlement.fuelRecords}
              selectedFuelRecordIds={settlement.selectedFuelRecordIds}
              onToggleFuelRecord={settlement.toggleFuelRecord}
              onSelectPlate={settlement.selectFuelRecordsByPlate}
            />
          </TripGrid>

          <FinancialPanel
            bonusPercent={settlement.bonusPercent}
            suggestedBonusPercent={settlement.suggestedBonusPercent}
            baseSalary={settlement.baseSalary}
            dailyAllowance={settlement.dailyAllowance}
            otherEarnings={settlement.otherEarnings}
            entries={settlement.entries}
            totals={settlement.totals}
            onBonusPercentChange={settlement.setBonusPercent}
            onBaseSalaryChange={settlement.setBaseSalary}
            onDailyAllowanceChange={settlement.setDailyAllowance}
            onOtherEarningsChange={settlement.setOtherEarnings}
            onApplySuggestedBonus={() =>
              settlement.setBonusPercent(String(settlement.suggestedBonusPercent))
            }
            onAddEntry={handleOpenEntryModal}
            onRemoveEntry={settlement.removeEntry}
          />
        </>
      ) : activeTab === 'LIST' ? (
        <SettlementList
          settlements={settlement.settlements}
          onView={setSelectedSettlement}
          onPrint={printSettlementReport}
          onEdit={handleEditSettlement}
          onDelete={handleDeleteSettlement}
        />
      ) : (
        <SettlementHistory
          events={settlement.history}
          loading={settlement.loading}
          onRefresh={() => {
            settlement.loadHistory().catch((error) => {
              notifications.error(
                'Não foi possível carregar o histórico',
                getApiErrorMessage(error, 'Tente novamente em alguns instantes.'),
              );
            });
          }}
        />
      )}

      {isPeriodModalOpen && (
        <PeriodModal
          isOpen
          initialStartDate={settlement.customStartDate}
          initialEndDate={settlement.customEndDate}
          onClose={() => setIsPeriodModalOpen(false)}
          onApply={settlement.applyCustomPeriod}
        />
      )}

      {isEntryModalOpen && (
        <EntryModal
          isOpen
          type={entryType}
          onClose={() => setIsEntryModalOpen(false)}
          onSubmit={(formData) => settlement.addEntry(entryType, formData)}
        />
      )}

      {selectedSettlement && (
        <SettlementDetailsModal
          settlement={selectedSettlement}
          onClose={() => setSelectedSettlement(null)}
          onPrint={printSettlementReport}
        />
      )}
    </Page>
  );
}

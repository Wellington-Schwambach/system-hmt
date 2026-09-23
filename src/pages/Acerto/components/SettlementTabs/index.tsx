import { ClipboardList, ClipboardPlus, ListChecks } from 'lucide-react';

import type { SettlementTabsProps } from './types';
import { Count, Tab, Tabs } from './styles';

export function SettlementTabs({
  activeTab,
  settlementsCount,
  showHistory,
  onChange,
}: SettlementTabsProps) {
  return (
    <Tabs role="tablist" aria-label="Navegação do acerto de motoristas">
      <Tab
        type="button"
        role="tab"
        aria-selected={activeTab === 'FORM'}
        $active={activeTab === 'FORM'}
        onClick={() => onChange('FORM')}
      >
        <ClipboardPlus size={17} aria-hidden="true" />
        Cadastro do acerto
      </Tab>

      <Tab
        type="button"
        role="tab"
        aria-selected={activeTab === 'LIST'}
        $active={activeTab === 'LIST'}
        onClick={() => onChange('LIST')}
      >
        <ListChecks size={17} aria-hidden="true" />
        Listagem de acertos
        <Count>{settlementsCount}</Count>
      </Tab>

      {showHistory && (
        <Tab
          type="button"
          role="tab"
          aria-selected={activeTab === 'HISTORY'}
          $active={activeTab === 'HISTORY'}
          onClick={() => onChange('HISTORY')}
        >
          <ClipboardList size={17} aria-hidden="true" />
          Histórico ADM
        </Tab>
      )}
    </Tabs>
  );
}

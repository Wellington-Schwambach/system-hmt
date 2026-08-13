import { ClipboardPenLine, List } from 'lucide-react';

import type { VehicleTabsProps } from './types';
import { CountBadge, TabButton, TabsContainer } from './styles';

export function VehicleTabs({ activeTab, vehicleCount, onChange }: VehicleTabsProps) {
  return (
    <TabsContainer aria-label="Navegação do cadastro de veículos">
      <TabButton
        type="button"
        $active={activeTab === 'FORM'}
        onClick={() => onChange('FORM')}
        aria-pressed={activeTab === 'FORM'}
      >
        <ClipboardPenLine size={18} aria-hidden="true" />
        Cadastro
      </TabButton>

      <TabButton
        type="button"
        $active={activeTab === 'LIST'}
        onClick={() => onChange('LIST')}
        aria-pressed={activeTab === 'LIST'}
      >
        <List size={18} aria-hidden="true" />
        Listagem de veículos
        <CountBadge>{vehicleCount}</CountBadge>
      </TabButton>
    </TabsContainer>
  );
}

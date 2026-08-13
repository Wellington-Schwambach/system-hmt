import { ClipboardPenLine, List } from 'lucide-react';

import type { EmployeeTabsProps } from './types';
import { CountBadge, TabButton, TabsContainer } from './styles';

export function EmployeeTabs({ activeTab, employeeCount, onChange }: EmployeeTabsProps) {
  return (
    <TabsContainer aria-label="Navegação do cadastro de colaboradores">
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
        Listagem de colaboradores
        <CountBadge>{employeeCount}</CountBadge>
      </TabButton>
    </TabsContainer>
  );
}

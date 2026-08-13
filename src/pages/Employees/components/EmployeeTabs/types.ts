import type { EmployeeTab } from '../../types';

export interface EmployeeTabsProps {
  activeTab: EmployeeTab;
  employeeCount: number;
  onChange: (tab: EmployeeTab) => void;
}

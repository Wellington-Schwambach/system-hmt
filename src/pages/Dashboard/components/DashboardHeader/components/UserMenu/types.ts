import type { DashboardUser } from '../../types';

export interface UserMenuProps {
  isOpen: boolean;
  user: DashboardUser;
  onToggle: () => void;
  onLogout: () => void;
}

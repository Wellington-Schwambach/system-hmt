import type { NavigationItem } from '../../../../navigation/types';

export interface SidebarProps {
  activeItemId: string;
  items: NavigationItem[];
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onCollapseToggle: () => void;
  onItemSelect: (itemId: string) => void;
}

export interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}

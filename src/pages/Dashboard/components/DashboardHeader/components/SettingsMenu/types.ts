export interface SettingsMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChangePassword?: () => void;
  onEditProfile?: () => void;
  onOpenPreferences?: () => void;
}

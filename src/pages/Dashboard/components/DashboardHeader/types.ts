export interface DashboardUser {
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface DashboardHeaderProps {
  onMenuOpen: () => void;
  onLogout: () => void;
  onChangePassword?: () => void;
  onEditProfile?: () => void;
  onOpenPreferences?: () => void;
  user?: DashboardUser;
}

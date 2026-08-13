import type { ReactNode } from 'react';

import type {
  AuthUser,
  LoginCredentials,
  ThemePreference,
} from '../../services/authService';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  authNotice: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  updateThemePreference: (themePreference: ThemePreference) => Promise<AuthUser | null>;
  clearAuthNotice: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

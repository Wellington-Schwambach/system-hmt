import { createContext } from 'react';

import type { ThemeMode } from '../../styles/theme';

export interface AppThemeContextValue {
  mode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const AppThemeContext = createContext<AppThemeContextValue | null>(null);

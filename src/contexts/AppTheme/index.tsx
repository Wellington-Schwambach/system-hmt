import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '../../styles/GlobalStyle';
import { darkTheme, lightTheme } from '../../styles/theme';
import type { ThemeMode } from '../../styles/theme';
import { useAuth } from '../Auth/useAuth';
import { AppThemeContext } from './context';
import type { AppThemeContextValue } from './context';

const THEME_STORAGE_KEY = 'hmt:theme-mode';

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedMode === 'light' || savedMode === 'dark') {
    return savedMode;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const { user, updateThemePreference } = useAuth();
  const [localMode, setLocalMode] = useState<ThemeMode>(getInitialThemeMode);
  const mode = user?.theme_preference ?? localMode;

  const setTheme = useCallback(
    (nextMode: ThemeMode) => {
      if (user) {
        void updateThemePreference(nextMode).catch((error) => {
          console.error('Não foi possível salvar a preferência de tema.', error);
        });
        return;
      }

      setLocalMode(nextMode);
    },
    [updateThemePreference, user],
  );

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  }, [mode, setTheme]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const contextValue = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      isDarkMode: mode === 'dark',
      toggleTheme,
      setTheme,
    }),
    [mode, setTheme, toggleTheme],
  );

  return (
    <AppThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

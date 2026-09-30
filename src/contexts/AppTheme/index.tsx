import { useCallback, useEffect, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '../../styles/GlobalStyle';
import { darkTheme, lightTheme } from '../../styles/theme';
import type { ThemeMode } from '../../styles/theme';
import { useAuth } from '../Auth/useAuth';
import { AppThemeContext } from './context';
import type { AppThemeContextValue } from './context';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const { user, updateThemePreference } = useAuth();

  // Fora da área autenticada o sistema deve permanecer sempre no tema claro.
  // A preferência de tema só passa a valer depois que existe um usuário logado.
  const mode: ThemeMode = user?.theme_preference ?? 'light';

  const setTheme = useCallback(
    (nextMode: ThemeMode) => {
      if (!user) {
        return;
      }

      void updateThemePreference(nextMode).catch((error) => {
        console.error('Não foi possível salvar a preferência de tema.', error);
      });
    },
    [updateThemePreference, user],
  );

  const toggleTheme = useCallback(() => {
    if (!user) {
      return;
    }

    setTheme(mode === 'light' ? 'dark' : 'light');
  }, [mode, setTheme, user]);

  useEffect(() => {
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

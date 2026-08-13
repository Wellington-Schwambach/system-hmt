import { useContext } from 'react';

import { AppThemeContext } from './context';

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme deve ser utilizado dentro de AppThemeProvider.');
  }

  return context;
}

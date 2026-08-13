import { Moon, Sun } from 'lucide-react';

import { useAppTheme } from '../../../../contexts/AppTheme/useAppTheme';
import { ThemeButton, ThemeButtonLabel } from './styles';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const nextThemeLabel = isDarkMode ? 'claro' : 'escuro';

  return (
    <ThemeButton
      type="button"
      $isDarkMode={isDarkMode}
      onClick={toggleTheme}
      aria-label={`Ativar tema ${nextThemeLabel}`}
      aria-pressed={isDarkMode}
      title={`Ativar tema ${nextThemeLabel}`}
    >
      {isDarkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <ThemeButtonLabel>{isDarkMode ? 'Tema claro' : 'Tema escuro'}</ThemeButtonLabel>
    </ThemeButton>
  );
}

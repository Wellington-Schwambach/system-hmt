export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryDark: string;
    navy: string;
    navyDeep: string;
    text: string;
    textMuted: string;
    textSecondary: string;
    secondary: string;
    border: string;
    borderStrong: string;
    white: string;
    surface: string;
    surfaceElevated: string;
    surfaceGlass: string;
    surfaceGlassStrong: string;
    page: string;
    overlay: string;
    shadow: string;
    brandGreen: string;
    brandGreenDark: string;
    brandGreenSoft: string;
    brandGreenBorder: string;
    brandGreenFocus: string;
    dashboardBackground: string;
    dashboardSurface: string;
    dashboardBorder: string;
    dashboardBorderStrong: string;
    dashboardText: string;
    dashboardTextMuted: string;
    dashboardTextSoft: string;
    danger: string;
    dangerBorder: string;
    dangerSoft: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  font: {
    weight: {
      bold: number;
    };
  };
  transition: string;
  radius: {
    sm: string;
    md: string;
    lg: string;
    pill: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  shadow: {
    card: string;
    soft: string;
    dashboard: string;
    dashboardHover: string;
    green: string;
    greenStrong: string;
  };
}

const sharedTheme = {
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1.5rem',
  },
  font: {
    weight: {
      bold: 700,
    },
  },
  transition: '160ms ease',
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1.5rem',
    pill: '999px',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
} as const;

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: '#1172ee',
    primaryDark: '#0a5bd7',
    navy: '#0b2e52',
    navyDeep: '#061a2f',
    text: '#172235',
    textMuted: '#6b7d98',
    textSecondary: '#6b7d98',
    secondary: '#0b2e52',
    border: '#cfd9e8',
    borderStrong: '#b8c7dc',
    white: '#ffffff',
    surface: '#f7faff',
    surfaceElevated: '#ffffff',
    surfaceGlass: 'rgba(255, 255, 255, 0.94)',
    surfaceGlassStrong: 'rgba(255, 255, 255, 0.98)',
    page: '#eef4fb',
    overlay: 'rgba(4, 20, 37, 0.56)',
    shadow: 'rgba(33, 71, 118, 0.18)',
    brandGreen: '#00a651',
    brandGreenDark: '#007b3d',
    brandGreenSoft: '#e8f8ef',
    brandGreenBorder: '#b8e7cd',
    brandGreenFocus: 'rgba(0, 166, 81, 0.28)',
    dashboardBackground: '#f4f7f5',
    dashboardSurface: '#f8fbf9',
    dashboardBorder: '#e3ebe6',
    dashboardBorderStrong: '#ccd9d1',
    dashboardText: '#202522',
    dashboardTextMuted: '#68736c',
    dashboardTextSoft: '#b0bbb4',
    danger: '#cc3d3d',
    dangerBorder: '#efc9c9',
    dangerSoft: '#fff0f0',
  },
  ...sharedTheme,
  shadow: {
    card: '0 1.5rem 4rem rgba(33, 71, 118, 0.18)',
    soft: '0 0.6rem 1.8rem rgba(31, 69, 48, 0.13)',
    dashboard: '0 0.75rem 2rem rgba(36, 71, 51, 0.07)',
    dashboardHover: '0 1rem 2.4rem rgba(36, 71, 51, 0.12)',
    green: '0 0.55rem 1.4rem rgba(0, 166, 81, 0.2)',
    greenStrong: '0 0.85rem 2rem rgba(0, 123, 61, 0.26)',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',

  colors: {
    // Cores de destaque
    primary: '#3fa66c',
    primaryDark: '#318457',

    // Tons neutros usados onde antes havia azul/verde escuro
    navy: '#c5ccc8',
    navyDeep: '#8e9993',

    // Textos
    text: '#f2f4f3',
    textMuted: '#a1aaa5',
    textSecondary: '#a1aaa5',
    secondary: '#d2d7d4',

    // Bordas
    border: '#343a3e',
    borderStrong: '#474f53',

    white: '#ffffff',

    // Superfícies principais
    surface: '#1c2023',
    surfaceElevated: '#24292d',
    surfaceGlass: 'rgba(28, 32, 35, 0.94)',
    surfaceGlassStrong: 'rgba(36, 41, 45, 0.98)',

    // Fundo geral da aplicação
    page: '#131618',

    overlay: 'rgba(0, 0, 0, 0.74)',
    shadow: 'rgba(0, 0, 0, 0.42)',

    // Verde usado somente como destaque
    brandGreen: '#3fa66c',
    brandGreenDark: '#318457',
    brandGreenSoft: 'rgba(63, 166, 108, 0.13)',
    brandGreenBorder: 'rgba(63, 166, 108, 0.34)',
    brandGreenFocus: 'rgba(63, 166, 108, 0.26)',

    // Dashboard em tons de cinza
    dashboardBackground: '#15181a',
    dashboardSurface: '#202427',
    dashboardBorder: '#343a3e',
    dashboardBorderStrong: '#474f53',

    dashboardText: '#f2f4f3',
    dashboardTextMuted: '#a1aaa5',
    dashboardTextSoft: '#737d78',

    // Estados de erro
    danger: '#ef6b6b',
    dangerBorder: 'rgba(239, 107, 107, 0.36)',
    dangerSoft: 'rgba(239, 107, 107, 0.12)',
  },

  ...sharedTheme,

  shadow: {
    card: '0 1.5rem 4rem rgba(0, 0, 0, 0.4)',
    soft: '0 0.6rem 1.8rem rgba(0, 0, 0, 0.3)',
    dashboard: '0 0.75rem 2rem rgba(0, 0, 0, 0.28)',
    dashboardHover: '0 1rem 2.4rem rgba(0, 0, 0, 0.42)',

    green: '0 0.55rem 1.4rem rgba(63, 166, 108, 0.16)',
    greenStrong: '0 0.85rem 2rem rgba(63, 166, 108, 0.22)',
  },
};

// Mantém compatibilidade com imports antigos que ainda usam `theme`.
export const theme = lightTheme;

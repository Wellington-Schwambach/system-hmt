import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 100%;
    scroll-behavior: smooth;
    color-scheme: ${({ theme }) => theme.mode};
    background: ${({ theme }) => theme.colors.dashboardBackground};
  }

  body {
    margin: 0;
    min-width: 20rem;
    min-height: 100vh;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.page};
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    transition:
      color 220ms ease,
      background 220ms ease;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }

  a {
    color: inherit;
  }

  img {
    max-width: 100%;
  }

  ::selection {
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.brandGreen};
  }

  #root {
    min-height: 100vh;
  }
`;

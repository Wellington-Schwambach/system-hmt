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
    width: 100%;
    min-width: 20rem;
    max-width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
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
    min-width: 0;
    max-width: 100%;
    font: inherit;
  }

  input:not([type='checkbox']):not([type='radio']):not([type='color']):not([type='range']),
  textarea,
  select {
    width: 100%;
  }

  fieldset {
    min-width: 0;
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
    width: 100%;
    min-width: 0;
    min-height: 100vh;
    overflow-x: clip;
  }

  @media (max-width: 36rem) {
    body {
      min-width: 0;
    }
  }
`;

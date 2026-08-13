import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { AppThemeProvider } from './contexts/AppTheme';
import { AuthProvider } from './contexts/Auth';
import { NotificationsProvider } from './contexts/Notifications';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppThemeProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </AppThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);

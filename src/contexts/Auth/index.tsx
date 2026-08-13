import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  authService,
  isUnauthenticatedError,
  type AuthUser,
  type LoginCredentials,
  type ThemePreference,
} from '../../services/authService';
import {
  clearAuthenticatedSession,
  getSessionExpiresAt,
  hasAuthenticatedSessionMarker,
  notifyAuthSessionIssue,
  subscribeToAuthSessionIssues,
  subscribeToSessionExpiryUpdates,
} from '../../services/authSession';
import { AuthContext } from './context';
import type { AuthProviderProps } from './types';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(() =>
    getSessionExpiresAt(),
  );

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const authenticatedUser = await authService.getAuthenticatedUser();
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      if (!isUnauthenticatedError(error)) {
        console.error('Não foi possível validar a sessão atual.', error);
      }

      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribeIssue = subscribeToAuthSessionIssues((issue) => {
      setUser(null);
      setSessionExpiresAt(null);
      setAuthNotice(issue.message);
    });

    const unsubscribeExpiry = subscribeToSessionExpiryUpdates((expiresAt) => {
      setSessionExpiresAt(expiresAt);
    });

    return () => {
      unsubscribeIssue();
      unsubscribeExpiry();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuthentication() {
      try {
        const authenticatedUser = await authService.getAuthenticatedUser();

        if (isMounted) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        if (!isUnauthenticatedError(error)) {
          console.error('Não foi possível iniciar a autenticação.', error);
        }

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapAuthentication();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function validateWhenReturningToSystem() {
      if (document.visibilityState === 'visible' && hasAuthenticatedSessionMarker()) {
        void refreshUser();
      }
    }

    window.addEventListener('focus', validateWhenReturningToSystem);
    document.addEventListener('visibilitychange', validateWhenReturningToSystem);

    return () => {
      window.removeEventListener('focus', validateWhenReturningToSystem);
      document.removeEventListener('visibilitychange', validateWhenReturningToSystem);
    };
  }, [refreshUser]);

  useEffect(() => {
    const windowEndsAt = user?.access.current_window_ends_at;

    if (!windowEndsAt) {
      return undefined;
    }

    const delay = new Date(windowEndsAt).getTime() - Date.now() + 1000;

    const timer = window.setTimeout(() => {
      void refreshUser();
    }, Math.max(0, Math.min(delay, 2_147_000_000)));

    return () => window.clearTimeout(timer);
  }, [refreshUser, user?.access.current_window_ends_at]);

  useEffect(() => {
    if (!user || !sessionExpiresAt) {
      return undefined;
    }

    const delay = new Date(sessionExpiresAt).getTime() - Date.now();

    const timer = window.setTimeout(() => {
      void authService.logout().finally(() => {
        notifyAuthSessionIssue({
          reason: 'expired',
          message: 'Sua sessão expirou. Faça o login novamente para continuar.',
        });
      });
    }, Math.max(0, Math.min(delay, 2_147_000_000)));

    return () => window.clearTimeout(timer);
  }, [sessionExpiresAt, user]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const authenticatedUser = await authService.login(credentials);
    setUser(authenticatedUser);
    setAuthNotice(null);
    return authenticatedUser;
  }, []);

  const updateThemePreference = useCallback(
    async (themePreference: ThemePreference): Promise<AuthUser | null> => {
      if (!user) {
        return null;
      }

      const updatedUser = await authService.updateThemePreference(themePreference);
      setUser(updatedUser);
      return updatedUser;
    },
    [user],
  );

  const logout = useCallback(async (): Promise<void> => {
    clearAuthenticatedSession();

    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSessionExpiresAt(null);
      setAuthNotice(null);
    }
  }, []);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isBootstrapping,
      authNotice,
      login,
      logout,
      refreshUser,
      updateThemePreference,
      clearAuthNotice,
    }),
    [
      authNotice,
      clearAuthNotice,
      isBootstrapping,
      login,
      logout,
      refreshUser,
      updateThemePreference,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

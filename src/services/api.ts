import axios from 'axios';

import {
  hasAuthenticatedSessionMarker,
  notifyAuthSessionIssue,
  updateSessionExpiresAt,
} from './authSession';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const api = axios.create({
  // No desenvolvimento, o Vite encaminha /api e /sanctum ao Laravel.
  // Em produção, defina VITE_API_URL com a URL pública do backend.
  baseURL: configuredApiUrl || undefined,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => {
    updateSessionExpiresAt(response.headers['x-session-expires-at']);
    return response;
  },
  (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.response || !hasAuthenticatedSessionMarker()) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/api/auth/login');

    if (isLoginRequest) {
      return Promise.reject(error);
    }

    if (status === 401 || status === 419) {
      notifyAuthSessionIssue({
        reason: 'expired',
        message: 'Sua sessão expirou. Faça o login novamente para continuar.',
      });
    }

    if (status === 423) {
      const responseMessage = (error.response.data as { message?: string } | undefined)?.message;

      notifyAuthSessionIssue({
        reason: 'access_restricted',
        message:
          responseMessage ??
          'Seu horário de acesso terminou. O sistema foi bloqueado até o próximo expediente.',
      });
    }

    return Promise.reject(error);
  },
);

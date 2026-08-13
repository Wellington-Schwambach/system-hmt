import axios from 'axios';

import { api } from './api';
import { getApiErrorMessage } from '../utils/apiError';
import { clearAuthenticatedSession, markAuthenticatedSession } from './authSession';

export type ThemePreference = 'light' | 'dark';

export interface UserAccessSchedule {
  allowed: boolean;
  enabled: boolean;
  timezone: string;
  start_time: string | null;
  end_time: string | null;
  days: number[];
  current_window_ends_at: string | null;
  next_access_at: string | null;
  message: string | null;
  saturday_enabled: boolean;
  saturday_start_time: string | null;
  saturday_end_time: string | null;
  sunday_enabled: boolean;
  sunday_start_time: string | null;
  sunday_end_time: string | null;
  temporary_override: boolean;
  temporary_access_until: string | null;
  active_schedule: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  role: string;
  theme_preference: ThemePreference;
  permissions: string[];
  access: UserAccessSchedule;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface AuthResponse {
  message: string;
  user: AuthUser;
}

interface CurrentUserResponse {
  user: AuthUser;
}

export function isUnauthenticatedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function getAuthErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, 'Não foi possível realizar o login.');
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await api.get('/sanctum/csrf-cookie');

    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    markAuthenticatedSession();

    return response.data.user;
  },

  async getAuthenticatedUser(): Promise<AuthUser> {
    const response = await api.get<CurrentUserResponse>('/api/auth/me');
    markAuthenticatedSession();

    return response.data.user;
  },

  async updateThemePreference(themePreference: ThemePreference): Promise<AuthUser> {
    const response = await api.put<AuthResponse>('/api/auth/theme', {
      theme_preference: themePreference,
    });

    return response.data.user;
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<string> {
    const response = await api.put<{ message: string }>('/api/auth/password', payload);

    return response.data.message;
  },

  async logout(): Promise<void> {
    clearAuthenticatedSession();
    await api.post('/api/auth/logout');
  },
};

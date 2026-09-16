import { api } from './api';

export type ThemePreference = 'light' | 'dark';

export interface DailyNotePreferenceSetting {
  alert_type: string;
  enabled: boolean;
  days_before: number;
}


export interface CustomDailyAlert {
  id: number;
  title: string;
  observation: string;
  scheduled_at: string;
  days_before: number;
  is_active: boolean;
  created_by: number;
  creator_name: string;
  recipient_ids: number[];
  recipient_names: string[];
}

export interface SaveCustomDailyAlertPayload {
  title: string;
  observation: string;
  scheduled_at: string;
  days_before: number;
  is_active: boolean;
  recipient_ids: number[];
}
export interface DailyNotePreferenceCatalogItem {
  alert_type: string;
  label: string;
  description: string;
  default_days: number;
}

export interface SecurityUser {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  theme_preference: ThemePreference;
  menu_permissions: string[];
  access_schedule_enabled: boolean;
  access_start_time: string | null;
  access_end_time: string | null;
  access_days: number[];
  access_timezone: string;
  saturday_access_enabled: boolean;
  saturday_start_time: string | null;
  saturday_end_time: string | null;
  sunday_access_enabled: boolean;
  sunday_start_time: string | null;
  sunday_end_time: string | null;
  temporary_access_until: string | null;
  temporary_access_ip: string | null;
  last_login_at: string | null;
  daily_note_preferences: DailyNotePreferenceSetting[];
}

export interface PermissionCatalogItem {
  key: string;
  label: string;
  group: string;
  path: string | null;
}

export interface AccessProfile {
  key: string;
  label: string;
  description: string;
  default_permissions: string[];
}

export interface LoginAttempt {
  id: number;
  user_id: number | null;
  name: string | null;
  username: string;
  ip_address: string;
  was_successful: boolean;
  failure_reason: string | null;
  failed_attempt_number: number | null;
  blocked_until: string | null;
  attempted_at: string | null;
  user_agent: string | null;
}

export interface ActiveLoginBlock {
  id: number;
  user_id: number | null;
  name: string | null;
  username: string;
  ip_address: string;
  block_type: 'invalid_credentials' | 'outside_schedule';
  failed_attempt_number: number | null;
  blocked_until: string | null;
  next_access_at: string | null;
  attempted_at: string | null;
  message: string;
}

export interface SecurityPolicy {
  max_failed_attempts: number;
  attempt_window_minutes: number;
  block_minutes: number;
}

export interface SecurityOverview {
  users: SecurityUser[];
  attempts: LoginAttempt[];
  active_blocks: ActiveLoginBlock[];
  policy: SecurityPolicy;
  permission_catalog: PermissionCatalogItem[];
  access_profiles: AccessProfile[];
  daily_note_preference_catalog: DailyNotePreferenceCatalogItem[];
  custom_daily_alerts: CustomDailyAlert[];
}

export interface SaveUserPayload {
  name: string;
  username: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  password?: string;
  theme_preference: ThemePreference;
  menu_permissions: string[];
  access_schedule_enabled: boolean;
  access_start_time: string | null;
  access_end_time: string | null;
  access_days: number[] | null;
  access_timezone: string;
  saturday_access_enabled: boolean;
  saturday_start_time: string | null;
  saturday_end_time: string | null;
  sunday_access_enabled: boolean;
  sunday_start_time: string | null;
  sunday_end_time: string | null;
}

export interface UpdateAccessSchedulePayload {
  access_schedule_enabled: boolean;
  access_start_time: string | null;
  access_end_time: string | null;
  access_days: number[] | null;
  access_timezone: string;
  saturday_access_enabled: boolean;
  saturday_start_time: string | null;
  saturday_end_time: string | null;
  sunday_access_enabled: boolean;
  sunday_start_time: string | null;
  sunday_end_time: string | null;
}

interface UserMutationResponse {
  message: string;
  user: SecurityUser;
}

interface UnblockResponse {
  message: string;
  updated_records: number;
  temporary_access_until: string | null;
}

export const securityService = {
  async getOverview(): Promise<SecurityOverview> {
    const response = await api.get<SecurityOverview>('/api/admin/security/overview');
    return response.data;
  },

  async createUser(payload: SaveUserPayload): Promise<UserMutationResponse> {
    const response = await api.post<UserMutationResponse>('/api/admin/security/users', payload);
    return response.data;
  },

  async updateUser(userId: number, payload: SaveUserPayload): Promise<UserMutationResponse> {
    const response = await api.put<UserMutationResponse>(
      `/api/admin/security/users/${userId}`,
      payload,
    );
    return response.data;
  },

  async updateAccessSchedule(
    userId: number,
    payload: UpdateAccessSchedulePayload,
  ): Promise<UserMutationResponse> {
    const response = await api.put<UserMutationResponse>(
      `/api/admin/security/users/${userId}/access-schedule`,
      payload,
    );

    return response.data;
  },

  async updateDailyNotePreferences(
    userId: number,
    preferences: DailyNotePreferenceSetting[],
  ): Promise<UserMutationResponse> {
    const response = await api.put<UserMutationResponse>(
      `/api/admin/security/users/${userId}/daily-note-preferences`,
      { preferences },
    );

    return response.data;
  },

  async createCustomDailyAlert(payload: SaveCustomDailyAlertPayload): Promise<{ message: string; alert: CustomDailyAlert }> {
    const response = await api.post<{ message: string; alert: CustomDailyAlert }>(
      '/api/admin/security/custom-alerts',
      payload,
    );
    return response.data;
  },

  async updateCustomDailyAlert(
    alertId: number,
    payload: SaveCustomDailyAlertPayload,
  ): Promise<{ message: string; alert: CustomDailyAlert }> {
    const response = await api.put<{ message: string; alert: CustomDailyAlert }>(
      `/api/admin/security/custom-alerts/${alertId}`,
      payload,
    );
    return response.data;
  },

  async deleteCustomDailyAlert(alertId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/admin/security/custom-alerts/${alertId}`,
    );
    return response.data;
  },

  async unblock(
    username: string,
    ipAddress: string,
    durationMinutes: number,
  ): Promise<UnblockResponse> {
    const response = await api.post<UnblockResponse>('/api/admin/security/blocks/unblock', {
      username,
      ip_address: ipAddress,
      duration_minutes: durationMinutes,
    });

    return response.data;
  },
};

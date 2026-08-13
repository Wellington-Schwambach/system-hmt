import type { SecurityUser, ThemePreference } from '../../services/securityService';

export type SecurityTab = 'users' | 'rules' | 'blocks' | 'tryacess';

export interface UserFormState {
  id: number | null;
  name: string;
  username: string;
  phone: string;
  role: string;
  is_active: boolean;
  password: string;
  theme_preference: ThemePreference;
  menu_permissions: string[];
  access_schedule_enabled: boolean;
  access_start_time: string;
  access_end_time: string;
  access_days: number[];
  access_timezone: string;
  saturday_access_enabled: boolean;
  saturday_start_time: string;
  saturday_end_time: string;
  sunday_access_enabled: boolean;
  sunday_start_time: string;
  sunday_end_time: string;
}

export function formFromUser(user: SecurityUser): UserFormState {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    phone: user.phone ?? '',
    role: user.role,
    is_active: user.is_active,
    password: '',
    theme_preference: user.theme_preference,
    menu_permissions: user.menu_permissions,
    access_schedule_enabled: user.access_schedule_enabled,
    access_start_time: user.access_start_time ?? '08:00',
    access_end_time: user.access_end_time ?? '18:00',
    access_days: user.access_days,
    access_timezone: user.access_timezone || 'America/Sao_Paulo',
    saturday_access_enabled: user.saturday_access_enabled,
    saturday_start_time: user.saturday_start_time ?? '08:00',
    saturday_end_time: user.saturday_end_time ?? '12:00',
    sunday_access_enabled: user.sunday_access_enabled,
    sunday_start_time: user.sunday_start_time ?? '08:00',
    sunday_end_time: user.sunday_end_time ?? '18:00',
  };
}

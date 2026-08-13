export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  message?: string;
  details?: string[];
  type?: NotificationType;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  details?: string[];
  type?: Exclude<NotificationType, 'success'>;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface NotificationItem extends Required<Pick<NotificationOptions, 'title' | 'type'>> {
  id: string;
  message?: string;
  details: string[];
  duration: number;
}

export interface NotificationsContextValue {
  notify: (options: NotificationOptions) => string;
  success: (title: string, message?: string, details?: string[]) => string;
  error: (title: string, message?: string, details?: string[]) => string;
  warning: (title: string, message?: string, details?: string[]) => string;
  info: (title: string, message?: string, details?: string[]) => string;
  dismiss: (id: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

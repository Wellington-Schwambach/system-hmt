/* eslint-disable react-refresh/only-export-components */
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import { NotificationsContext } from './context';
import {
  ConfirmBackdrop,
  ConfirmBody,
  ConfirmButton,
  ConfirmCard,
  ConfirmDetails,
  ConfirmFooter,
  ConfirmIcon,
  ConfirmMessage,
  ConfirmTitle,
  ToastCard,
  ToastClose,
  ToastContent,
  ToastDetails,
  ToastIcon,
  ToastMessage,
  ToastProgress,
  ToastTitle,
  ToastViewport,
} from './styles';
import type {
  ConfirmOptions,
  NotificationItem,
  NotificationOptions,
  NotificationType,
  NotificationsContextValue,
} from './types';

interface PendingConfirmation {
  options: Required<Pick<ConfirmOptions, 'title' | 'message' | 'type' | 'confirmLabel' | 'cancelLabel'>> &
    Pick<ConfirmOptions, 'details'>;
  resolve: (value: boolean) => void;
}

const ICONS = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
} satisfies Record<NotificationType, typeof Info>;

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (options: NotificationOptions) => {
      const id = createId();
      const type = options.type ?? 'info';
      const duration = options.duration ?? (type === 'error' ? 7500 : 5000);
      const item: NotificationItem = {
        id,
        title: options.title,
        message: options.message,
        details: [...new Set(options.details ?? [])].slice(0, 6),
        type,
        duration,
      };

      setNotifications((current) => [...current.slice(-3), item]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPendingConfirmation({
        options: {
          title: options.title,
          message: options.message,
          details: options.details,
          type: options.type ?? 'warning',
          confirmLabel: options.confirmLabel ?? 'Confirmar',
          cancelLabel: options.cancelLabel ?? 'Cancelar',
        },
        resolve,
      });
    });
  }, []);

  const settleConfirmation = useCallback((value: boolean) => {
    setPendingConfirmation((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!pendingConfirmation) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') settleConfirmation(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingConfirmation, settleConfirmation]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notify,
      dismiss,
      confirm,
      success: (title, message, details) => notify({ title, message, details, type: 'success' }),
      error: (title, message, details) => notify({ title, message, details, type: 'error' }),
      warning: (title, message, details) => notify({ title, message, details, type: 'warning' }),
      info: (title, message, details) => notify({ title, message, details, type: 'info' }),
    }),
    [confirm, dismiss, notify],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {createPortal(
        <>
          <ToastViewport aria-live="polite" aria-label="Notificações do sistema">
            {notifications.map((item) => {
              const Icon = ICONS[item.type];
              return (
                <ToastCard key={item.id} $type={item.type} role={item.type === 'error' ? 'alert' : 'status'}>
                  <ToastIcon $type={item.type}>
                    <Icon size={20} aria-hidden="true" />
                  </ToastIcon>
                  <ToastContent>
                    <ToastTitle>{item.title}</ToastTitle>
                    {item.message ? <ToastMessage>{item.message}</ToastMessage> : null}
                    {item.details.length ? (
                      <ToastDetails>
                        {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                      </ToastDetails>
                    ) : null}
                  </ToastContent>
                  <ToastClose type="button" onClick={() => dismiss(item.id)} aria-label="Fechar notificação">
                    <X size={16} aria-hidden="true" />
                  </ToastClose>
                  <ToastProgress $type={item.type} $duration={item.duration} />
                </ToastCard>
              );
            })}
          </ToastViewport>

          {pendingConfirmation ? (
            <ConfirmBackdrop
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) settleConfirmation(false);
              }}
            >
              <ConfirmCard role="alertdialog" aria-modal="true">
                <ConfirmBody>
                  <ConfirmIcon $type={pendingConfirmation.options.type}>
                    {pendingConfirmation.options.type === 'error' ? (
                      <CircleAlert size={27} aria-hidden="true" />
                    ) : pendingConfirmation.options.type === 'info' ? (
                      <Info size={27} aria-hidden="true" />
                    ) : (
                      <TriangleAlert size={27} aria-hidden="true" />
                    )}
                  </ConfirmIcon>
                  <ConfirmTitle>{pendingConfirmation.options.title}</ConfirmTitle>
                  <ConfirmMessage>{pendingConfirmation.options.message}</ConfirmMessage>
                  {pendingConfirmation.options.details?.length ? (
                    <ConfirmDetails>
                      {pendingConfirmation.options.details.map((detail) => <li key={detail}>{detail}</li>)}
                    </ConfirmDetails>
                  ) : null}
                </ConfirmBody>
                <ConfirmFooter>
                  <ConfirmButton type="button" onClick={() => settleConfirmation(false)}>
                    {pendingConfirmation.options.cancelLabel}
                  </ConfirmButton>
                  <ConfirmButton
                    type="button"
                    $primary
                    $type={pendingConfirmation.options.type}
                    onClick={() => settleConfirmation(true)}
                    autoFocus
                  >
                    {pendingConfirmation.options.confirmLabel}
                  </ConfirmButton>
                </ConfirmFooter>
              </ConfirmCard>
            </ConfirmBackdrop>
          ) : null}
        </>,
        document.body,
      )}
    </NotificationsContext.Provider>
  );
}

export { useNotifications } from './useNotifications';
export type { ConfirmOptions, NotificationOptions, NotificationType } from './types';

export type AuthSessionIssueReason = 'expired' | 'access_restricted';

export interface AuthSessionIssue {
  reason: AuthSessionIssueReason;
  message: string;
}

const AUTH_SESSION_MARKER = 'hmt.authenticated-session';
const AUTH_SESSION_EXPIRY = 'hmt.session-expires-at';
const AUTH_SESSION_EVENT = 'hmt:auth-session-issue';
const AUTH_SESSION_EXPIRY_EVENT = 'hmt:auth-session-expiry-updated';

export function markAuthenticatedSession(): void {
  window.sessionStorage.setItem(AUTH_SESSION_MARKER, '1');
}

export function clearAuthenticatedSession(): void {
  window.sessionStorage.removeItem(AUTH_SESSION_MARKER);
  window.sessionStorage.removeItem(AUTH_SESSION_EXPIRY);
}

export function hasAuthenticatedSessionMarker(): boolean {
  return window.sessionStorage.getItem(AUTH_SESSION_MARKER) === '1';
}

export function updateSessionExpiresAt(value: string | null | undefined): void {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return;
  }

  window.sessionStorage.setItem(AUTH_SESSION_EXPIRY, value);
  window.dispatchEvent(new CustomEvent<string>(AUTH_SESSION_EXPIRY_EVENT, { detail: value }));
}

export function getSessionExpiresAt(): string | null {
  return window.sessionStorage.getItem(AUTH_SESSION_EXPIRY);
}

export function notifyAuthSessionIssue(issue: AuthSessionIssue): void {
  clearAuthenticatedSession();
  window.dispatchEvent(new CustomEvent<AuthSessionIssue>(AUTH_SESSION_EVENT, { detail: issue }));
}

export function subscribeToAuthSessionIssues(
  listener: (issue: AuthSessionIssue) => void,
): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<AuthSessionIssue>).detail);
  };

  window.addEventListener(AUTH_SESSION_EVENT, handler);

  return () => window.removeEventListener(AUTH_SESSION_EVENT, handler);
}

export function subscribeToSessionExpiryUpdates(listener: (expiresAt: string) => void): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<string>).detail);
  };

  window.addEventListener(AUTH_SESSION_EXPIRY_EVENT, handler);

  return () => window.removeEventListener(AUTH_SESSION_EXPIRY_EVENT, handler);
}

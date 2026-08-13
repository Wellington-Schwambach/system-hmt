import type { AuthUser } from '../services/authService';
import { APP_NAVIGATION_ITEMS } from './constants';
import type { NavigationItem } from './types';

export function hasPermission(user: AuthUser | null, permission?: string): boolean {
  if (!user) {
    return false;
  }

  if (user.role.toLowerCase() === 'administrador') {
    return true;
  }

  return permission ? user.permissions.includes(permission) : true;
}

export function getVisibleNavigationItems(user: AuthUser | null): NavigationItem[] {
  if (!user) {
    return [];
  }

  return APP_NAVIGATION_ITEMS.flatMap((item) => {
    if (item.roles && !item.roles.includes(user.role)) {
      return [];
    }

    if (item.children) {
      const children = item.children.filter((child) => hasPermission(user, child.permission));
      return children.length ? [{ ...item, children }] : [];
    }

    return hasPermission(user, item.permission) ? [item] : [];
  });
}


export function canAccessPath(user: AuthUser | null, path: string): boolean {
  return getVisibleNavigationItems(user).some(
    (item) => item.path === path || item.children?.some((child) => child.path === path),
  );
}

export function getFirstAccessiblePath(user: AuthUser | null): string {
  const items = getVisibleNavigationItems(user);

  for (const item of items) {
    if (item.path) {
      return item.path;
    }

    const childPath = item.children?.[0]?.path;
    if (childPath) {
      return childPath;
    }
  }

  return '/sem-acesso';
}

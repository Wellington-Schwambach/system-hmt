import { createContext } from 'react';

import type { NotificationsContextValue } from './types';

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

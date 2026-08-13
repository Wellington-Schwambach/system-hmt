import { useCallback, useEffect, useState } from 'react';

import { breakpoints } from '../../styles/breakpoints';

const NOTEBOOK_QUERY = `(min-width: 56.251rem) and (max-width: ${breakpoints.desktop})`;

function getInitialSidebarCollapsed() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(NOTEBOOK_QUERY).matches;
}

export function useDashboardSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialSidebarCollapsed);

  useEffect(() => {
    const notebookMediaQuery = window.matchMedia(NOTEBOOK_QUERY);

    function handleNotebookChange(event: MediaQueryListEvent) {
      setIsSidebarCollapsed(event.matches);
    }

    notebookMediaQuery.addEventListener('change', handleNotebookChange);

    return () => {
      notebookMediaQuery.removeEventListener('change', handleNotebookChange);
    };
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed((currentValue) => !currentValue);
  }, []);

  return {
    isSidebarOpen,
    isSidebarCollapsed,
    openSidebar,
    closeSidebar,
    toggleSidebarCollapsed,
  };
}

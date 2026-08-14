import { useCallback, useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 56.251rem)';

function isDesktopViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches;
}

function getInitialSidebarCollapsed() {
  if (typeof window === 'undefined') return true;
  return isDesktopViewport();
}

export function useDashboardSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialSidebarCollapsed);

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia(DESKTOP_QUERY);

    function handleViewportChange(event: MediaQueryListEvent) {
      setIsSidebarCollapsed(event.matches);
    }

    desktopMediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      desktopMediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const expandSidebar = useCallback(() => {
    if (isDesktopViewport()) setIsSidebarCollapsed(false);
  }, []);

  const collapseSidebar = useCallback(() => {
    if (isDesktopViewport()) setIsSidebarCollapsed(true);
  }, []);

  return {
    isSidebarOpen,
    isSidebarCollapsed,
    openSidebar,
    closeSidebar,
    expandSidebar,
    collapseSidebar,
  };
}

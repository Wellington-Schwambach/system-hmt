import { useCallback, useEffect, useRef, useState } from 'react';

export type DashboardHeaderMenu = 'settings' | 'user' | null;

export function useDashboardHeaderMenus() {
  const [openMenu, setOpenMenu] = useState<DashboardHeaderMenu>(null);

  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const closeMenus = useCallback(() => {
    setOpenMenu(null);
  }, []);

  const toggleMenu = useCallback((menu: Exclude<DashboardHeaderMenu, null>) => {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const clickedInsideSettings = settingsMenuRef.current?.contains(target);
      const clickedInsideUser = userMenuRef.current?.contains(target);

      if (!clickedInsideSettings && !clickedInsideUser) {
        closeMenus();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenus]);

  return {
    openMenu,
    settingsMenuRef,
    userMenuRef,
    closeMenus,
    toggleMenu,
  };
}

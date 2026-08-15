import { ChevronDown, Truck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import logo from '../../assets/henrique-transportes-logo.png';
import { useAuth } from '../../contexts/Auth/useAuth';
import { getVisibleNavigationItems } from '../../navigation/access';
import type { NavigationItem } from '../../navigation/types';
import {
  Brand,
  BrandCompact,
  BrandImage,
  CloseButton,
  GroupChevron,
  MenuButton,
  MenuIcon,
  MenuLabel,
  MenuList,
  SidebarBackdrop,
  SidebarContainer,
  SidebarHeader,
  SubmenuButton,
  SubmenuIcon,
  SubmenuLabel,
  SubmenuList,
} from './styles';
import type { SidebarProps } from './types';

function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
  if (item.path === pathname) {
    return true;
  }

  return item.children?.some((child) => child.path === pathname) ?? false;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onExpand, onCollapse }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const visibleItems = useMemo(() => getVisibleNavigationItems(user), [user]);
  const activeGroupIds = useMemo(
    () =>
      visibleItems
        .filter((item) => item.children?.some((child) => child.path === location.pathname))
        .map((item) => item.id),
    [location.pathname, visibleItems],
  );
  const [openGroupIds, setOpenGroupIds] = useState<string[]>(activeGroupIds);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleNavigation(path?: string) {
    if (!path) {
      return;
    }

    navigate(path);
    onClose();
  }

  function handleGroupToggle(groupId: string) {
    if (isCollapsed) onExpand();

    setOpenGroupIds((currentIds) =>
      currentIds.includes(groupId)
        ? currentIds.filter((currentId) => currentId !== groupId)
        : [...currentIds, groupId],
    );
  }

  return (
    <>
      <SidebarBackdrop
        type="button"
        $isOpen={isOpen}
        onClick={onClose}
        aria-label="Fechar menu lateral"
        tabIndex={isOpen ? 0 : -1}
      />

      <SidebarContainer
        $isOpen={isOpen}
        $isCollapsed={isCollapsed}
        aria-label="Navegação principal"
        onMouseEnter={onExpand}
        onMouseLeave={onCollapse}
        onFocusCapture={onExpand}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onCollapse();
        }}
      >
        <SidebarHeader $isCollapsed={isCollapsed}>
          <Brand
            to="/dashboard"
            $isCollapsed={isCollapsed}
            aria-label="Henrique Transportes, página inicial"
          >
            <BrandImage $isCollapsed={isCollapsed} src={logo} alt="Henrique Transportes" />

            <BrandCompact $isCollapsed={isCollapsed} aria-hidden="true">
              <Truck size={23} strokeWidth={2.2} />
            </BrandCompact>
          </Brand>

          <CloseButton type="button" onClick={onClose} aria-label="Fechar menu lateral">
            <X size={20} aria-hidden="true" />
          </CloseButton>
        </SidebarHeader>

        <MenuList>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(item, location.pathname);
            const hasChildren = Boolean(item.children?.length);
            const isGroupOpen = openGroupIds.includes(item.id) || activeGroupIds.includes(item.id);

            return (
              <li key={item.id}>
                <MenuButton
                  type="button"
                  $isActive={isActive}
                  $isCollapsed={isCollapsed}
                  onClick={() =>
                    hasChildren ? handleGroupToggle(item.id) : handleNavigation(item.path)
                  }
                  aria-current={isActive && !hasChildren ? 'page' : undefined}
                  aria-expanded={hasChildren ? isGroupOpen : undefined}
                  aria-controls={hasChildren ? `submenu-${item.id}` : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <MenuIcon $isActive={isActive}>
                    <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                  </MenuIcon>

                  <MenuLabel $isCollapsed={isCollapsed}>{item.label}</MenuLabel>

                  {hasChildren && (
                    <GroupChevron
                      $isCollapsed={isCollapsed}
                      $isOpen={isGroupOpen}
                      aria-hidden="true"
                    >
                      <ChevronDown size={17} />
                    </GroupChevron>
                  )}
                </MenuButton>

                {hasChildren && (
                  <SubmenuList
                    id={`submenu-${item.id}`}
                    $isOpen={isGroupOpen && !isCollapsed}
                    aria-label={`Submenu de ${item.label}`}
                  >
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = child.path === location.pathname;

                      return (
                        <li key={child.id}>
                          <SubmenuButton
                            type="button"
                            $isActive={isChildActive}
                            onClick={() => handleNavigation(child.path)}
                            aria-current={isChildActive ? 'page' : undefined}
                          >
                            <SubmenuIcon $isActive={isChildActive}>
                              <ChildIcon size={17} strokeWidth={2.1} aria-hidden="true" />
                            </SubmenuIcon>
                            <SubmenuLabel>{child.label}</SubmenuLabel>
                          </SubmenuButton>
                        </li>
                      );
                    })}
                  </SubmenuList>
                )}
              </li>
            );
          })}
        </MenuList>

      </SidebarContainer>
    </>
  );
}

import { PanelLeftClose, PanelLeftOpen, Truck, X } from 'lucide-react';
import { useEffect } from 'react';

import logo from '../../../../assets/henrique-transportes-logo.png';
import type { SidebarProps } from './types';
import {
  Brand,
  BrandCompact,
  BrandImage,
  CloseButton,
  CollapseButton,
  CollapseLabel,
  MenuButton,
  MenuIcon,
  MenuLabel,
  MenuList,
  SidebarBackdrop,
  SidebarContainer,
  SidebarFooter,
  SidebarHeader,
} from './styles';

export function Sidebar({
  activeItemId,
  items,
  isOpen,
  isCollapsed,
  onClose,
  onCollapseToggle,
  onItemSelect,
}: SidebarProps) {
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
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItemId;

            return (
              <li key={item.id}>
                <MenuButton
                  type="button"
                  $isActive={isActive}
                  $isCollapsed={isCollapsed}
                  onClick={() => onItemSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <MenuIcon $isActive={isActive}>
                    <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                  </MenuIcon>

                  <MenuLabel $isCollapsed={isCollapsed}>{item.label}</MenuLabel>
                </MenuButton>
              </li>
            );
          })}
        </MenuList>

        <SidebarFooter $isCollapsed={isCollapsed}>
          <CollapseButton
            type="button"
            $isCollapsed={isCollapsed}
            onClick={onCollapseToggle}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={19} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={19} aria-hidden="true" />
            )}

            <CollapseLabel $isCollapsed={isCollapsed}>Recolher menu</CollapseLabel>
          </CollapseButton>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}

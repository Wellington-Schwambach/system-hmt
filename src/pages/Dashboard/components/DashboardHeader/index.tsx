import { Menu } from 'lucide-react';

import { SettingsMenu } from './components/SettingsMenu';
import { UserMenu } from './components/UserMenu';
import { useDashboardHeaderMenus } from './hooks';
import { Actions, Eyebrow, Header, HeaderCopy, MenuButton, MenuSlot } from './styles';
import type { DashboardHeaderProps } from './types';

const DEFAULT_USER = {
  name: 'Usuário',
  role: 'Administrador',
};

export function DashboardHeader({
  onMenuOpen,
  onLogout,
  onChangePassword,
  onEditProfile,
  onOpenPreferences,
  user = DEFAULT_USER,
}: DashboardHeaderProps) {
  const { openMenu, settingsMenuRef, userMenuRef, closeMenus, toggleMenu } =
    useDashboardHeaderMenus();

  return (
    <Header>
      <MenuButton type="button" onClick={onMenuOpen} aria-label="Abrir menu lateral">
        <Menu size={22} aria-hidden="true" />
      </MenuButton>

      <HeaderCopy>
        <Eyebrow>Henrique Transportes</Eyebrow>
      </HeaderCopy>

      <Actions>
        <MenuSlot ref={settingsMenuRef}>
          <SettingsMenu
            isOpen={openMenu === 'settings'}
            onToggle={() => toggleMenu('settings')}
            onClose={closeMenus}
            onChangePassword={onChangePassword}
            onEditProfile={onEditProfile}
            onOpenPreferences={onOpenPreferences}
          />
        </MenuSlot>

        <MenuSlot ref={userMenuRef}>
          <UserMenu
            isOpen={openMenu === 'user'}
            user={user}
            onToggle={() => toggleMenu('user')}
            onLogout={onLogout}
          />
        </MenuSlot>
      </Actions>
    </Header>
  );
}

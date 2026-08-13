import { LogOut } from 'lucide-react';

import {
  DropdownDivider,
  DropdownItem,
  DropdownItemContent,
  DropdownItemDescription,
  DropdownItemIcon,
  DropdownItemTitle,
  DropdownPanel,
} from '../../sharedStyles';
import {
  AvatarImage,
  AvatarInitials,
  LargeAvatar,
  OnlineIndicator,
  UserButton,
  UserCopy,
  UserInfo,
  UserName,
  UserRole,
} from './styles';
import type { UserMenuProps } from './types';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function UserMenu({ isOpen, user, onToggle, onLogout }: UserMenuProps) {
  const initials = getInitials(user.name) || 'U';

  return (
    <>
      <UserButton
        type="button"
        $open={isOpen}
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Abrir menu do usuário ${user.name}`}
      >
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt="" />
        ) : (
          <AvatarInitials aria-hidden="true">{initials}</AvatarInitials>
        )}
        <OnlineIndicator aria-hidden="true" />
      </UserButton>

      {isOpen && (
        <DropdownPanel role="menu" aria-label="Menu do usuário">
          <UserInfo>
            <LargeAvatar>
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : (
                <AvatarInitials aria-hidden="true">{initials}</AvatarInitials>
              )}
            </LargeAvatar>

            <UserCopy>
              <UserName>{user.name}</UserName>
              <UserRole>{user.role ?? 'Usuário do sistema'}</UserRole>
            </UserCopy>
          </UserInfo>

          <DropdownDivider />

          <DropdownItem type="button" role="menuitem" $danger onClick={onLogout}>
            <DropdownItemIcon $danger>
              <LogOut size={18} aria-hidden="true" />
            </DropdownItemIcon>
            <DropdownItemContent>
              <DropdownItemTitle>Sair do sistema</DropdownItemTitle>
              <DropdownItemDescription>Encerrar a sessão atual.</DropdownItemDescription>
            </DropdownItemContent>
          </DropdownItem>
        </DropdownPanel>
      )}
    </>
  );
}

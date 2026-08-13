import { ChevronDown, KeyRound, Settings2 } from 'lucide-react';

import {
  DropdownDescription,
  DropdownHeader,
  DropdownItem,
  DropdownItemContent,
  DropdownItemDescription,
  DropdownItemIcon,
  DropdownItemTitle,
  DropdownPanel,
  DropdownTitle,
} from '../../sharedStyles';
import { Chevron, SettingsButton } from './styles';
import type { SettingsMenuProps } from './types';

export function SettingsMenu({
  isOpen,
  onToggle,
  onClose,
  onChangePassword,
}: SettingsMenuProps) {
  function handleAction(action?: () => void) {
    action?.();
    onClose();
  }

  return (
    <>
      <SettingsButton
        type="button"
        $open={isOpen}
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Abrir configurações"
      >
        <Settings2 size={18} aria-hidden="true" />
        <span>Configurações</span>
        <Chevron $open={isOpen} aria-hidden="true">
          <ChevronDown size={15} />
        </Chevron>
      </SettingsButton>

      {isOpen && (
        <DropdownPanel role="menu" aria-label="Menu de configurações">
          <DropdownHeader>
            <DropdownTitle>Configurações</DropdownTitle>
            <DropdownDescription>
              Gerencie seus dados e preferências do sistema.
            </DropdownDescription>
          </DropdownHeader>

          <DropdownItem
            type="button"
            role="menuitem"
            onClick={() => handleAction(onChangePassword)}
          >
            <DropdownItemIcon>
              <KeyRound size={18} aria-hidden="true" />
            </DropdownItemIcon>
            <DropdownItemContent>
              <DropdownItemTitle>Alterar senha</DropdownItemTitle>
              <DropdownItemDescription>Atualize sua senha de acesso.</DropdownItemDescription>
            </DropdownItemContent>
          </DropdownItem>

          {/* No momento sem Utilidade */}
            {/* <DropdownItem type="button" role="menuitem" onClick={() => handleAction(onEditProfile)}>
                  <DropdownItemIcon>
                    <UserRoundCog size={18} aria-hidden="true" />
                  </DropdownItemIcon>
                  <DropdownItemContent>
                    <DropdownItemTitle>Atualizar cadastro</DropdownItemTitle>
                    <DropdownItemDescription>Edite suas informações pessoais.</DropdownItemDescription>
                  </DropdownItemContent>
                </DropdownItem>
                <DropdownItem
                    type="button"
                    role="menuitem"
                    onClick={() => handleAction(onOpenPreferences)}
                  >
                  <DropdownItemIcon>
                    <SlidersHorizontal size={18} aria-hidden="true" />
                  </DropdownItemIcon>
                  <DropdownItemContent>
                    <DropdownItemTitle>Preferências</DropdownItemTitle>
                    <DropdownItemDescription>
                      Personalize sua experiência no sistema.
                    </DropdownItemDescription>
                  </DropdownItemContent>
                </DropdownItem>
          */}
        </DropdownPanel>
      )}
    </>
  );
}

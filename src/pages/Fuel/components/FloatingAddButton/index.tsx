import { Plus } from 'lucide-react';

import type { FloatingAddButtonProps } from './types';
import { Button, ButtonLabel } from './styles';

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <Button type="button" onClick={onClick} aria-label="Adicionar abastecimento">
      <Plus size={22} strokeWidth={2.4} aria-hidden="true" />
      <ButtonLabel>Adicionar</ButtonLabel>
    </Button>
  );
}

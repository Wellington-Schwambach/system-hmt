import { Headphones } from 'lucide-react';

import { Button } from './styles';

export function SupportButton() {
  return (
    <Button type="button" aria-label="Abrir atendimento de suporte">
      <Headphones size={20} aria-hidden="true" />
      <span>Suporte</span>
    </Button>
  );
}

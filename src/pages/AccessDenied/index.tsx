import { LockKeyhole } from 'lucide-react';

import { Card, Description, IconWrap, Page, Title } from './styles';

export function AccessDenied() {
  return (
    <Page>
      <Card>
        <IconWrap>
          <LockKeyhole size={30} aria-hidden="true" />
        </IconWrap>
        <Title>Nenhum menu liberado</Title>
        <Description>
          Seu usuário está ativo, mas ainda não possui permissões de menu. Solicite ao administrador
          a liberação dos módulos necessários.
        </Description>
      </Card>
    </Page>
  );
}

import { Badge, Container, Content, Description, IconBox, Title } from './styles';
import type { ModulePlaceholderProps } from './types';

export function ModulePlaceholder({ title, description, icon: Icon }: ModulePlaceholderProps) {
  return (
    <Container>
      <Content>
        <IconBox aria-hidden="true">
          <Icon size={30} strokeWidth={2} />
        </IconBox>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Badge>Módulo preparado para próxima implementação</Badge>
      </Content>
    </Container>
  );
}

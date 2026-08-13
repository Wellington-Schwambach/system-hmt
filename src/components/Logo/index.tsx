import { Truck } from 'lucide-react';

import { Container, Content, Icon, Subtitle, Title } from './styles';

function Logo() {
  return (
    <Container>
      <Icon>
        <Truck size={24} aria-hidden="true" />
      </Icon>

      <Content>
        <Title>HMT Transportes</Title>
        <Subtitle>Sistema de Gestão Logística</Subtitle>
      </Content>
    </Container>
  );
}

export default Logo;

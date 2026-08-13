import { Brand } from '../Brand';
import { LoginForm } from '../LoginForm';
import {
  MobileBrand,
  PanelContainer,
  PanelEyebrow,
  PanelFooter,
  PanelHeader,
  PanelSubtitle,
  PanelTitle,
} from './styles';

export function LoginPanel() {
  return (
    <PanelContainer aria-labelledby="login-title">
      <MobileBrand>
        <Brand compact />
      </MobileBrand>

      <PanelHeader>
        <PanelEyebrow>Henrique Transportes</PanelEyebrow>
        <PanelTitle id="login-title">Acesse sua conta</PanelTitle>
        <PanelSubtitle>Entre com suas credenciais para acessar o sistema.</PanelSubtitle>
      </PanelHeader>

      <LoginForm />

      <PanelFooter>© 2026 Henrique Transportes. Todos os direitos reservados.</PanelFooter>
    </PanelContainer>
  );
}

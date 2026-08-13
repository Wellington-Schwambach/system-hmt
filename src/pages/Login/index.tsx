import { HeroPanel } from './components/HeroPanel';
import { LoginPanel } from './components/LoginPanel';
import { LoginPage, PanelArea } from './styles';

export function Login() {
  return (
    <LoginPage>
      <HeroPanel />
      <PanelArea>
        <LoginPanel />
      </PanelArea>
    </LoginPage>
  );
}

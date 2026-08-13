import { Loader, LoaderText, Wrapper } from './styles';

export function PageLoader() {
  return (
    <Wrapper role="status" aria-live="polite" aria-label="Carregando página">
      <Loader aria-hidden="true" />
      <LoaderText>Carregando...</LoaderText>
    </Wrapper>
  );
}

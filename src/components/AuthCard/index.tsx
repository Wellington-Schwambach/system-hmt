import { AuthCardProps } from './types';
import { Container } from './styles';

export function AuthCard({ children }: AuthCardProps) {
  return <Container>{children}</Container>;
}

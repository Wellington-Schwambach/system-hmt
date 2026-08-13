import { StyledButton } from './styles';
import type { ButtonProps } from './types';

export function Button({
  children,
  leadingIcon,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <StyledButton $fullWidth={fullWidth} $variant={variant} type={type} {...props}>
      {leadingIcon}
      {children}
    </StyledButton>
  );
}

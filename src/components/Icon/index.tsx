import { IconWrapper } from './styles';
import type { IconProps } from './types';

export function Icon({ icon: SvgIcon, size = 20, strokeWidth = 2, title }: IconProps) {
  return (
    <IconWrapper aria-hidden={title ? undefined : true} title={title}>
      <SvgIcon size={size} strokeWidth={strokeWidth} />
    </IconWrapper>
  );
}

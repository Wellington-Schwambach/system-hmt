import { HENRIQUE_TRANSPORTES_LOGO } from '../../../../constants/assets';
import { BrandLogo, BrandWrapper } from './styles';
import type { BrandProps } from './types';

export function Brand({ compact = false }: BrandProps) {
  return (
    <BrandWrapper $compact={compact} aria-label="Henrique Transportes">
      <BrandLogo src={HENRIQUE_TRANSPORTES_LOGO} alt="Henrique Transportes" $compact={compact} />
    </BrandWrapper>
  );
}

import { Icon } from '../../../../components/Icon';
import {
  FeatureContainer,
  FeatureContent,
  FeatureDescription,
  FeatureIcon,
  FeatureTitle,
} from './styles';
import type { FeatureItemProps } from './types';

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <FeatureContainer>
      <FeatureIcon>
        <Icon icon={icon} size={24} strokeWidth={2} />
      </FeatureIcon>

      <FeatureContent>
        <FeatureTitle>{title}</FeatureTitle>
        <FeatureDescription>{description}</FeatureDescription>
      </FeatureContent>
    </FeatureContainer>
  );
}

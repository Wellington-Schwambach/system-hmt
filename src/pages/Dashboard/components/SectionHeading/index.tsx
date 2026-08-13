import type { SectionHeadingProps } from './types';
import { Heading, Subtitle, Title } from './styles';

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <Heading>
      <Title>{title}</Title>
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
    </Heading>
  );
}

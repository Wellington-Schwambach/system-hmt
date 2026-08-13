import { ArrowUpRight } from 'lucide-react';

import type { MetricCardProps } from './types';
import {
  Caption,
  Card,
  CardHeader,
  ClickableCard,
  IconWrapper,
  Title,
  TrendIcon,
  Value,
} from './styles';

export function MetricCard({ metric, onNavigate }: MetricCardProps) {
  const Icon = metric.icon;
  const targetPath = metric.path;
  const isClickable = Boolean(targetPath && onNavigate);

  const content = (
    <>
      <CardHeader>
        <IconWrapper>
          <Icon size={23} strokeWidth={2.1} aria-hidden="true" />
        </IconWrapper>
        <TrendIcon aria-hidden="true">
          <ArrowUpRight size={18} />
        </TrendIcon>
      </CardHeader>
      <Title>{metric.title}</Title>
      <Value>{metric.value}</Value>
      <Caption>{metric.caption}</Caption>
    </>
  );

  if (isClickable && targetPath && onNavigate) {
    return (
      <ClickableCard
        type="button"
        $isClickable
        onClick={() => onNavigate(targetPath)}
        aria-label={`Abrir ${metric.title}`}
      >
        {content}
      </ClickableCard>
    );
  }

  return <Card $isClickable={false}>{content}</Card>;
}

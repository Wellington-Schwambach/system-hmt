import type { FuelSummaryCardProps } from './types';
import { Card, IconBox, Value } from './styles';

export function FuelSummaryCard({ label, value, icon: Icon }: FuelSummaryCardProps) {
  return (
    <Card aria-label={`${label}: ${value}`} title={label}>
      <IconBox>
        <Icon size={20} aria-hidden="true" />
      </IconBox>
      <Value>{value}</Value>
    </Card>
  );
}

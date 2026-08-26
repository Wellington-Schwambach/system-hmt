import type { FuelSummaryCardProps } from './types';
import { Card, CardAction, Content, IconBox, Label, Value } from './styles';

export function FuelSummaryCard({ label, value, icon: Icon, action }: FuelSummaryCardProps) {
  return (
    <Card aria-label={`${label}: ${value}`} title={label}>
      {action ? <CardAction>{action}</CardAction> : null}
      <IconBox>
        <Icon size={19} aria-hidden="true" />
      </IconBox>
      <Content>
        <Label>{label}</Label>
        <Value>{value}</Value>
      </Content>
    </Card>
  );
}

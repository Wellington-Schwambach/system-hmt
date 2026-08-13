import type { TravelSummaryCardProps } from './types';
import { Breakdown, BreakdownItem, Card, Helper, IconBox, Label, Value } from './styles';

export function TravelSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  breakdown,
}: TravelSummaryCardProps) {
  return (
    <Card>
      <IconBox>
        <Icon size={20} aria-hidden="true" />
      </IconBox>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {breakdown?.length ? (
        <Breakdown>
          {breakdown.map((item) => (
            <BreakdownItem key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </BreakdownItem>
          ))}
        </Breakdown>
      ) : helper ? (
        <Helper>{helper}</Helper>
      ) : null}
    </Card>
  );
}

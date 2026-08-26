import type { TravelSummaryCardProps } from './types';
import {
  Breakdown,
  BreakdownItem,
  Card,
  CardAction,
  Helper,
  IconBox,
  Label,
  Value,
  ValueBreakdownRow,
} from './styles';

export function TravelSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  breakdown,
  action,
}: TravelSummaryCardProps) {
  return (
    <Card>
      {action ? <CardAction>{action}</CardAction> : null}
      <IconBox>
        <Icon size={20} aria-hidden="true" />
      </IconBox>
      <Label>{label}</Label>
      {breakdown?.length ? (
        <ValueBreakdownRow>
          <Value>{value}</Value>
          <Breakdown>
            {breakdown.map((item) => (
              <BreakdownItem key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </BreakdownItem>
            ))}
          </Breakdown>
        </ValueBreakdownRow>
      ) : (
        <>
          <Value>{value}</Value>
          {helper ? <Helper>{helper}</Helper> : null}
        </>
      )}
    </Card>
  );
}

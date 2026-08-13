import { getFuelStatusLabel } from '../../utils';
import type { FuelStatusBadgeProps } from './types';
import { Badge, Dot } from './styles';

export function FuelStatusBadge({ status }: FuelStatusBadgeProps) {
  return (
    <Badge $status={status} title={`Status ${status}: ${getFuelStatusLabel(status)}`}>
      <Dot />
      {getFuelStatusLabel(status)}
    </Badge>
  );
}

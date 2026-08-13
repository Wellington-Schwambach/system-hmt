import { getVehicleStatusLabel } from '../../utils';
import type { VehicleStatusBadgeProps } from './types';
import { Badge, Dot } from './styles';

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  return (
    <Badge $status={status}>
      <Dot aria-hidden="true" />
      {getVehicleStatusLabel(status)}
    </Badge>
  );
}

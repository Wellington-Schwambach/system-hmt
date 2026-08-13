import { getShipperLabel } from '../../utils';
import type { ShipperBadgeProps } from './types';
import { Badge } from './styles';

export function ShipperBadge({ shipper }: ShipperBadgeProps) {
  return <Badge $shipper={shipper}>{getShipperLabel(shipper)}</Badge>;
}

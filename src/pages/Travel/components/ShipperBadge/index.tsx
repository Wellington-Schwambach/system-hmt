import { getShipperLabel } from '../../utils';
import type { ShipperBadgeProps } from './types';
import { Badge } from './styles';

function contrastText(hex: string): string {
  const value = hex.replace('#', '');
  if (value.length !== 6) return '#FFFFFF';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 165 ? '#172235' : '#FFFFFF';
}

export function ShipperBadge({ shipper, color = '#009E60' }: ShipperBadgeProps) {
  return <Badge $background={color} $foreground={contrastText(color)}>{getShipperLabel(shipper)}</Badge>;
}

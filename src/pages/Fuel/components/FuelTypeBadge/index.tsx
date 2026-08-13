import { Droplets, Fuel } from 'lucide-react';

import { getFuelTypeLabel } from '../../utils';
import type { FuelTypeBadgeProps } from './types';
import { Badge } from './styles';

export function FuelTypeBadge({ type }: FuelTypeBadgeProps) {
  const Icon = type === 'DIESEL' ? Fuel : Droplets;

  return (
    <Badge $type={type}>
      <Icon size={14} aria-hidden="true" />
      {getFuelTypeLabel(type)}
    </Badge>
  );
}

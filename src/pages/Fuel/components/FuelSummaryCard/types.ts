import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FuelSummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  action?: ReactNode;
}

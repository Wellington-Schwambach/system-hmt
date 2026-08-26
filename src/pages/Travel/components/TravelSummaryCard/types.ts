import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TravelSummaryCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  breakdown?: Array<{ label: string; value: string }>;
  action?: ReactNode;
}

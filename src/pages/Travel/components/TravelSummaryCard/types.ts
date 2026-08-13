import type { LucideIcon } from 'lucide-react';

export interface TravelSummaryCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  breakdown?: Array<{ label: string; value: string }>;
}

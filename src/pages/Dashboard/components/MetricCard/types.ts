import type { DashboardMetric } from '../../types';

export interface MetricCardProps {
  metric: DashboardMetric;
  onNavigate?: (path: string) => void;
}

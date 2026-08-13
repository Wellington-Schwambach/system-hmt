import { getEmployeeStatusLabel } from '../../utils';
import type { EmployeeStatusBadgeProps } from './types';
import { Badge, Dot } from './styles';

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return (
    <Badge $status={status}>
      <Dot aria-hidden="true" />
      {getEmployeeStatusLabel(status)}
    </Badge>
  );
}

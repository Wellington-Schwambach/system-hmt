import styled from 'styled-components';

import type { EmployeeStatus } from '../../types';

const STATUS_COLORS: Record<EmployeeStatus, { color: string; background: string; border: string }> =
  {
    ACTIVE: {
      color: '#04763d',
      background: '#e9f9f0',
      border: '#bcebd0',
    },
    LEAVE: {
      color: '#9a6700',
      background: '#fff8df',
      border: '#f2dfa1',
    },
    INACTIVE: {
      color: '#a53b3b',
      background: '#fff0f0',
      border: '#f3c5c5',
    },
  };

export const Badge = styled.span<{ $status: EmployeeStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid ${({ $status }) => STATUS_COLORS[$status].border};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $status }) => STATUS_COLORS[$status].color};
  background: ${({ $status }) => STATUS_COLORS[$status].background};
  font-size: 0.66rem;
  font-weight: 850;
  white-space: nowrap;
`;

export const Dot = styled.span`
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: currentColor;
`;
